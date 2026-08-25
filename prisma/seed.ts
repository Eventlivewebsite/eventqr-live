import "dotenv/config";

import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword || adminPassword.length < 16) {
    throw new Error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (minimum 16 characters) must be configured before seeding."
    );
  }

  const exists = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (exists) {
    console.log("✅ Super Admin already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log("🎉 Super Admin Created Successfully");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });