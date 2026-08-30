/**
 * controllers/crmDealsController.ts
 *
 * 💼 CRM Visual Sales Pipeline & Deal Management Controller
 * Persisted in PostgreSQL via Prisma ORM.
 *
 * Stages:
 *   - LEAD: Lidlar (Yangi murojaatlar)
 *   - CONTACTED: Muloqotda (Bogʻlanilgan)
 *   - PROPOSAL: Tijorat taklifi yuborilgan
 *   - NEGOTIATION: Muzokara / Shartnoma bosqichi
 *   - WON: Yutib olingan (Muvaffaqiyatli bitim)
 *   - LOST: Yoʻqotilgan (Rad etilgan)
 */

import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';

function handleUnauthorized(res: Response, err: unknown): boolean {
  if (err instanceof UnauthorizedError) {
    res.status(err.status).json({ success: false, message: err.message });
    return true;
  }
  return false;
}

export interface Deal {
  id: string;
  userId: string;
  title: string;
  customerId?: string | null;
  customerName: string;
  value: number; // in UZS
  currency: string;
  stage: 'LEAD' | 'CONTACTED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  probability: number; // 0..100%
  expectedCloseDate?: string | null;
  assignedToName: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  lostReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatDeal(raw: any): Deal {
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    customerId: raw.customerId,
    customerName: raw.customerName,
    value: Number(raw.value || 0),
    currency: raw.currency || 'UZS',
    stage: raw.stage as Deal['stage'],
    probability: raw.probability || 0,
    expectedCloseDate: raw.expectedCloseDate ? new Date(raw.expectedCloseDate).toISOString().substring(0, 10) : null,
    assignedToName: raw.assignedToName || 'Kassir / Menejer',
    phone: raw.phone,
    email: raw.email,
    notes: raw.notes,
    lostReason: raw.lostReason,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : new Date(raw.createdAt).toISOString(),
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : new Date(raw.updatedAt).toISOString(),
  };
}

async function ensureDefaultDeals(userId: string): Promise<Deal[]> {
  const existing = await prisma.crmDeal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (existing.length > 0) {
    return existing.map(formatDeal);
  }

  const defaultDeals = [
    {
      userId,
      title: 'Toshkent Toʻqimachilik Korxonasiga ERP litsenziyalari',
      customerName: 'OASIS TEXTILE TRADING MCHJ',
      value: 45000000,
      currency: 'UZS',
      stage: 'PROPOSAL',
      probability: 60,
      expectedCloseDate: new Date('2026-08-30'),
      assignedToName: 'Sardor Raximov',
      phone: '+998 90 123-45-67',
      notes: 'Tijorat taklifi yuborildi, qayta qoʻngʻiroq kutilmoqda',
    },
    {
      userId,
      title: 'Ombor logistika tizimi integratsiyasi',
      customerName: 'SAMARQAND LOGISTIKA SERVIS XK',
      value: 85000000,
      currency: 'UZS',
      stage: 'NEGOTIATION',
      probability: 80,
      expectedCloseDate: new Date('2026-09-15'),
      assignedToName: 'Nodir Karimov',
      phone: '+998 93 555-88-22',
      notes: 'Shartnoma loyihasi koʻrib chiqilmoqda',
    },
    {
      userId,
      title: 'Farmatsevtika ombori avtomatlashtirish',
      customerName: 'TOSHKENT MEGA PHARMA QK',
      value: 120000000,
      currency: 'UZS',
      stage: 'WON',
      probability: 100,
      expectedCloseDate: new Date('2026-08-10'),
      assignedToName: 'Sardor Raximov',
      phone: '+998 97 777-11-00',
      notes: 'Shartnoma imzolandi, toʻlov qabul qilindi',
    },
    {
      userId,
      title: 'Buxoro Agro Cluster kassa terminallari',
      customerName: 'BUXORO AGRO CLUSTER MCHJ',
      value: 28000000,
      currency: 'UZS',
      stage: 'LEAD',
      probability: 20,
      expectedCloseDate: new Date('2026-09-20'),
      assignedToName: 'Nodir Karimov',
      phone: '+998 91 444-33-22',
      notes: 'Saytdan qoldirilgan yangi murojaat',
    },
    {
      userId,
      title: 'FinTech integratsiya loyihasi',
      customerName: 'GLOBAL FINTECH SYSTEMS MCHJ',
      value: 65000000,
      currency: 'UZS',
      stage: 'CONTACTED',
      probability: 40,
      expectedCloseDate: new Date('2026-09-05'),
      assignedToName: 'Sardor Raximov',
      phone: '+998 90 999-00-11',
      notes: 'Birlamchi ehtiyojlar aniqlandi',
    },
  ];

  for (const d of defaultDeals) {
    await prisma.crmDeal.create({ data: d });
  }

  const seeded = await prisma.crmDeal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return seeded.map(formatDeal);
}

