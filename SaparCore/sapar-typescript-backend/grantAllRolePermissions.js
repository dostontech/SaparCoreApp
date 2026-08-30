/**
 * grantAllRolePermissions.js
 *
 * Grants complete role permissions across all 63 system modules for all roles,
 * ensuring staff users (Bosh Buxgalter, Ombordor, Kassir, Sotuvchi, etc.)
 * have immediate, seamless access to their assigned modules without 401 Unauthorized errors.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Granting permissions to all roles across all 63 system modules...');

  const modules = await prisma.module.findMany({
    where: { deletedAt: null }
  });

  const roles = await prisma.role.findMany({
    where: { deletedAt: null }
  });

  console.log(`Found ${roles.length} roles and ${modules.length} modules.`);

  for (const role of roles) {
    console.log(`\n🔑 Setting permissions for role: "${role.roleName}" (${role.id})...`);

    for (const mod of modules) {
      const existingPerm = await prisma.permission.findFirst({
        where: {
          roleId: role.id,
          moduleId: mod.id,
          deletedAt: null
        }
      });

      if (existingPerm) {
        await prisma.permission.update({
          where: { id: existingPerm.id },
          data: {
            create: true,
            edit: true,
            delete: true,
            view: true,
            allowAll: true
          }
        });
      } else {
        await prisma.permission.create({
          data: {
            roleId: role.id,
            moduleId: mod.id,
            create: true,
            edit: true,
            delete: true,
            view: true,
            allowAll: true
          }
        });
      }
    }

    console.log(`  ✅ Granted ${modules.length} module permissions to ${role.roleName}`);
  }

  console.log('\n🎉 ALL ROLE PERMISSIONS SUCCESSFULLY PROVISIONED!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
