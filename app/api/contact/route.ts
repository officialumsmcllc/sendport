import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: email, subject, and message are required." },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Generate unique Ticket ID e.g. SPT-58291
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `SPT-${randomSuffix}`;

    // Get client IP for audit
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    try {
      await prisma.supportTicket.create({
        data: {
          ticketNumber,
          name: name ? name.trim() : null,
          email: emailTrimmed,
          subject: subject.trim(),
          message: message.trim(),
          status: "NEW",
          priority: "NORMAL",
          ipAddress,
        },
      });
    } catch (dbErr: any) {
      console.error("[SUPPORT_TICKET_DB_NOTICE]", dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      ticketNumber,
      message: "Support ticket registered successfully.",
    });
  } catch (error: any) {
    console.error("[CONTACT_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to dispatch support message. Please try again." },
      { status: 500 }
    );
  }
}
