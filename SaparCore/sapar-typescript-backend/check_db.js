require('dotenv').config();
const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, roleId: true, ownerId: true }
  });
  console.log('Users in DB count:', users.length);
  console.log('Users:', JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