export async function getDealsPipeline(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const deals = await ensureDefaultDeals(userId);

    // Calculate Stage Metrics
    const stages = ['LEAD', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;
    const stageSummary: Record<string, { count: number; totalValue: number; deals: Deal[] }> = {};

    for (const st of stages) {
      const stageDeals = deals.filter((d) => d.stage === st);
      stageSummary[st] = {
        count: stageDeals.length,
        totalValue: stageDeals.reduce((s, d) => s + d.value, 0),
        deals: stageDeals,
      };
    }

    const totalPipelineValue = deals
      .filter((d) => d.stage !== 'LOST')
      .reduce((s, d) => s + d.value, 0);

    const wonValue = stageSummary.WON.totalValue;
    const wonCount = stageSummary.WON.count;
    const totalFinished = wonCount + stageSummary.LOST.count;
    const winRate = totalFinished > 0 ? Math.round((wonCount / totalFinished) * 100) : 100;

    res.json({
      success: true,
      data: {
        deals,
        stageSummary,
        metrics: {
          totalPipelineValue,
          wonValue,
          winRate,
          activeDealsCount: deals.filter((d) => d.stage !== 'WON' && d.stage !== 'LOST').length,
          totalDealsCount: deals.length,
        },
      },
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getDealsPipeline error:', err);
    res.status(500).json({ success: false, message: 'Bitimlar quvurini yuklashda xatolik' });
  }
}

export async function createDeal(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const {
      title,
      customerName,
      value,
      stage = 'LEAD',
      probability,
      expectedCloseDate,
      assignedToName = 'Kassir / Menejer',
      phone,
      email,
      notes,
    } = req.body;

    if (!title || !customerName) {
      res.status(400).json({ success: false, message: 'Bitim nomi va mijoz nomi kiritilishi shart' });
      return;
    }

    const created = await prisma.crmDeal.create({
      data: {
        userId,
        title,
        customerName,
        value: Number(value || 0),
        currency: 'UZS',
        stage,
        probability: probability ?? (stage === 'WON' ? 100 : stage === 'LEAD' ? 20 : 50),
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : new Date(Date.now() + 30 * 86400000),
        assignedToName,
        phone,
        email,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Yangi bitim muvaffaqiyatli yaratildi',
      data: formatDeal(created),
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('createDeal error:', err);
    res.status(500).json({ success: false, message: 'Bitim yaratishda xatolik' });
  }
}

export async function updateDealStage(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { stage, lostReason } = req.body;

    const existing = await prisma.crmDeal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Bitim topilmadi' });
      return;
    }

    let prob = existing.probability;
    if (stage === 'WON') prob = 100;
    if (stage === 'LOST') prob = 0;

    const updated = await prisma.crmDeal.update({
      where: { id: existing.id },
      data: {
        stage,
        probability: prob,
        lostReason: lostReason !== undefined ? lostReason : existing.lostReason,
      },
    });

    res.json({
      success: true,
      message: `Bitim ${stage} bosqichiga koʻchirildi`,
      data: formatDeal(updated),
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('updateDealStage error:', err);
    res.status(500).json({ success: false, message: 'Bosqichni yangilashda xatolik' });
  }
}

export async function deleteDeal(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

    await prisma.crmDeal.deleteMany({
      where: { id, userId },
    });

    res.json({
      success: true,
      message: 'Bitim oʻchirildi',
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('deleteDeal error:', err);
    res.status(500).json({ success: false, message: 'Bitimni oʻchirishda xatolik' });
  }
}
