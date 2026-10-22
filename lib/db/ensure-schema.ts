import { prisma } from "@/lib/db/prisma";

let schemaEnsured = false;
let schemaPromise: Promise<void> | null = null;

/**
 * Ensures critical database schema additions (such as Workspace.credits) exist in PostgreSQL
 * even if a manual migration or prisma db push was skipped during continuous deployment.
 */
export async function ensureDbSchema(): Promise<void> {
  if (schemaEnsured) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN 
          BEGIN
            ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "credits" INTEGER NOT NULL DEFAULT 0;
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMP;
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            ALTER TABLE "Workspace" ADD COLUMN IF NOT EXISTS "isPlanExpired" BOOLEAN NOT NULL DEFAULT false;
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
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
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

          -- Automatically verify legacy/existing accounts so existing owners aren't locked out
          BEGIN
            UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false AND "verificationCode" IS NULL;
          EXCEPTION WHEN others THEN NULL;
          END;
        END $$;
      `);
      schemaEnsured = true;
    } catch (err) {
      console.warn("[ensureDbSchema] Non-critical schema sync warning:", err);
    } finally {
      schemaPromise = null;
    }
  })();

  return schemaPromise;
}
