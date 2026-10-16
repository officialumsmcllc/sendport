=== Sendport SMTP & Email Deliverability ===
Contributors: officialum1, sendport, officialumsmcllc
Donate link: https://getsendport.com
Tags: smtp, email, deliverability, transactional email, woocommerce smtp
Requires at least: 5.6
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Ultra-fast, 99.9% inbox deliverability for WordPress & WooCommerce powered by Sendport REST API and 2048-bit RSA DKIM.

== Description ==

**Sendport SMTP & Email Deliverability** solves the #1 problem facing WordPress website owners and WooCommerce merchants: **emails getting lost or landing in spam.**

Whether you are sending WooCommerce order confirmations, password reset links, contact form notifications (Contact Form 7, WPForms, Gravity Forms, Elementor Forms, Ninja Forms), or user activation emails, Sendport routes your emails through our developer-first, high-throughput delivery cluster with automated 2048-bit RSA DKIM cryptographic signatures and verified SPF.

### Why Website Owners & Agencies Switch to Sendport:
* **99.9% Inbox Placement:** Bypasses unreliable shared web hosting mail daemons (`mail()`) that get blacklisted on Gmail, Yahoo, and Outlook.
* **Ultra-Fast REST API Engine:** Sends emails over secure HTTPS REST API (Port 443) rather than legacy SMTP ports (25, 465, 587) which are often blocked by shared hosts like Bluehost, GoDaddy, SiteGround, and Namecheap.
* **WooCommerce Native Support:** Guarantees critical purchase receipts and order updates arrive in customer inboxes instantly.
* **Form Plugin Compatible:** Works seamlessly with WPForms, Contact Form 7, Fluent Forms, Formidable Forms, Gravity Forms, and Elementor.
* **Real-Time Analytics:** Optional tracking for open rates and link clicks right inside your Sendport Dashboard.
* **Free Tier Included:** 3,000 free transactional emails every month with non-expiring pay-as-you-go top-up options.

== Installation ==

### Automatic Installation:
1. Log in to your WordPress Admin dashboard.
2. Navigate to **Plugins > Add New**.
3. Search for **"Sendport SMTP"**.
4. Click **Install Now** and then **Activate**.
5. Go to **Settings > Sendport SMTP** and enter your Sendport API Key.

### Manual Installation:
1. Download the `sendport-smtp.zip` archive.
2. In your WordPress dashboard, go to **Plugins > Add New > Upload Plugin**.
3. Select the `.zip` file and click **Install Now**.
4. Click **Activate Plugin**.
5. Navigate to **Settings > Sendport SMTP** in your WordPress sidebar.
6. Paste your API Key from [Sendport Dashboard](https://getsendport.com/dashboard/api-keys) and save.

== Frequently Asked Questions ==

= Where do I get my Sendport API Key? =
You can generate your live production API Key in 10 seconds by logging into your [Sendport Dashboard](https://getsendport.com/dashboard/api-keys).

= Does Sendport work with WooCommerce? =
Yes! Sendport automatically intercepts all `wp_mail()` calls dispatched by WooCommerce, including customer invoices, order completed notifications, and refund alerts.

= Do I need to open SMTP ports on my hosting firewall? =
No. Sendport transmits emails securely over standard HTTPS (Port 443) via our REST API. You will never encounter port 25 or 587 firewall blocks.

= Is my sending domain verified? =
To ensure maximum deliverability and avoid DMARC failures, register your domain in [Sendport Domains](https://getsendport.com/dashboard/domains) and add the provided DKIM and SPF DNS records.

= How much does Sendport cost? =
Sendport includes a generous Starter plan offering 3,000 emails/month free. High-volume senders can upgrade to affordable plans or purchase non-expiring credit packs ($10 for 10,000 emails).

== Screenshots ==

1. Sendport SMTP Settings — Configure your API credentials, sending identity, and analytics tracking.
2. Live Deliverability Test — Send an instant verified test email to confirm 2048-bit DKIM delivery.

== Changelog ==

= 1.0.0 =
* Initial official release for WordPress.org directory.
* High-speed REST API email delivery engine.
* Native WooCommerce and contact form compatibility.
* Real-time open and click tracking preferences.
* Live deliverability test interface.
