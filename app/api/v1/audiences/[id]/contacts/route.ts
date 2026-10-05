import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { id: audienceId } = await params;
    const body = await req.json();

    // Check for single contact or bulk contacts
    if (Array.isArray(body.contacts)) {
      // Bulk Import
      const createdContacts = [];
      for (const item of body.contacts) {
        if (!item.email) continue;
        const contact = await prisma.contact.upsert({
          where: {
            audienceId_email: {
              audienceId,
              email: item.email.toLowerCase().trim(),
            },
          },
          update: {
            firstName: item.firstName || item.first_name,
            lastName: item.lastName || item.last_name,
            tags: item.tags ? JSON.stringify(item.tags) : undefined,
          },
          create: {
            audienceId,
            email: item.email.toLowerCase().trim(),
            firstName: item.firstName || item.first_name,
            lastName: item.lastName || item.last_name,
            tags: item.tags ? JSON.stringify(item.tags) : null,
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
    if (!email) {
      return NextResponse.json(
        { error: "BadRequest", message: "Email is required" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.upsert({
      where: {
        audienceId_email: {
          audienceId,
          email: email.toLowerCase().trim(),
        },
      },
      update: {
        firstName,
        lastName,
        tags: tags ? JSON.stringify(tags) : undefined,
        customData: customData ? JSON.stringify(customData) : undefined,
      },
      create: {
        audienceId,
        email: email.toLowerCase().trim(),
        firstName,
        lastName,
        tags: tags ? JSON.stringify(tags) : null,
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
