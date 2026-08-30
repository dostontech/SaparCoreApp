/**
 * scripts/test-suite-01-accounting.ts
 *
 * Automated verification of Suite 01: Chart of Accounts (TC-ACC-001 to TC-ACC-006)
 * from docs/fsd/accounting-test-cases.md against the live app and PostgreSQL.
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient, Prisma } from '@prisma/client';

async function main() {
  const p = new PrismaClient();

  const user = await p.user.findFirst({ where: { user_type: 1 } });
  if (!user) throw new Error('No user found');
  const token = jwt.sign(
    { id: user.id, tenantId: user.ownerId ?? user.id },
    process.env.JWT_SECRET || 'sapar-local-jwt-secret-2026',
    { expiresIn: '1d' }
  );

  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n=============================================================');
  console.log('🏛️ SUITE 01: CHART OF ACCOUNTS (HISOB-KITOBLAR REJASI) VERIFICATION');
  console.log('=============================================================\n');

  // Clean up any test accounts from previous runs
  await p.account.deleteMany({
    where: {
      userId: user.id,
      code: { in: ['6990', '1000-TEST', '1010-TEST'] },
    },
  });

  // =========================================================================
  // TC-ACC-001: Create Custom GL Account
  // =========================================================================
  console.log('--- TC-ACC-001: Create Custom GL Account ---');
  const acc01Res = await axios.post(
    'http://localhost:3001/api/admin/accounts',
    {
      code: '6990',
      name: 'Boshqa qisqa muddatli majburiyatlar',
      accountType: 'LIABILITY',
      description: 'Other short-term liabilities (custom)',
    },
    { headers }
  );

  console.log(`1. API Create Account Response: HTTP ${acc01Res.status} | ID=${acc01Res.data.data.account.id}`);

  // Query Database directly
  const dbAcc01 = await p.account.findUnique({
    where: { userId_code: { userId: user.id, code: '6990' } },
  });

  console.log(`2. DB Query Account: Code=${dbAcc01?.code} | Name='${dbAcc01?.name}' | Type=${dbAcc01?.accountType}`);
  if (dbAcc01 && dbAcc01.code === '6990' && dbAcc01.accountType === 'LIABILITY') {
    console.log('✓ TC-ACC-001 PASS: Custom GL account successfully created and persisted in DB.\n');
  } else {
    console.log('❌ TC-ACC-001 FAIL: Account not found in database.\n');
  }

  // =========================================================================
  // TC-ACC-002: Duplicate Account Code Collision Guard
  // =========================================================================
  console.log('--- TC-ACC-002: Duplicate Account Code Collision Guard ---');
  let duplicateRejected = false;
  try {
    await axios.post(
      'http://localhost:3001/api/admin/accounts',
      {
        code: '6990',
        name: 'Clash Account with duplicate code',
        accountType: 'ASSET',
      },
      { headers }
    );
    console.log('❌ TC-ACC-002 FAIL: Duplicate code was accepted by API!\n');
  } catch (err: any) {
    duplicateRejected = true;
    console.log(`1. Duplicate Code Attempt: Rejected with HTTP ${err.response?.status} - '${err.response?.data?.message}'`);
    if (err.response?.status === 400 && err.response?.data?.message?.includes('already in use')) {
      console.log('✓ TC-ACC-002 PASS: Duplicate account code strictly rejected with 400 Bad Request.\n');
    }
  }

  // =========================================================================
  // TC-ACC-003: Hierarchical Parent-Child Account Tree
  // =========================================================================
  console.log('--- TC-ACC-003: Hierarchical Parent-Child Account Tree ---');
  // 1. Create Parent Account
  const parentRes = await axios.post(
    'http://localhost:3001/api/admin/accounts',
    {
      code: '1000-TEST',
      name: 'Materiallar (Bosh hisob)',
      accountType: 'ASSET',
    },
    { headers }
  );
  const parentId = parentRes.data.data.account.id;
  console.log(`1. Created Parent Account: Code=1000-TEST | ID=${parentId}`);

  // 2. Create Child Account referencing Parent
  const childRes = await axios.post(
    'http://localhost:3001/api/admin/accounts',
    {
      code: '1010-TEST',
      name: 'Xom-ashyo va materiallar',
      accountType: 'ASSET',
      parentId,
    },
    { headers }
  );
  const childId = childRes.data.data.account.id;
  console.log(`2. Created Child Account: Code=1010-TEST | parentId=${childRes.data.data.account.parentId}`);

  // 3. Verify in Database
  const dbChild = await p.account.findUnique({
    where: { id: childId },
    include: { parent: true },
  });

  console.log(`3. DB Hierarchy Verification: Child '${dbChild?.code}' -> Parent '${dbChild?.parent?.code}' (${dbChild?.parent?.name})`);
  if (dbChild?.parentId === parentId && dbChild?.parent?.code === '1000-TEST') {
    console.log('✓ TC-ACC-003 PASS: Parent-Child hierarchy correctly linked in database relations.\n');
  } else {
    console.log('❌ TC-ACC-003 FAIL: Hierarchy mismatch.\n');
  }

  // =========================================================================
  // TC-ACC-004: System/Protected Accounts Guard
  // =========================================================================
  console.log('--- TC-ACC-004: System / Control Accounts Guard ---');
  // Find key control accounts: 1100 (AR), 1200 (Inventory), 4001 (Revenue)
  const controlAccounts = await p.account.findMany({
    where: {
      userId: user.id,
      code: { in: ['1100', '1200', '4001', '5001', '2100'] },
      isDeleted: false,
    },
    include: { roleMappings: true, journalLines: true },
  });

  console.log(`Found ${controlAccounts.length} core control accounts in tenant CoA:`);
  for (const ca of controlAccounts) {
    console.log(`  • ${ca.code.padEnd(5)} | Name: ${ca.name.padEnd(28)} | Type: ${ca.accountType.padEnd(9)} | Protected: ${ca.roleProtected} | Roles: ${ca.roleMappings.map((r) => r.roleKey).join(', ')} | JL Lines: ${ca.journalLines.length}`);
  }

  // Attempt to delete control account 1200 (Inventory)
  const invAccount = controlAccounts.find((a) => a.code === '1200') || controlAccounts[0];
  console.log(`\n1. Testing Deletion Protection on Control Account '${invAccount.code} - ${invAccount.name}' (ID: ${invAccount.id})...`);

  let deleteBlocked = false;
  try {
    const delRes = await axios.delete(
      `http://localhost:3001/api/admin/accounts/${invAccount.id}`,
      { headers }
    );
    console.log(`⚠️ Delete attempt result: HTTP ${delRes.status}`);
  } catch (err: any) {
    deleteBlocked = true;
    console.log(`✓ Delete blocked: HTTP ${err.response?.status} - '${err.response?.data?.message}'`);
  }

  // Check if account is still active in DB
  const dbInvAfter = await p.account.findUnique({ where: { id: invAccount.id } });
  console.log(`2. DB Account Status: isDeleted = ${dbInvAfter?.isDeleted}`);

  if (deleteBlocked || !dbInvAfter?.isDeleted) {
    console.log('✓ TC-ACC-004 PASS: System control account deletion guarded.\n');
  } else {
    console.log('🚩 TC-ACC-004 GAP: Account delete endpoint allowed setting isDeleted=true on active control account.\n');
    // Restore account immediately
    await p.account.update({ where: { id: invAccount.id }, data: { isDeleted: false } });
  }

  // =========================================================================
  // TC-ACC-005: Uzbekistan BHMS National Chart of Accounts Seeding
  // =========================================================================
  console.log('--- TC-ACC-005: Uzbekistan BHMS Chart of Accounts Seeding ---');
  const allAccounts = await p.account.findMany({
    where: { userId: user.id, isDeleted: false },
    orderBy: { code: 'asc' },
  });

  console.log(`• Total Active Accounts in Tenant Chart: ${allAccounts.length}`);

  const byType: Record<string, number> = {};
  for (const acc of allAccounts) {
    byType[acc.accountType] = (byType[acc.accountType] || 0) + 1;
  }

  console.log('• Distribution by Standard Account Types:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`    - ${type.padEnd(10)}: ${count} accounts`);
  }

  // Check key BHMS code ranges
  const hasAssets = allAccounts.some((a) => a.code.startsWith('0') || a.code.startsWith('1') || a.code.startsWith('2'));
  const hasEquity = allAccounts.some((a) => a.code.startsWith('3') || a.code.startsWith('8'));
  const hasRevenue = allAccounts.some((a) => a.code.startsWith('4') || a.code.startsWith('9'));
  const hasExpenses = allAccounts.some((a) => a.code.startsWith('5') || a.code.startsWith('9'));

  console.log(`• Asset Accounts present:     ${hasAssets}`);
  console.log(`• Equity Accounts present:    ${hasEquity}`);
  console.log(`• Revenue Accounts present:   ${hasRevenue}`);
  console.log(`• Expense/COGS present:       ${hasExpenses}`);

  if (allAccounts.length >= 10 && hasAssets && hasRevenue && hasExpenses) {
    console.log('✓ TC-ACC-005 PASS: Uzbekistan standard Chart of Accounts structure fully seeded and queryable.\n');
  } else {
    console.log('❌ TC-ACC-005 FAIL: Missing core BHMS account structures.\n');
  }

  // =========================================================================
  // TC-ACC-006: Semantic Role Key Mappings
  // =========================================================================
  console.log('--- TC-ACC-006: Semantic Role Key Mappings ---');
  const roleMappings = await p.ledgerAccountMapping.findMany({
    where: { userId: user.id },
    include: { account: true },
  });

  console.log(`• Total Role Mappings Configured: ${roleMappings.length}`);
  console.log('-----------------------------------------------------------------------------------');
  console.log('Semantic Role Key         | Target Account Code | Target Account Name');
  console.log('-----------------------------------------------------------------------------------');

  const requiredRoles = ['AR', 'AP', 'COGS', 'INVENTORY', 'SALES_REVENUE', 'BANK', 'CASH'];
  const foundRoles = new Set(roleMappings.map((r) => r.roleKey));

  for (const rm of roleMappings) {
    console.log(`${rm.roleKey.padEnd(25)} | ${rm.account.code.padEnd(19)} | ${rm.account.name}`);
  }

  console.log('-----------------------------------------------------------------------------------');
  const missingRoles = requiredRoles.filter((r) => !foundRoles.has(r));
  console.log(`• Required Roles Checked: ${requiredRoles.join(', ')}`);
  console.log(`• Missing Required Roles: ${missingRoles.length === 0 ? 'None (All Mapped!)' : missingRoles.join(', ')}`);

  if (missingRoles.length === 0) {
    console.log('✓ TC-ACC-006 PASS: All essential ledger semantic role keys are mapped to valid GL accounts.\n');
  } else {
    console.log(`❌ TC-ACC-006 FAIL: Missing role mappings: ${missingRoles.join(', ')}\n`);
  }

  // Cleanup test accounts
  await p.account.deleteMany({
    where: {
      userId: user.id,
      code: { in: ['6990', '1000-TEST', '1010-TEST'] },
    },
  });

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running test script:', err);
  process.exit(1);
});
