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

          BEGIN
            ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "bimiSelector" TEXT NOT NULL DEFAULT 'default';
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "bimiRecord" TEXT;
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "bimiSvgContent" TEXT;
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "bimiStatus" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED';
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "isBimiValid" BOOLEAN NOT NULL DEFAULT false;
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            CREATE TABLE IF NOT EXISTS "AppSumoRedemption" (
              "id" TEXT PRIMARY KEY,
              "code" TEXT UNIQUE NOT NULL,
              "tier" INTEGER NOT NULL DEFAULT 1,
              "userId" TEXT,
              "workspaceId" TEXT,
              "redeemedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
          EXCEPTION WHEN others THEN NULL;
          END;

          -- Automatically verify legacy/existing accounts so existing owners aren't locked out
          BEGIN
            UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false AND "verificationCode" IS NULL;
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            UPDATE "PaymentMethodConfig" SET "accountTitle" = 'Sendport Technologies LLC' WHERE "accountTitle" LIKE '%Official UM1%';
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            UPDATE "PaymentMethodConfig" SET "accountTitle" = 'Sendport Treasury' WHERE "accountTitle" LIKE '%Official TRC20%';
          EXCEPTION WHEN others THEN NULL;
          END;

          BEGIN
            UPDATE "PaymentMethodConfig" SET "isActive" = false;
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
