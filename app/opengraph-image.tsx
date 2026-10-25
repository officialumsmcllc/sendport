import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sendport — The Developer-First Email Delivery Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.25) 0%, rgba(0, 0, 0, 1) 70%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* Glow ambient circle */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top Developer Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            fontSize: "16px",
            fontWeight: 600,
            color: "#38bdf8",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#34d399",
            }}
          />
          <span>Next-Gen Transactional Email Infrastructure</span>
        </div>

        {/* Brand Logo & Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {/* Logo Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              backgroundColor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(37, 99, 235, 0.6)",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="#ffffff" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            GetSendport
          </span>
        </div>

        {/* Main Headline */}
        <div
          style={{
            fontSize: "44px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.2,
            marginBottom: "28px",
            color: "#f8fafc",
          }}
        >
          Email for Developers.
          <span style={{ color: "#38bdf8", marginLeft: "12px" }}>
            Delivered to Inboxes.
          </span>
        </div>

        {/* Feature Badges Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              fontSize: "15px",
              color: "#94a3b8",
            }}
          >
            <span style={{ color: "#34d399", fontWeight: "bold" }}>✓</span> 2048-bit RSA DKIM
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              fontSize: "15px",
              color: "#94a3b8",
            }}
          >
            <span style={{ color: "#34d399", fontWeight: "bold" }}>✓</span> Sub-10ms API Speed
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              fontSize: "15px",
              color: "#94a3b8",
            }}
          >
            <span style={{ color: "#34d399", fontWeight: "bold" }}>✓</span> SPF & DMARC Aligned
          </div>
        </div>

        {/* Domain footer URL */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "14px",
            fontFamily: "monospace",
            color: "#64748b",
            letterSpacing: "0.08em",
          }}
        >
          GETSENDPORT.COM
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
