const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = "admin@getsendport.com";
  const defaultPassword = "AdminPassword2026!";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const passwordHash = hashPassword(defaultPassword);
    const user = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        passwordHash: passwordHash,
        role: "ADMIN",
      },
    });

    await prisma.workspace.create({
      data: {
        name: "Admin Master Workspace",
        slug: "admin-workspace",
        plan: "SCALE_PRO",
        dailyQuota: 50000,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    console.log(`✅ Default Admin created: ${adminEmail} / ${defaultPassword}`);
  } else {
    console.log(`ℹ️ Admin ${adminEmail} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
