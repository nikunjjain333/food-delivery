import { prisma } from './src/config/db';

async function main() {
  const email = 'customer@test.com';
  try {
    await prisma.user.delete({
      where: { email },
    });
    console.log(`User ${email} deleted successfully.`);
  } catch (err) {
    console.log(`User ${email} not found or could not be deleted.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
