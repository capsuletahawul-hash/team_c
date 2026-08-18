import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const rows = await prisma.$queryRawUnsafe(
    'SELECT DISTINCT "role" FROM "User" ORDER BY "role"'
  );

  console.log(rows);
} finally {
  await prisma.$disconnect();
}