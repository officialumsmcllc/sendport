import { NextResponse } from "next/server";
import net from "net";

function probeTcpPort(host: string, port: number, timeoutMs = 7000): Promise<{
  host: string;
  port: number;
  open: boolean;
  latencyMs: number;
  banner?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let isResolved = false;
    let receivedData = "";

    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      // Connected successfully
    });

    socket.on("data", (chunk) => {
      receivedData += chunk.toString("utf8");
      if (!isResolved) {
        isResolved = true;
        const latencyMs = Date.now() - startTime;
        socket.destroy();
        resolve({
          host,
          port,
          open: true,
          latencyMs,
          banner: receivedData.trim(),
        });
      }
    });

    socket.on("timeout", () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve({
          host,
          port,
          open: false,
          latencyMs: Date.now() - startTime,
          error: "Connection timed out (Firewall dropped packet)",
        });
      }
    });

    socket.on("error", (err) => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve({
          host,
          port,
          open: false,
          latencyMs: Date.now() - startTime,
          error: err.message,
        });
      }
    });
  });
}

import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    const user = await getCurrentUser();
    if (!user || !isSuperAdminUser(user.email, user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Diagnostic endpoints are restricted to platform administrators." },
        { status: 403 }
      );
    }
  }

  const targets = [
    { host: "gmail-smtp-in.l.google.com", port: 25 },
    { host: "alt1.gmail-smtp-in.l.google.com", port: 25 },
    { host: "portquiz.net", port: 25 }, // Public generic Port 25 test server
    { host: "portquiz.net", port: 587 },
    { host: "portquiz.net", port: 465 },
    { host: "smtp.googlemail.com", port: 587 },
  ];

  const results = await Promise.all(
    targets.map((t) => probeTcpPort(t.host, t.port, 6000))
  );

  return NextResponse.json({
    status: "diagnostics_complete",
    timestamp: new Date().toISOString(),
    results,
  });
}
