const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user
  .findFirst({ select: { id: true, email: true }, orderBy: { createdAt: 'asc' } })
  .then((u) => {
    console.log('USER_ID=' + (u ? u.id : 'NONE'));
    console.log('USER_EMAIL=' + (u ? u.email : ''));
    return p.$disconnect();
  })
  .catch((e) => {
    console.error('ERR', e.message);
    process.exit(1);
  });
