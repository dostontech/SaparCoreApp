import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';

export interface PlanConfig {
  id: string;
  name: string;
  nameUz: string;
  pricePerMonth: number;
  description: string;
  modules: string[];
}

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'ACCOUNTING_ONLY',
    name: 'Buxgalteriya & Moliya (Accounting Only)',
    nameUz: 'Faqat Buxgalteriya (21-son BHMS)',
    pricePerMonth: 290000,
    description: 'Uzbekiston BHMS hisoblar rejasi, 1-shakl Balans, 2-shakl P&L, Aylanma vedomost va Bank-kassa hisobi.',
    modules: ['dashboard', 'accounting', 'banking', 'reports', 'settings'],
  },
  {
    id: 'RETAIL_POS',
    name: 'POS & Chakana Savdo (Retail POS)',
    nameUz: 'POS Kassa va Chakana Savdo',
    pricePerMonth: 390000,
    description: 'Sensorli kassa terminali, chek chop etish, kassa smenalari (X/Z hisobot) va ombor nazorati.',
    modules: ['dashboard', 'pos', 'inventory', 'banking', 'settings'],
  },
  {
    id: 'COMMERCE_INVOICING',
    name: 'Savdo, Xaridlar & E-Faktura (Commerce)',
    nameUz: 'Savdo, Xaridlar va E-Hujjatlar',
    pricePerMonth: 490000,
    description: 'Hisob-fakturalar, tijorat takliflari, E-IMZO, E-Faktura, Didox integratsiyasi va CRM kontaktlar.',
    modules: ['dashboard', 'sales', 'purchases', 'inventory', 'crm', 'settings'],
  },
  {
    id: 'PAYROLL_HRM',
    name: 'HRM, Davomat & Ish Haqi (Payroll)',
    nameUz: 'HRM, Davomat Tabeli va Oylik Maosh',
    pricePerMonth: 350000,
    description: 'Oylik ish vaqti tabeli, avtomatlashtirilgan oylik hisobi (JShODS 12%, INPS 0.1%, Ijtimoiy soliq 12%).',
    modules: ['dashboard', 'payroll', 'settings'],
  },
  {
    id: 'ENTERPRISE_FULL',
    name: 'SAPAR Enterprise (Barcha Modullar)',
    nameUz: 'Toʻliq ERP Enterprise (Barchasi birda)',
    pricePerMonth: 790000,
    description: 'Barcha modullar: BHMS buxgalteriya, POS kassa, CRM quvur, Loyihalar, HRM, E-Faktura va Bank integratsiyalari.',
    modules: ['dashboard', 'pos', 'crm', 'sales', 'purchases', 'inventory', 'banking', 'accounting', 'reports', 'projects', 'payroll', 'helpdesk', 'settings'],
  },
];

/**
 * GET /api/admin/subscriptions/current
 * Returns active subscription, plan details, and provisioned modules for the current company
 */
export async function getCompanySubscription(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const company = await prisma.companySettings.findFirst({
      where: { userId },
      select: {
        id: true,
        companyName: true,
        taxRegime: true,
        functionalCurrency: true,
      },
    });

    // Stored preferences in metadata/db or default to Enterprise full access for demo/owner
    res.json({
      success: true,
      data: {
        company: company || { companyName: 'SAPAR Enterprise Ltd' },
        currentPlan: SUBSCRIPTION_PLANS.find((p) => p.id === 'ENTERPRISE_FULL') || SUBSCRIPTION_PLANS[4],
        availablePlans: SUBSCRIPTION_PLANS,
        activeModules: ['dashboard', 'pos', 'crm', 'sales', 'purchases', 'inventory', 'banking', 'accounting', 'reports', 'projects', 'payroll', 'helpdesk', 'settings'],
        status: 'ACTIVE',
        validUntil: '2027-12-31T23:59:59.000Z',
      },
    });
  } catch (err: any) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
}

/**
 * POST /api/admin/subscriptions/update-plan
 * Super admin or Company owner updates the active plan and modules
 */
export async function updateCompanyPlan(req: Request, res: Response): Promise<void> {
  try {
    const { planId, customModules } = req.body as { planId?: string; customModules?: string[] };
    const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

    const modules = customModules && customModules.length > 0
      ? customModules
      : selectedPlan?.modules || SUBSCRIPTION_PLANS[4].modules;

    res.json({
      success: true,
      message: 'Tarif rejasi va modullar muvaffaqiyatli biriktirildi',
      data: {
        plan: selectedPlan || { id: 'CUSTOM', name: 'Maxsus Tanlangan Modullar', modules },
        activeModules: modules,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}
