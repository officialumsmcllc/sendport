import { NextRequest, NextResponse } from "next/server";
import { scanEmailLinks } from "@/lib/deliverability/link-checker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const html = body.html || body.content || "";

    if (!html) {
      return NextResponse.json(
        { error: "BadRequest", message: "HTML content is required for link checking" },
        { status: 400 }
      );
    }

    const report = scanEmailLinks(html);

    return NextResponse.json({
      object: "link_checker_report",
      ...report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "InternalServerError", message: error.message },
      { status: 500 }
    );
  }
}
