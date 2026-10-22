import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://getsendport:W6q0nB9dEcusuWystP3goh9BDPJ6gs72@dpg-dbd7gmrncjis73bd5vpg-a.oregon-postgres.render.com/getsendport",
    },
  },
});

async function main() {
  console.log("Applying schema updates to Render Postgres...");
  await db.$executeRawUnsafe(`
    DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "credits" INTEGER NOT NULL DEFAULT 0;
      EXCEPTION WHEN others THEN NULL;
      END;

      BEGIN
        ALTER TABLE "PaymentTransaction" ADD COLUMN IF NOT EXISTS "isCreditTopup" BOOLEAN NOT NULL DEFAULT false;
      EXCEPTION WHEN others THEN NULL;
      END;

      BEGIN
        ALTER TABLE "PaymentTransaction" ADD COLUMN IF NOT EXISTS "creditsPurchased" INTEGER;
      EXCEPTION WHEN others THEN NULL;
      END;

      BEGIN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT true;
      EXCEPTION WHEN others THEN NULL;
      END;

      BEGIN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationCode" TEXT;
      EXCEPTION WHEN others THEN NULL;
      END;

      BEGIN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationExpires" TIMESTAMP;
      EXCEPTION WHEN others THEN NULL;
      END;

      -- Subscription / Plan Expiry columns
      BEGIN
        ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMP;
      EXCEPTION WHEN others THEN NULL;
      END;

      BEGIN
        ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "isPlanExpired" BOOLEAN NOT NULL DEFAULT false;
      EXCEPTION WHEN others THEN NULL;
      END;

      -- Mark existing accounts as verified
      BEGIN
        UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL;
      EXCEPTION WHEN others THEN NULL;
      END;
    END $$;
  `);

  console.log("Schema sync complete!");

  const users = await db.user.findMany({
    include: {
      workspaces: {
        include: {
          workspace: {
            include: {
              audiences: {
                include: {
                  contacts: true,
                },
              },
            },
          },
        },
      },
    },
  });

  console.log("Found users & audiences:");
  for (const u of users) {
    console.log(`User: ${u.email}`);
    for (const w of u.workspaces) {
      console.log(`  Workspace: ${w.workspace.name} (${w.workspace.id})`);
      for (const a of w.workspace.audiences) {
        console.log(`    Audience: ${a.name} (${a.id}) -> ${a.contacts.length} contacts`);
      }
    }
  }
}

main().catch(console.error).finally(() => db.$disconnect());
