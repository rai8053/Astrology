import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const demoPassword = await bcrypt.hash("demo123", 12);

  // ✅ CREATE ADMIN USER
  const admin = await prisma.user.upsert({
    where: { email: "admin@somasurya.com" },
    update: {},
    create: {
      email: "admin@somasurya.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      emailVerified: true,
      birthDate: "1985-01-01",
      birthTime: "12:00",
      birthPlace: "New York, USA",
      timezone: "America/New_York",
      language: "en",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: "ENTERPRISE",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  // ✅ CREATE DEMO USER (For recruiters)
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@somasurya.com" },
    update: {},
    create: {
      email: "demo@somasurya.com",
      name: "Demo User",
      passwordHash: demoPassword,
      role: "PREMIUM",
      emailVerified: true,
      birthDate: "1990-05-15",
      birthTime: "10:30",
      birthPlace: "New York, USA",
      timezone: "America/New_York",
      language: "en",
      subscription: {
        create: {
          plan: "PREMIUM",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log("✅ Seed completed!");
  console.log("📌 Admin User:");
  console.log("   Email: admin@somasurya.com");
  console.log("   Password: admin123");
  console.log("");
  console.log("📌 Demo User (for recruiters):");
  console.log("   Email: demo@somasurya.com");
  console.log("   Password: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
