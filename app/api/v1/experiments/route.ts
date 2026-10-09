import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check count and seed if empty
    const count = await prisma.abExperiment.count({
      where: { workspaceId: auth.workspace.id },
    });

    if (count === 0) {
      await prisma.abExperiment.create({
        data: {
          workspaceId: auth.workspace.id,
          title: "Onboarding Welcome Subject Line Optimization",
          subjectA: "Welcome to Sendport 🚀 — Start dispatching in 60s",
          subjectB: "Your API Key and Getting Started Guide 🔑",
          split: 50,
          status: "ACTIVE",
          opensA: 42,
          opensB: 68,
          clicksA: 19,
          clicksB: 34,
        },
      });
    }

    const experiments = await prisma.abExperiment.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      object: "list",
      data: experiments,
    });
  } catch (error: any) {
    console.error("Experiments GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, subjectA, subjectB, split = 50 } = body;

    if (!title || !subjectA || !subjectB) {
      return NextResponse.json(
        { error: "BadRequest", message: "Title, Subject A, and Subject B are required." },
        { status: 400 }
      );
    }

    const experiment = await prisma.abExperiment.create({
      data: {
        workspaceId: auth.workspace.id,
        title: title.trim(),
        subjectA: subjectA.trim(),
        subjectB: subjectB.trim(),
        split: Number(split) || 50,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "A/B Experiment created in PostgreSQL successfully",
      experiment,
    });
  } catch (error: any) {
    console.error("Experiment Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
