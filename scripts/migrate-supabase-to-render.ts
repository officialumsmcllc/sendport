import { PrismaClient } from "@prisma/client";

const sourceUrl = "postgresql://postgres.wdmhfrbygqrcjxebjlrk:rf.%26HN%243im%23%2F2BK@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?connection_limit=5";
const targetUrl = "postgresql://getsendport:W6q0nB9dEcusuWystP3goh9BDPJ6gs72@dpg-dbd7gmrncjis73bd5vpg-a.oregon-postgres.render.com/getsendport";

const srcPrisma = new PrismaClient({
  datasources: { db: { url: sourceUrl } },
});

const tgtPrisma = new PrismaClient({
  datasources: { db: { url: targetUrl } },
});

async function migrateData() {
  console.log("🚀 [officialum1 Migration Suite] Starting database clone from Supabase to Render Postgres...");

  try {
    // 1. Fetch Users
    const users = await srcPrisma.user.findMany();
    console.log(`Found ${users.length} user(s) on Supabase.`);
    for (const u of users) {
      await tgtPrisma.user.upsert({
        where: { id: u.id },
        update: u,
        create: u,
      });
    }

    // 2. Fetch Workspaces
    const workspaces = await srcPrisma.workspace.findMany();
    console.log(`Found ${workspaces.length} workspace(s) on Supabase.`);
    for (const ws of workspaces) {
      await tgtPrisma.workspace.upsert({
        where: { id: ws.id },
        update: ws,
        create: ws,
      });
    }

    // 3. Workspace Members
    const members = await srcPrisma.workspaceMember.findMany();
    console.log(`Found ${members.length} workspace member relation(s).`);
    for (const m of members) {
      await tgtPrisma.workspaceMember.upsert({
        where: { id: m.id },
        update: m,
        create: m,
      });
    }

    // 4. Domains
    const domains = await srcPrisma.domain.findMany();
    console.log(`Found ${domains.length} domain(s).`);
    for (const d of domains) {
      await tgtPrisma.domain.upsert({
        where: { id: d.id },
        update: d,
        create: d,
      });
    }

    // 5. API Keys
    const apiKeys = await srcPrisma.apiKey.findMany();
    console.log(`Found ${apiKeys.length} API key(s).`);
    for (const k of apiKeys) {
      await tgtPrisma.apiKey.upsert({
        where: { id: k.id },
        update: k,
        create: k,
      });
    }

    // 6. Audiences
    const audiences = await srcPrisma.audience.findMany();
    console.log(`Found ${audiences.length} audience list(s).`);
    for (const a of audiences) {
      await tgtPrisma.audience.upsert({
        where: { id: a.id },
        update: a,
        create: a,
      });
    }

    // 7. Contacts (The 9 leads / subscribers)
    const contacts = await srcPrisma.contact.findMany();
    console.log(`Found ${contacts.length} contact(s).`);
    for (const c of contacts) {
      await tgtPrisma.contact.upsert({
        where: { id: c.id },
        update: c,
        create: c,
      });
    }

    // 8. Email Templates
    const templates = await srcPrisma.emailTemplate.findMany();
    console.log(`Found ${templates.length} email template(s).`);
    for (const t of templates) {
      await tgtPrisma.emailTemplate.upsert({
        where: { id: t.id },
        update: t,
        create: t,
      });
    }

    // 9. Suppressions
    const suppressions = await srcPrisma.suppression.findMany();
    console.log(`Found ${suppressions.length} suppression(s).`);
    for (const s of suppressions) {
      await tgtPrisma.suppression.upsert({
        where: { id: s.id },
        update: s,
        create: s,
      });
    }

    // 10. Subscriptions
    const subs = await srcPrisma.subscription.findMany();
    console.log(`Found ${subs.length} subscription(s).`);
    for (const sub of subs) {
      await tgtPrisma.subscription.upsert({
        where: { id: sub.id },
        update: sub,
        create: sub,
      });
    }

    // 11. Payments
    const payments = await srcPrisma.paymentTransaction.findMany();
    console.log(`Found ${payments.length} payment transaction(s).`);
    for (const p of payments) {
      await tgtPrisma.paymentTransaction.upsert({
        where: { id: p.id },
        update: p,
        create: p,
      });
    }

    console.log("✅ [officialum1 Migration Suite] ALL DATA SUCCESSFULLY CLONED TO RENDER POSTGRES!");
  } catch (err) {
    console.error("❌ Migration error:", err);
  } finally {
    await srcPrisma.$disconnect();
    await tgtPrisma.$disconnect();
  }
}

migrateData();
