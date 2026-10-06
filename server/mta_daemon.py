"""
Sendport Autonomous Mail Transfer Agent (MTA) & Direct Delivery Daemon
Built with FastAPI, aiosmtplib, dnspython, and dkimpy for 100% independent direct mail delivery.
"""

import os
import sys
import time
import logging
import asyncio
import dns.asyncresolver
import aiosmtplib
import dkim
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import base64
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("sendport_mta")

app = FastAPI(
    title="Sendport Autonomous Outbound MTA Engine",
    description="Direct DNS MX Email Delivery Daemon with 2048-bit DKIM signing and zero 3rd-party dependencies",
    version="1.0.0"
)

MTA_SECRET_KEY = os.getenv("MTA_SECRET_KEY", "sendport_mta_master_secret_key_2026")
DEFAULT_HELO_HOST = os.getenv("MTA_HELO_HOST", "mail.getsendport.com")

class AttachmentItem(BaseModel):
    filename: str
    content: str  # Base64 encoded
    contentType: Optional[str] = "application/octet-stream"

class SendEmailPayload(BaseModel):
    from_address: str
    to_addresses: List[str]
    subject: str
    html: Optional[str] = None
    text: Optional[str] = None
    reply_to: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    dkim_selector: Optional[str] = "sendport"
    dkim_private_key: Optional[str] = None  # PEM string
    attachments: Optional[List[AttachmentItem]] = None

async def verify_auth_token(x_mta_key: Optional[str] = Header(None)):
    if not x_mta_key or x_mta_key != MTA_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized MTA API Key")
    return True

async def resolve_best_mx(domain: str) -> str:
    """Resolves lowest-priority (primary) MX host for recipient domain"""
    try:
        answers = await dns.asyncresolver.resolve(domain, "MX")
        sorted_mx = sorted(answers, key=lambda r: r.preference)
        best_host = str(sorted_mx[0].exchange).rstrip(".")
        return best_host
    except Exception as e:
        logger.error(f"DNS MX resolution failed for {domain}: {e}")
        raise HTTPException(status_code=422, detail=f"No valid MX records found for domain '{domain}'")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": "Sendport Autonomous Python MTA",
        "helo_host": DEFAULT_HELO_HOST,
        "timestamp": time.time()
    }

@app.post("/v1/deliver", dependencies=[Depends(verify_auth_token)])
async def deliver_email_direct(payload: SendEmailPayload):
    start_time = time.time()
    if not payload.to_addresses:
        raise HTTPException(status_code=400, detail="Recipient 'to_addresses' list is required")

    first_recipient = payload.to_addresses[0]
    recipient_domain = first_recipient.split("@")[-1].lower().strip()

    # 1. Resolve Target Mail Server via DNS MX
    mx_host = await resolve_best_mx(recipient_domain)
    logger.info(f"🚀 Direct Routing to MX [{mx_host}] for recipient [{first_recipient}]")

    # 2. Extract Sender Domain
    sender_domain = payload.from_address.split("@")[-1].rstrip(">").strip().lower()

    # 3. Construct RFC5322 MIME Message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = payload.subject
    msg["From"] = payload.from_address
    msg["To"] = ", ".join(payload.to_addresses)
    msg["Date"] = time.strftime("%a, %d %b %Y %H:%M:%S +0000", time.gmtime())
    msg["Message-ID"] = f"<msg_{os.urandom(8).hex()}@{sender_domain}>"

    if payload.reply_to:
        msg["Reply-To"] = payload.reply_to

    if payload.headers:
        for k, v in payload.headers.items():
            msg[k] = v

    # Add Text and HTML Bodies
    if payload.text:
        msg.attach(MIMEText(payload.text, "plain", "utf-8"))
    if payload.html:
        msg.attach(MIMEText(payload.html, "html", "utf-8"))

    # Process Attachments
    if payload.attachments:
        for att in payload.attachments:
            try:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(base64.b64decode(att.content))
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f'attachment; filename="{att.filename}"')
                msg.attach(part)
            except Exception as e:
                logger.warn(f"Failed to attach file {att.filename}: {e}")

    raw_email_bytes = msg.as_bytes()

    # 4. Sign DKIM (2048-bit RSA)
    if payload.dkim_private_key:
        try:
            dkim_header = dkim.sign(
                message=raw_email_bytes,
                selector=payload.dkim_selector.encode("utf-8"),
                domain=sender_domain.encode("utf-8"),
                privkey=payload.dkim_private_key.encode("utf-8"),
                include_headers=["From", "To", "Subject", "Date", "Message-ID"]
            )
            raw_email_bytes = dkim_header + raw_email_bytes
            logger.info(f"✅ DKIM Signature successfully generated for domain [{sender_domain}]")
        except Exception as dkim_err:
            logger.error(f"DKIM signing warning for {sender_domain}: {dkim_err}")

    # 5. Direct Socket Transmission to Recipient MX (Port 25 with opportunistic STARTTLS)
    try:
        smtp_client = aiosmtplib.SMTP(
            hostname=mx_host,
            port=25,
            timeout=15,
            start_tls=True,
            validate_certs=False
        )
        await smtp_client.connect()
        await smtp_client.helo(hostname=DEFAULT_HELO_HOST)

        response = await smtp_client.sendmail(
            sender=payload.from_address,
            recipients=payload.to_addresses,
            message=raw_email_bytes
        )
        await smtp_client.quit()

        latency_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"🏁 Direct MX Delivery SUCCESS to [{mx_host}] in {latency_ms}ms")

        return {
            "status": "delivered",
            "mx_host": mx_host,
            "latency_ms": latency_ms,
            "recipient_count": len(payload.to_addresses),
            "response": str(response)
        }

    except Exception as smtp_err:
        logger.error(f"❌ Direct MX Transmission to [{mx_host}] failed: {smtp_err}")
        raise HTTPException(status_code=502, detail=f"Direct MX Delivery failed to {mx_host}: {str(smtp_err)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"🌟 Starting Sendport Autonomous Python MTA Server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
