import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma';
import * as crmController from '../controllers/crmDealsController';
import * as eDocController from '../controllers/eDocumentController';
import * as helpdeskController from '../controllers/helpdeskController';
import * as projectController from '../controllers/projectWorkspaceController';

function mockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload: any) => {
    res.body = payload;
    return res;
  });
  return res;
}

describe('In-Memory to PostgreSQL Migrations', () => {
  const testUserId = 'test-tenant-uuid-123';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. CRM Deals Controller (PostgreSQL Persistence)', () => {
    it('creates a CRM deal and persists it to database with UZS currency and stage', async () => {
      const mockCreatedDeal = {
        id: 'DEAL-999',
        userId: testUserId,
        title: 'ERP Litsenziya Shartnomasi',
        customerName: 'TOSHKENT TEXTILE MCHJ',
        value: 50000000,
        currency: 'UZS',
        stage: 'PROPOSAL',
        probability: 60,
        expectedCloseDate: new Date('2026-09-30'),
        assignedToName: 'Sardor Raximov',
        phone: '+998 90 123-45-67',
        notes: 'Taklif koʻrib chiqilmoqda',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.crmDeal, 'create').mockResolvedValueOnce(mockCreatedDeal as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        body: {
          title: 'ERP Litsenziya Shartnomasi',
          customerName: 'TOSHKENT TEXTILE MCHJ',
          value: 50000000,
          stage: 'PROPOSAL',
          probability: 60,
          expectedCloseDate: '2026-09-30',
        },
      };
      const res = mockRes();

      await crmController.createDeal(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('ERP Litsenziya Shartnomasi');
      expect(res.body.data.value).toBe(50000000);
      expect(res.body.data.stage).toBe('PROPOSAL');
      expect(prisma.crmDeal.create).toHaveBeenCalled();
    });

    it('updates deal stage and probability in database', async () => {
      const existing = {
        id: 'DEAL-999',
        userId: testUserId,
        title: 'ERP Litsenziya',
        customerName: 'TOSHKENT TEXTILE MCHJ',
        value: 50000000,
        stage: 'PROPOSAL',
        probability: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = {
        ...existing,
        stage: 'WON',
        probability: 100,
      };

      vi.spyOn(prisma.crmDeal, 'findFirst').mockResolvedValueOnce(existing as any);
      vi.spyOn(prisma.crmDeal, 'update').mockResolvedValueOnce(updated as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        params: { id: 'DEAL-999' },
        body: { stage: 'WON' },
      };
      const res = mockRes();

      await crmController.updateDealStage(req, res);

      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toBe('WON');
      expect(res.body.data.probability).toBe(100);
      expect(prisma.crmDeal.update).toHaveBeenCalled();
    });
  });

  describe('2. E-Documents Controller (PostgreSQL Persistence)', () => {
    it('generates and persists Act of Reconciliation (Akt sverki) in database', async () => {
      const mockCreatedAkt = {
        id: 'edoc-akt-101',
        userId: testUserId,
        docType: 'ACT_RECONCILIATION',
        docNumber: 'AKT-2026/001',
        docDate: new Date('2026-08-01'),
        contractNumber: '42-SH',
        contractDate: new Date('2026-01-10'),
        title: 'Solishtirma dalolatnoma (Акт сверки) № AKT-2026/001',
        status: 'DRAFT',
        direction: 'OUTBOUND',
        sellerName: 'SAPAR SOFTWARE SYSTEMS MCHJ',
        sellerTin: '302918273',
        buyerName: 'SAMARQAND LOGISTIKA MCHJ',
        buyerTin: '309876543',
        subtotal: 15000000,
        vatTotal: 0,
        totalSum: 15000000,
        currency: 'UZS',
        publicSignToken: 'token-akt-101',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.eDocument, 'create').mockResolvedValueOnce(mockCreatedAkt as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        body: {
          counterpartyName: 'SAMARQAND LOGISTIKA MCHJ',
          counterpartyTin: '309876543',
          startDate: '2026-01-01',
          endDate: '2026-08-01',
          openingBalance: 0,
        },
      };
      const res = mockRes();

      await eDocController.generateAktSverki(req, res);

      expect(res.body.success).toBe(true);
      expect(res.body.data.document.docType).toBe('ACT_RECONCILIATION');
      expect(res.body.data.document.buyerName).toBe('SAMARQAND LOGISTIKA MCHJ');
      expect(prisma.eDocument.create).toHaveBeenCalled();
    });

    it('signs an E-Document with E-IMZO sender signature', async () => {
      const mockDoc = {
        id: 'edoc-akt-101',
        userId: testUserId,
        docType: 'ACT_RECONCILIATION',
        sellerName: 'SAPAR SOFTWARE SYSTEMS MCHJ',
        sellerTin: '302918273',
        buyerName: 'SAMARQAND LOGISTIKA MCHJ',
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSignedDoc = {
        ...mockDoc,
        status: 'WAITING_COUNTERPARTY',
        senderSignature: {
          signedBy: 'NODIR KARIMOV',
          tin: '302918273',
          isValid: true,
        },
      };

      vi.spyOn(prisma.eDocument, 'findFirst').mockResolvedValueOnce(mockDoc as any);
      vi.spyOn(prisma.eDocument, 'update').mockResolvedValueOnce(mockSignedDoc as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        params: { id: 'edoc-akt-101' },
        body: {
          pkcs7Signature: 'MIIBiAYJKoZIhvcNAQc...',
          certInfo: { CN: 'NODIR KARIMOV', TIN: '302918273' },
        },
      };
      const res = mockRes();

      await eDocController.signAsSender(req, res);

      expect(res.body.success).toBe(true);
      expect(res.body.data.document.status).toBe('WAITING_COUNTERPARTY');
      expect(prisma.eDocument.update).toHaveBeenCalled();
    });
  });

  describe('3. Helpdesk Tickets Controller (PostgreSQL Persistence)', () => {
    it('creates support ticket with initial message in database', async () => {
      const mockTicket = {
        id: 'TICK-201',
        userId: testUserId,
        ticketNumber: 'SUP-2026-101',
        subject: 'Didox integratsiyasi masalasi',
        customerName: 'OASIS TEXTILE MCHJ',
        customerEmail: 'info@oasis.uz',
        priority: 'HIGH',
        status: 'NEW',
        slaHours: 4,
        assignedAgentName: 'Sardor Raximov',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: 'MSG-001',
            senderName: 'OASIS TEXTILE MCHJ',
            senderRole: 'CUSTOMER',
            message: 'E-IMZO orqali imzolashda xatolik bermoqda.',
            createdAt: new Date(),
          },
        ],
      };

      vi.spyOn(prisma.supportTicket, 'create').mockResolvedValueOnce(mockTicket as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        body: {
          subject: 'Didox integratsiyasi masalasi',
          customerName: 'OASIS TEXTILE MCHJ',
          customerEmail: 'info@oasis.uz',
          priority: 'HIGH',
          initialMessage: 'E-IMZO orqali imzolashda xatolik bermoqda.',
        },
      };
      const res = mockRes();

      await helpdeskController.createTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBe('Didox integratsiyasi masalasi');
      expect(res.body.data.messages.length).toBe(1);
      expect(prisma.supportTicket.create).toHaveBeenCalled();
    });

    it('replies to ticket, inserts TicketMessage and updates status', async () => {
      const existingTicket = {
        id: 'TICK-201',
        userId: testUserId,
        ticketNumber: 'SUP-2026-101',
        subject: 'Didox integratsiyasi',
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTicket = {
        ...existingTicket,
        status: 'WAITING_CLIENT',
        messages: [
          {
            id: 'MSG-002',
            senderName: 'Support Agent',
            senderRole: 'AGENT',
            message: 'E-IMZO modulini 64443 portda qayta ishga tushiring.',
            createdAt: new Date(),
          },
        ],
      };

      vi.spyOn(prisma.supportTicket, 'findFirst').mockResolvedValueOnce(existingTicket as any);
      vi.spyOn(prisma.ticketMessage, 'create').mockResolvedValueOnce({} as any);
      vi.spyOn(prisma.supportTicket, 'update').mockResolvedValueOnce(updatedTicket as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        params: { ticketId: 'TICK-201' },
        body: {
          message: 'E-IMZO modulini 64443 portda qayta ishga tushiring.',
          senderName: 'Support Agent',
          role: 'AGENT',
        },
      };
      const res = mockRes();

      await helpdeskController.replyToTicket(req, res);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('WAITING_CLIENT');
      expect(prisma.ticketMessage.create).toHaveBeenCalled();
      expect(prisma.supportTicket.update).toHaveBeenCalled();
    });
  });

  describe('4. Project Workspace Controller (PostgreSQL Persistence)', () => {
    it('creates project task and persists to database', async () => {
      const mockTask = {
        id: 'TASK-301',
        userId: testUserId,
        projectId: 'proj-main',
        title: 'PostgreSQL klasterini sozlash',
        description: 'Zaxira nusxalash cronini yoqish',
        stage: 'IN_PROGRESS',
        priority: 'URGENT',
        assignedToName: 'Nodir Karimov',
        dueDate: new Date('2026-08-30'),
        estimatedHours: 16,
        actualHours: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prisma.projectTask, 'create').mockResolvedValueOnce(mockTask as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        params: { projectId: 'proj-main' },
        body: {
          title: 'PostgreSQL klasterini sozlash',
          description: 'Zaxira nusxalash cronini yoqish',
          stage: 'IN_PROGRESS',
          priority: 'URGENT',
          assignedToName: 'Nodir Karimov',
          estimatedHours: 16,
        },
      };
      const res = mockRes();

      await projectController.createProjectTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('PostgreSQL klasterini sozlash');
      expect(res.body.data.stage).toBe('IN_PROGRESS');
      expect(prisma.projectTask.create).toHaveBeenCalled();
    });

    it('updates task Kanban stage in database', async () => {
      const existingTask = {
        id: 'TASK-301',
        userId: testUserId,
        projectId: 'proj-main',
        title: 'PostgreSQL klasterini sozlash',
        stage: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        stage: 'DONE',
      };

      vi.spyOn(prisma.projectTask, 'findFirst').mockResolvedValueOnce(existingTask as any);
      vi.spyOn(prisma.projectTask, 'update').mockResolvedValueOnce(updatedTask as any);

      const req: any = {
        user: { id: testUserId, role: { roleName: 'Admin' } },
        params: { projectId: 'proj-main', taskId: 'TASK-301' },
        body: { stage: 'DONE' },
      };
      const res = mockRes();

      await projectController.updateProjectTaskStage(req, res);

      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toBe('DONE');
      expect(prisma.projectTask.update).toHaveBeenCalled();
    });
  });
});
