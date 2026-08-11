const { PrismaClient } = require('@prisma/client');
const userId = process.argv[2];
if (!userId) { console.error('usage: node count-user-resumes.cjs <userId>'); process.exit(1); }
const p = new PrismaClient();
p.resume
  .count({ where: { userId } })
  .then((n) => {
    console.log('RESUME_COUNT=' + n);
    return p.$disconnect();
  })
  .catch((e) => {
    console.error('ERR', e.message);
    process.exit(1);
  });
