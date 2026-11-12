
import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("cryptomus=167b0546", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

