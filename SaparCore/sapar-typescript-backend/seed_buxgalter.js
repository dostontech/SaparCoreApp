const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAccountingUser() {
  try {
    const email = 'buxgalter@sapar.uz';
    const hashedPassword = await bcrypt.hash('password123', 10);

    let role = await prisma.role.findFirst({
      where: { roleName: 'Bosh Buxgalter' },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          roleName: 'Bosh Buxgalter',
          status: true,
        },
      });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        firstName: 'Aziza',
        lastName: 'Rahimova (Bosh Buxgalter)',
        roleId: role.id,
      },
      create: {
        email,
        firstName: 'Aziza',
        lastName: 'Rahimova (Bosh Buxgalter)',
        password: hashedPassword,
        phone: '+998909876543',
        roleId: role.id,
      },
    });

    console.log('✅ Created / Updated Accounting User:', user.email, '| Name:', user.firstName, user.lastName);
  } catch (err) {
    console.error('Error seeding accounting user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAccountingUser();
