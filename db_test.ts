import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log('DATABASE_CONNECTION_OK');
}
main()
  .catch(e => {
    console.error('DATABASE_CONNECTION_FAILED');
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
