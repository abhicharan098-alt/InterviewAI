const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst().then(u => {
  console.log("USER_ID:", u?.id);
  prisma.$disconnect();
});
