const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const resume = await prisma.resume.findFirst({ orderBy: { uploadedAt: 'desc' }});
  console.log('Status:', resume.status);
  console.log('rawText length:', resume.rawText?.length);
  console.log('parsedData:', resume.parsedData);
}

main().finally(() => prisma.$disconnect());
