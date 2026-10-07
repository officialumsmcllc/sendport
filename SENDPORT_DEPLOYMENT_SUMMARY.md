# 🚀 Sendport — Complete Project & Deployment Summary

**Project Name:** Sendport (The Developer-First Email Delivery & Transactional API Platform)  
**Production Domain:** [https://getsendport.com](https://getsendport.com)  
**Render Service URL:** `https://sendport-5ifl.onrender.com`  
**GitHub Repository:** [https://github.com/officialumsmcllc/sendport](https://github.com/officialumsmcllc/sendport)  
**Date Created:** October 5, 2026  

---

## 📋 1. GitHub Repository & Git Setup

* **Repository:** `officialumsmcllc/sendport` (Public)
* **Default Branch:** `main`
* **Git Commit History:**
  1. `dbddf6d` — Initial commit of Sendport SaaS codebase (97 files)
  2. `d93b953` — Add `render.yaml` Blueprint specification
  3. `45a5ab9` — Add auto-admin database seeder (`prisma/seed.js`)
  4. `aabc3f2` — Add automatic Welcome and Password Reset email sending via SMTP
  5. `fa749e9` — Upgrade Render blueprint plan to starter ($7/mo)
  6. `11e7c80` — Add dedicated 200 OK `/api/health` endpoint for Render healthcheck

---

## 🌐 2. Cloudflare Configuration & DNS Setup

* **Cloudflare Account:** `Hello@officialum1.com's Account` (`ea4c710ba763ca7d4c56bb2f429f19af`)
* **Cloudflare Zone ID for `getsendport.com`:** `bc0f1c55ff7dd2e1cd8f0d208d3b94d1`
* **Domain Registrar:** Spaceship, Inc.

### Cloudflare Assigned Nameservers:
1. `megan.ns.cloudflare.com`
2. `ricardo.ns.cloudflare.com`

### Configured DNS Records on Cloudflare:
| Type | Name | Content / Target | Proxy Status | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `@` (`getsendport.com`) | `sendport-5ifl.onrender.com` | DNS Only (Ready for Proxy) | Web traffic to Render |
| **CNAME** | `www` | `sendport-5ifl.onrender.com` | DNS Only (Ready for Proxy) | Subdomain traffic to Render |
| **TXT** | `@` | `v=spf1 a mx ~all` | — | SPF Email Authentication |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; sp=none; rua=mailto:dmarc@getsendport.com` | — | DMARC Email Security Policy |

---

## 🗄️ 3. Cloud Database (Supabase PostgreSQL)

* **Platform:** Supabase (Managed PostgreSQL)
* **Project Reference:** `wdmhfrbygqrcjxebjlrk`
* **Dashboard URL:** [https://supabase.com/dashboard/project/wdmhfrbygqrcjxebjlrk](https://supabase.com/dashboard/project/wdmhfrbygqrcjxebjlrk)
* **Status:** Connected & In-Sync
* **Tables Created:** `User`, `Workspace`, `WorkspaceMember`, `Domain`, `ApiKey`, `EmailLog`, `TrackingEvent`, `EmailTemplate`, `TemplateFolder`, `Audience`, `Contact`, `Webhook`, `WebhookDeliveryLog`, `Suppression`, `Subscription`, `PaymentTransaction`, `AuditLog`
* **Data Persistence:** 100% Persistent across all redeploys, restarts, and branch pushes.

---

## 🛠️ 4. Render.com Blueprint & Deployment

* **Deployment Type:** Render Infrastructure-as-Code Blueprint (`render.yaml`)
* **Compute Plan:** **Starter ($7 / month)** — Always-on, 512MB RAM, 0.5 CPU, no cold starts.
* **Build Command:** `npm install && npx prisma db push && node prisma/seed.js && npm run build`
* **Start Command:** `npm run start`
* **Health Check Path:** `/api/health` (Returns HTTP 200 `{ status: "ok" }`)
* **Custom Domain Status:** Verified on Render with automatic SSL Certificate issuing.

---

## 👑 5. Admin Panel & Authentication Credentials

* **Admin Panel Route:** `/admin`
* **Login URL:** `/login`

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@getsendport.com` | `AdminPassword2026!` | Full Master Admin, Manual Payment Approvals, Auto Quota Upgrades |

---

## 📬 5. Email Dispatching & Delivery System

1. **System Engine:** 2048-bit RSA DKIM Signing Engine with automated SPF & DMARC verification.
2. **User Registration:** Triggers welcome email to new registered users.
3. **Password Recovery:** 
   - Generates secure 6-digit OTP code.
   - Automatically delivers OTP code to the user's email inbox.
   - Also displays recovery code in UI as a fallback.
4. **Sender Identity:** `noreply@getsendport.com` & `Sendport Security`.

---

## 🔐 6. Environment Variables (`.env`)

```ini
# Application Configuration
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="https://getsendport.com"
NEXT_PUBLIC_SITE_NAME="Sendport"
NEXT_PUBLIC_SITE_DOMAIN="getsendport.com"
JWT_SECRET="sendport_enterprise_jwt_secret_key_2026"

# Optional Upstream SMTP Relay
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER=""
SMTP_PASS=""

# Optional Payment Gateways
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

---

## 🧭 7. Quick Operations Guide

### To view admin payment receipts & manual slips:
1. Log in at `https://getsendport.com/login` using `admin@getsendport.com` / `AdminPassword2026!`.
2. Go to **Admin Panel** in the sidebar.
3. Approve or reject Easypaisa, JazzCash, USDT, or Wire transfer slips with one click.

### To push new changes from local machine:
```bash
git add .
git commit -m "Your update description"
git push origin main
```
Render will automatically detect new commits and deploy them seamlessly.
