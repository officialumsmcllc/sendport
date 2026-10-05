import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getCurrentUser } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
