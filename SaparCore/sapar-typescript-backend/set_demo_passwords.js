const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const pw = await bcrypt.hash('Demo123$', 10);

    const emails = [
        'admin@demo.sapar.local',
        'stroy@sapar.uz',
        'buxgalter@sapar.uz',
        'buildforward33@gmail.com',
        'restaurant@sapar.uz',
        'admin@sapar.uz'
    ];

    for (const email of emails) {
        const user = await prisma.user.findFirst({ where: { email } });
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { password: pw }
            });
            console.log(`✅ Set password to Demo123$ for: ${email}`);
        } else {
            console.log(`ℹ️ User not found: ${email}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
