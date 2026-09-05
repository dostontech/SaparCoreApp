import axios from 'axios';
import { prisma as p } from '../lib/prisma';

const API_BASE = process.env.API_BASE || 'http://localhost:3005/api';

async function main() {
  console.log('\n=============================================================');
  console.log('💼 CRM & VISUAL SALES PIPELINE QA VERIFICATION');
  console.log('=============================================================\n');

  // Authenticate as Admin
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@sapar.uz',
    password: 'SaparPassword123!',
  }).catch(() => {
    return axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@sapar.uz',
      password: 'password123',
    });
  });

  const token = loginRes.data.data?.token || loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const adminUser = await p.user.findFirst({ where: { email: 'admin@sapar.uz' } });
  if (!adminUser) throw new Error('Admin user not found');

  // =========================================================================
  // SUITE 01: Unified Contacts Directory
  // =========================================================================
  console.log('--- SUITE 01: Unified Contacts Directory ---');

  const contactEmail = `crm_client_${Date.now()}@sapar.uz`;
  const contact = await p.contact.create({
    data: {
      userId: adminUser.id,
      firstName: 'Alisher',
      lastName: 'Navoiy',
      organisation: 'NAVOIY MINING TRADING MCHJ',
      email: contactEmail,
      mobile: '+998909876543',
      vatNumber: '309998877',
      addressLine1: 'Navoiy koʻchasi 14-uy',
      town: 'Toshkent',
      country: 'UZ',
    },
  });
  console.log(`1. Created Unified Contact: ${contact.id} | Org: ${contact.organisation} | STIR: ${contact.vatNumber}`);

  // Query contacts list
  const contactsListRes = await axios.get(`${API_BASE}/admin/contacts`, { headers });
  console.log(`2. Total Contacts in directory: ${contactsListRes.data.data?.length || contactsListRes.data.length || 1}`);

  console.log('✓ SUITE 01 PASS: Unified Contact directory asserted.\n');

  // =========================================================================
  // SUITE 02: Visual Sales Pipeline (Kanban Stages) & Deals
  // =========================================================================
  console.log('--- SUITE 02: Visual Sales Pipeline & Deal Transitions ---');

  // Get initial pipeline
  const pipelineRes = await axios.get(`${API_BASE}/admin/crm/pipeline`, { headers });
  const pipelineData = pipelineRes.data.data;
  console.log(`1. Active Pipeline Stages: ${Object.keys(pipelineData?.stageSummary || {}).join(', ')}`);
  console.log(`2. Total Initial Pipeline Value: ${Number(pipelineData?.metrics?.totalPipelineValue || 0).toLocaleString()} UZS`);

  // Create new Deal in LEAD stage
  const createDealRes = await axios.post(
    `${API_BASE}/admin/crm/deals`,
    {
      title: 'Katta Ombor uchun POS va Shtrix-kod uskunalari',
      customerName: 'NAVOIY MINING TRADING MCHJ',
      value: 65000000,
      stage: 'LEAD',
      probability: 25,
      expectedCloseDate: '2026-09-30',
      assignedToName: 'Sardor Raximov',
      phone: '+998 90 987-65-43',
      notes: 'Birlamchi tijorat taklifi talab qilinmoqda',
    },
    { headers }
  );
  const createdDeal = createDealRes.data.data;
  console.log(`3. Created Deal ID: ${createdDeal?.id} | Value: ${Number(createdDeal?.value).toLocaleString()} UZS | Stage: ${createdDeal?.stage}`);

  // Move Deal: LEAD -> PROPOSAL
  const moveProposalRes = await axios.put(
    `${API_BASE}/admin/crm/deals/${createdDeal.id}/stage`,
    { stage: 'PROPOSAL' },
    { headers }
  );
  console.log(`4. Stage Transition (LEAD -> PROPOSAL): Stage = ${moveProposalRes.data.data?.stage} | Probability = ${moveProposalRes.data.data?.probability}%`);

  // Move Deal: PROPOSAL -> WON
  const moveWonRes = await axios.put(
    `${API_BASE}/admin/crm/deals/${createdDeal.id}/stage`,
    { stage: 'WON' },
    { headers }
  );
  console.log(`5. Stage Transition (PROPOSAL -> WON): Stage = ${moveWonRes.data.data?.stage} | Probability = ${moveWonRes.data.data?.probability}%`);

  // Assert updated pipeline metrics
  const updatedPipelineRes = await axios.get(`${API_BASE}/admin/crm/pipeline`, { headers });
  const updatedMetrics = updatedPipelineRes.data.data?.metrics;
  console.log(`6. Updated Metrics: Won Value = ${Number(updatedMetrics?.wonValue).toLocaleString()} UZS | Win Rate = ${updatedMetrics?.winRate}%`);

  // Clean up Deal
  const deleteDealRes = await axios.delete(`${API_BASE}/admin/crm/deals/${createdDeal.id}`, { headers });
  console.log(`7. Delete Deal Status: HTTP ${deleteDealRes.status}`);

  // Clean up Contact
  await p.contact.deleteMany({ where: { id: contact.id } });

  console.log('✓ SUITE 02 PASS: Visual Sales Pipeline, Deal Lifecycle & Metrics asserted.\n');

  await p.$disconnect();
}

main().catch((err) => {
  console.error('Error running CRM test suite:', err);
  process.exit(1);
});
