const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const count = await prisma.session.count();
  console.log("Session count in DB:", count);
  await prisma.$disconnect();
}
run();
