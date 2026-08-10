const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.resume.deleteMany({ where: { status: 'FAILED' } });
  console.log('Cleaned up FAILED records');
}
main().finally(() => prisma.$disconnect());
