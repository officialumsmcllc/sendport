import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://getsendport:W6q0nB9dEcusuWystP3goh9BDPJ6gs72@dpg-dbd7gmrncjis73bd5vpg-a.oregon-postgres.render.com/getsendport",
    },
  },
});

async function main() {
  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Update Muhammad Umar Mumtaz's Workspace
  await db.workspace.update({
    where: { id: "cmuwm7e3n0003l62ba5i2emot" },
    data: {
      planExpiresAt: expiryDate,
      isPlanExpired: false,
    },
  });

  // Update younes's Workspace
  await db.workspace.update({
    where: { id: "cmvcu73z60004kt2a9lrane2f" },
    data: {
      planExpiresAt: expiryDate,
      isPlanExpired: false,
    },
  });

  // Update active subscriptions
  await db.subscription.updateMany({
    where: { status: "ACTIVE", expiresAt: null },
    data: { expiresAt: expiryDate },
  });

  console.log("Successfully set 30-day planExpiresAt for active workspaces!");
}

main().catch(console.error).finally(() => db.$disconnect());
