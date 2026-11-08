// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyCryptomusWebhookSignature, getCryptomusCredentials } from "@/lib/payments/cryptomus";
import { activatePaymentOrder } from "@/lib/payments/activation";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const incomingSignature = req.headers.get("sign");
    const { apiKey } = await getCryptomusCredentials();

    // 1. Signature Verification
    if (apiKey) {
      const isValid = verifyCryptomusWebhookSignature(rawBody, incomingSignature || "", apiKey);
      if (!isValid) {
        console.warn("[CRYPTOMUS_WEBHOOK_WARN]: Invalid signature received on webhook.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("[CRYPTOMUS_WEBHOOK_NOTICE]: Processing webhook without CRYPTOMUS_API_KEY verification in sandbox mode.");
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (_) {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const { order_id, status, uuid, currency, network, payment_amount } = payload;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id in webhook payload" }, { status: 400 });
    }

    console.log(`[CRYPTOMUS_WEBHOOK_EVENT]: Order [${order_id}] Status: [${status}] UUID: [${uuid}]`);

    // 2. Lookup Transaction in Database (by transaction id or Cryptomus invoice uuid)
    const tx = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { id: order_id },
          { referenceId: order_id },
          ...(uuid ? [{ referenceId: uuid }] : []),
        ],
      },
    });

    if (!tx) {
      console.warn(`[CRYPTOMUS_WEBHOOK_WARN]: Transaction '${order_id}' not found in database.`);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 3. Handle Successful Blockchain Confirmation
    if (status === "paid" || status === "paid_over") {
      const approvalNotes = `Cryptomus Blockchain Confirmed: ${payment_amount || ""} ${currency || "USDT"} (${network || "Web3"}). UUID: ${uuid}`;
      const activation = await activatePaymentOrder(tx.id, approvalNotes);

      if (!activation.success) {
        console.error(`[CRYPTOMUS_ACTIVATION_FAILED] for ${order_id}:`, activation.error);
        return NextResponse.json({ error: activation.error }, { status: 500 });
      }

      console.log(`✅ [CRYPTOMUS_SUCCESS] Order ${order_id} activated instantly! Plan: ${tx.plan}`);
      return NextResponse.json({ status: "ok", message: "Order activated successfully" });
    }

    // 4. Handle Cancelled or Expired Invoices
    if (status === "cancel" || status === "system_fail" || status === "wrong_amount") {
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "REJECTED",
          adminNotes: `Cryptomus failed with status '${status}'. UUID: ${uuid}`,
        },
      });
      return NextResponse.json({ status: "cancelled", message: `Transaction marked as ${status}` });
    }

    // 5. Processing / Unconfirmed States
    return NextResponse.json({ status: "acknowledged", message: `Payment state '${status}' recorded.` });
  } catch (err: any) {
    console.error("[CRYPTOMUS_WEBHOOK_FATAL]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
