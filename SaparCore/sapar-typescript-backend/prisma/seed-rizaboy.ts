import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import { ensureRole, OWNER_ROLE_NAME } from '../lib/defaultRoles';
import { seedDefaultChart } from '../lib/defaultChartOfAccounts';
import { registerRenderCustomDomain } from '../lib/renderDomainManager';

export async function createOrUpdateRizaboyCompany() {
  const email = 'rizaboy@sapar.uz';
  const passwordRaw = process.env.RIZABOY_DEMO_PASSWORD || 'DEMO_PASSWORD_CHANGE_ME';
  const companyName = 'Rizaboy Test MCHJ';
  const subdomain = 'rizaboy';
  const publicBaseUrl = `https://${subdomain}.sapar.uz`;

  console.log(`[RizaboyProvisioning] Setting up custom company for "${subdomain}"...`);

  const roleId = await ensureRole(OWNER_ROLE_NAME).catch(() => null);
  const hashedPassword = await hashPassword(passwordRaw);

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firstName: 'Riza',
        lastName: 'Boy',
        email,
        phone: '+998901234567',
        password: hashedPassword,
        user_type: 1,
        ...(roleId ? { roleId } : {}),
      },
    });
    console.log(`[RizaboyProvisioning] Created owner user: ${user.id} (${email})`);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isDeleted: false,
        deletedAt: null,
      },
    });
    console.log(`[RizaboyProvisioning] Updated existing user: ${user.id} (${email})`);
  }

  // Create or update company settings with custom subdomain
  const company = await prisma.companySettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      companyName,
      email,
      phone: '+998901234567',
      address: 'Toshkent shahri, Chilonzor tumani',
      city: 'Toshkent',
      state: 'Toshkent shahri',
      country: 'Uzbekistan',
      pincode: '100000',
      taxRegime: 'VAT_GENERIC',
      publicBaseUrl,
      functionalCurrency: 'UZS',
    },
    update: {
      companyName,
      publicBaseUrl,
      city: 'Toshkent',
      country: 'Uzbekistan',
      taxRegime: 'VAT_GENERIC',
    },
  });

  console.log(`[RizaboyProvisioning] Company settings configured: ${company.companyName} (${company.publicBaseUrl})`);

  // Seed default 21-BHMS chart of accounts
  try {
    await seedDefaultChart(prisma, user.id);
    console.log(`[RizaboyProvisioning] National chart of accounts seeded.`);
  } catch (chartErr: any) {
    console.warn(`[RizaboyProvisioning] Chart of accounts notice:`, chartErr.message);
  }

  // Automatically register dedicated custom domain on Render
  try {
    await registerRenderCustomDomain(subdomain);
  } catch (renderErr: any) {
    console.warn(`[RizaboyProvisioning] Render registration notice:`, renderErr.message);
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      password: passwordRaw,
    },
    company: {
      id: company.id,
      name: company.companyName,
      subdomain,
      url: publicBaseUrl,
    },
  };
}

if (require.main === module) {
  createOrUpdateRizaboyCompany()
    .then((res) => {
      console.log('\n=============================================');
      console.log('🎉 RIZABOY CUSTOM COMPANY PROVISIONED:');
      console.log(`- Subdomain URL: ${res.company.url}`);
      console.log(`- Login Email:   ${res.user.email}`);
      console.log(`- Password:      ${res.user.password}`);
      console.log(`- Company Name:  ${res.company.name}`);
      console.log('=============================================\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Provisioning failed:', err);
      process.exit(1);
    });
}
