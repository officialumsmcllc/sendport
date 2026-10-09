import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify audience belongs to this workspace
    const audience = await prisma.audience.findFirst({
      where: {
        id,
        workspaceId: auth.workspace.id,
      },
    });

    if (!audience) {
      return NextResponse.json({ error: "Audience not found in your workspace" }, { status: 404 });
    }

    const contacts = await prisma.contact.findMany({
      where: { audienceId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      object: "list",
      data: contacts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: audienceId } = await params;

    const audience = await prisma.audience.findFirst({
      where: {
        id: audienceId,
        workspaceId: auth.workspace.id,
      },
    });

    if (!audience) {
      return NextResponse.json({ error: "Audience not found in your workspace" }, { status: 404 });
    }

    const body = await req.json();

    // Check for bulk contacts
    if (Array.isArray(body.contacts)) {
      const createdContacts = [];
      for (const item of body.contacts) {
        if (!item.email || !item.email.includes("@")) continue;
        const normalizedEmail = item.email.toLowerCase().trim();

        // Check if exists for Smart Merge
        const existing = await prisma.contact.findUnique({
          where: {
            audienceId_email: {
              audienceId,
              email: normalizedEmail,
            },
          },
        });

        let incomingTags = Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === "string" && item.tags.trim()
          ? [item.tags.trim()]
          : [];

        let finalTags = incomingTags;
        if (existing && existing.tags) {
          try {
            const parsedOld = JSON.parse(existing.tags);
            if (Array.isArray(parsedOld)) {
              finalTags = Array.from(new Set([...parsedOld, ...incomingTags]));
            }
          } catch (e) {}
        }

        const contact = await prisma.contact.upsert({
          where: {
            audienceId_email: {
              audienceId,
              email: normalizedEmail,
            },
          },
          update: {
            ...(item.firstName || item.first_name ? { firstName: item.firstName || item.first_name } : {}),
            ...(item.lastName || item.last_name ? { lastName: item.lastName || item.last_name } : {}),
            tags: finalTags.length > 0 ? JSON.stringify(finalTags) : undefined,
          },
          create: {
            audienceId,
            email: normalizedEmail,
            firstName: item.firstName || item.first_name || null,
            lastName: item.lastName || item.last_name || null,
            tags: finalTags.length > 0 ? JSON.stringify(finalTags) : null,
          },
        });
        createdContacts.push(contact);
      }

      return NextResponse.json({
        object: "bulk_contacts_created",
        count: createdContacts.length,
        contacts: createdContacts,
      });
    }

    // Single Contact
    const { email, firstName, lastName, tags, customData } = body;
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "BadRequest", message: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.contact.findUnique({
      where: {
        audienceId_email: {
          audienceId,
          email: normalizedEmail,
        },
      },
    });

    let incomingTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.trim()
      ? [tags.trim()]
      : [];

    let finalTags = incomingTags;
    if (existing && existing.tags) {
      try {
        const parsedOld = JSON.parse(existing.tags);
        if (Array.isArray(parsedOld)) {
          finalTags = Array.from(new Set([...parsedOld, ...incomingTags]));
        }
      } catch (e) {}
    }

    const contact = await prisma.contact.upsert({
      where: {
        audienceId_email: {
          audienceId,
          email: normalizedEmail,
        },
      },
      update: {
        firstName: firstName !== undefined ? firstName : existing?.firstName,
        lastName: lastName !== undefined ? lastName : existing?.lastName,
        tags: finalTags.length > 0 ? JSON.stringify(finalTags) : undefined,
        customData: customData ? JSON.stringify(customData) : undefined,
      },
      create: {
        audienceId,
        email: normalizedEmail,
        firstName: firstName || null,
        lastName: lastName || null,
        tags: finalTags.length > 0 ? JSON.stringify(finalTags) : null,
        customData: customData ? JSON.stringify(customData) : null,
      },
    });

    return NextResponse.json({
      object: "contact",
      data: contact,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: audienceId } = await params;
    const body = await req.json();
    const { contactId, unsubscribed, firstName, lastName, tags } = body;

    if (!contactId) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 });
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, audienceId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(unsubscribed !== undefined && { unsubscribed: Boolean(unsubscribed) }),
        ...(firstName !== undefined && { firstName: firstName?.trim() || null }),
        ...(lastName !== undefined && { lastName: lastName?.trim() || null }),
        ...(tags !== undefined && {
          tags: Array.isArray(tags)
            ? JSON.stringify(tags)
            : typeof tags === "string"
            ? JSON.stringify([tags])
            : null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: audienceId } = await params;
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");

    // Check if bulk deletion via body
    let bodyIds: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body?.ids)) {
        bodyIds = body.ids;
      }
    } catch (e) {}

    if (bodyIds.length > 0) {
      const result = await prisma.contact.deleteMany({
        where: {
          id: { in: bodyIds },
          audienceId,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} contacts deleted successfully.`,
        count: result.count,
      });
    }

    if (contactId) {
      await prisma.contact.deleteMany({
        where: {
          id: contactId,
          audienceId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Contact deleted successfully.",
      });
    }

    return NextResponse.json(
      { error: "Provide contactId query param or ids array in body." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
