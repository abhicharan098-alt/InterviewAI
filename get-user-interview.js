const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.interview.findFirst({where: {status: 'COMPLETED'}}).then(u => {
  console.log("USER_ID:", u?.userId);
  prisma.$disconnect();
});
