import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const uid = '992cb4c6-32e3-47ac-8af2-7a15c532a099';
  
  const interviews = await prisma.interview.findMany({ where: { userId: uid } });
  const practices = await prisma.practiceAttempt.findMany({ where: { userId: uid } });
  const answers = await prisma.interviewAnswer.findMany({ where: { question: { interview: { userId: uid } } } });
  
  console.log('Interviews on Aug 10:', interviews.filter(i => i.createdAt.toISOString().includes('2026-08-10') || i.completedAt?.toISOString().includes('2026-08-10')));
  console.log('Answers on Aug 10:', answers.filter(a => a.submittedAt.toISOString().includes('2026-08-10')));
}
main().finally(() => prisma.$disconnect());
