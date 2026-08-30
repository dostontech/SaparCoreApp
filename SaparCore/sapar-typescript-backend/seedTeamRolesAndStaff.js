/**
 * seedTeamRolesAndStaff.js
 *
 * Sets up Uzbekistan enterprise Team Roles & Staff Users for OOO "RIZOBAY STROY".
 * Enables role-based access control (Buxgalter, Ombordor, Kassir, Sotuv Menejeri).
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log('🚀 Setting up Team Roles & Staff Accounts for Rizobay Stroy...');

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'buildforward33@gmail.com' },
        { email: 'stroy@sapar.uz' },
        { user_type: 1 }
      ]
    }
  });

  const defaultPasswordHash = await hashPassword('password123');

  // 1. Create Enterprise Roles
  const rolesData = [
    { name: 'Bosh Buxgalter (Chief Accountant)', defaultRoute: '/accounting/chart-of-accounts' },
    { name: 'Bosh Ombordor (Head of Warehouse)', defaultRoute: '/inventory' },
    { name: 'Kassir-Operator (Retail Cashier)', defaultRoute: '/pos' },
    { name: 'Sotuv Menejeri (Sales Manager)', defaultRoute: '/crm/deals' },
    { name: 'Menejer (Operations Manager)', defaultRoute: '/dashboard' }
  ];

  const createdRoles = {};
  for (const r of rolesData) {
    const existing = await prisma.role.findFirst({
      where: { roleName: { equals: r.name, mode: 'insensitive' } }
    });
    if (existing) {
      createdRoles[r.name] = existing;
    } else {
      const created = await prisma.role.create({
        data: {
          roleName: r.name,
          status: true,
          defaultRoute: r.defaultRoute,
          createdBy: 'sys-bootstrap'
        }
      });
      createdRoles[r.name] = created;
    }
  }

  // 2. Create Staff Accounts for Each Owner/Tenant
  for (const user of users) {
    const tenantId = user.id;
    console.log(`\n👥 Setting up team for tenant: ${user.email} (${tenantId})...`);

    const staffMembers = [
      {
        firstName: 'Shokirjon',
        lastName: 'Qodirov',
        email: `shokirjon@rizobaystroy.uz`,
        phone: '+998944499447',
        role: createdRoles['Bosh Buxgalter (Chief Accountant)']
      },
      {
        firstName: 'Dilshod',
        lastName: 'Karimov',
        email: `dilshod@rizobaystroy.uz`,
        phone: '+998901234511',
        role: createdRoles['Bosh Ombordor (Head of Warehouse)']
      },
      {
        firstName: 'Javohir',
        lastName: 'Toshmatov',
        email: `javohir@rizobaystroy.uz`,
        phone: '+998901234522',
        role: createdRoles['Kassir-Operator (Retail Cashier)']
      },
      {
        firstName: 'Farhod',
        lastName: 'Rahimov',
        email: `farhod@rizobaystroy.uz`,
        phone: '+998901234533',
        role: createdRoles['Sotuv Menejeri (Sales Manager)']
      }
    ];

    for (const staff of staffMembers) {
      const existingStaff = await prisma.user.findUnique({
        where: { email: staff.email }
      });

      if (existingStaff) {
        await prisma.user.update({
          where: { id: existingStaff.id },
          data: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            phone: staff.phone,
            roleId: staff.role ? staff.role.id : null,
            ownerId: tenantId
          }
        });
      } else {
        await prisma.user.create({
          data: {
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phone,
            password: defaultPasswordHash,
            user_type: 3,
            roleId: staff.role ? staff.role.id : null,
            ownerId: tenantId
          }
        });
      }
    }

    console.log(`✅ Team staff created for tenant: ${user.email}`);
  }

  console.log('\n🎉 ALL TEAM ROLES & STAFF ACCOUNTS PROVISIONED SUCCESSFULLY!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
