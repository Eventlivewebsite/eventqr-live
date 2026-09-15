require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("SUCCESS! Connected to Supabase via Driver Adapter. Users count:", userCount);
  } catch (err) {
    console.error("FAIL:", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();
