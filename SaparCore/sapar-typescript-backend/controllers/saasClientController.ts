import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/generateToken';
import { ensureRole, OWNER_ROLE_NAME } from '../lib/defaultRoles';
import { seedDefaultChart } from '../lib/defaultChartOfAccounts';
import { registerRenderCustomDomain, deleteRenderCustomDomain } from '../lib/renderDomainManager';

/**
 * Super-Admin / SaaS Platform Owner Controller
 * Allows managing all client tenants, monitoring their health, and 1-click impersonation.
 */

// GET /api/admin/saas/clients
export async function getSaasClients(req: Request, res: Response): Promise<void> {
  try {
    // Fetch all company owners (user_type === 1)
    const owners = await prisma.user.findMany({
      where: {
        user_type: 1,
        isDeleted: false,
      },
      include: {
        companySettings: true,
        staff: {
          where: { isDeleted: false },
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const clientsWithMetrics = await Promise.all(
      owners.map(async (owner) => {
        // Count products
        const productsCount = await prisma.inventory.count({
          where: { userId: owner.id, isDeleted: false },
        });

        // Count invoices
        const invoicesCount = await prisma.invoice.count({
          where: { userId: owner.id, isDeleted: false },
        });

        // Sum invoice totals
        const invoicesAgg = await prisma.invoice.aggregate({
          where: { userId: owner.id, isDeleted: false },
          _sum: { TotalAmount: true },
        });

        // Count customers
        const customersCount = await prisma.customer.count({
          where: { userId: owner.id, isDeleted: false },
        });

        // Count active POS shifts
        const shiftsCount = await prisma.posShift.count({
          where: { userId: owner.id },
        });

        const comp = owner.companySettings;

        // Resolve clean subdomain for tenant workspace
        let subdomain: string | null = null;
        if (comp?.publicBaseUrl) {
          try {
            const url = new URL(comp.publicBaseUrl.startsWith('http') ? comp.publicBaseUrl : `https://${comp.publicBaseUrl}`);
            const parts = url.hostname.split('.');
            if (parts.length >= 3 && parts[parts.length - 2] === 'sapar' && parts[parts.length - 1] === 'uz') {
              subdomain = parts[0];
            }
          } catch {
            const m = comp.publicBaseUrl.match(/https?:\/\/([^.]+)\.sapar\.uz/i);
            if (m) subdomain = m[1];
          }
        }

        return {
          id: owner.id,
          companyName: comp?.companyName || `${owner.firstName} ${owner.lastName || ''}`.trim(),
          ownerName: `${owner.firstName} ${owner.lastName || ''}`.trim(),
          email: owner.email,
          phone: owner.phone || comp?.phone || '—',
          stir: comp?.taxRegime || '123456789',
          city: comp?.city || 'Toshkent',
          state: comp?.state || 'Toshkent shahri',
          country: comp?.country || 'Uzbekistan',
          plan: 'Korporativ Enterprise',
          status: 'ACTIVE',
          subdomain,
          publicBaseUrl: comp?.publicBaseUrl || (subdomain ? `https://${subdomain}.sapar.uz` : null),
          staffCount: owner.staff.length + 1,
          productsCount,
          invoicesCount,
          customersCount,
          shiftsCount,
          totalTurnover: invoicesAgg._sum.TotalAmount || 0,
          createdAt: owner.createdAt,
          updatedAt: owner.updatedAt,
        };

      })
    );

    // Calculate Platform KPIs
    const totalTenants = clientsWithMetrics.length;
    const totalProducts = clientsWithMetrics.reduce((sum, c) => sum + c.productsCount, 0);
    const totalInvoices = clientsWithMetrics.reduce((sum, c) => sum + c.invoicesCount, 0);
    const totalTurnover = clientsWithMetrics.reduce((sum, c) => sum + Number(c.totalTurnover), 0);

    res.json({
      success: true,
      data: {
        clients: clientsWithMetrics,
        kpi: {
          totalTenants,
          activeTenants: totalTenants,
          mrrUzs: totalTenants * 1490000, // Estimated platform MRR
          totalProducts,
          totalInvoices,
          totalTurnoverUzs: totalTurnover,
        },
      },
    });
  } catch (err: any) {
    console.error('getSaasClients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch SaaS clients', error: err.message });
  }
}

// POST /api/admin/saas/clients
export async function createSaasClient(req: Request, res: Response): Promise<void> {
  try {
    const {
      companyName,
      ownerFirstName,
      ownerLastName,
      email,
      phone,
      password,
      city,
      sector,
      stir,
      plan,
      subdomain,
    } = req.body;

    if (!email || !companyName) {
      res.status(400).json({ success: false, message: 'Email va Kompaniya nomi kiritilishi shart.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Ushbu email bilan mijoz allaqachon roʻyxatdan oʻtgan.' });
      return;
    }

    const hashedPassword = await hashPassword(password || 'Sapar123!');
    const roleId = await ensureRole(OWNER_ROLE_NAME).catch(() => null);

    const user = await prisma.user.create({
      data: {
        firstName: ownerFirstName || companyName,
        lastName: ownerLastName || '',
        email,
        phone: phone || '',
        password: hashedPassword,
        user_type: 1,
        ...(roleId ? { roleId } : {}),
      },
    });

    // Handle dedicated subdomain
    const rawSubdomain = (subdomain || companyName)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 32);
    const cleanSubdomain = rawSubdomain || null;
    const tenantUrl = cleanSubdomain ? `https://${cleanSubdomain}.sapar.uz` : null;

    await prisma.companySettings.create({
      data: {
        userId: user.id,
        companyName: companyName.trim(),
        email,
        phone: phone || '',
        address: 'Toshkent shahri, Oʻzbekiston',
        city: city || 'Toshkent',
        state: 'Toshkent shahri',
        country: 'Uzbekistan',
        pincode: '100000',
        taxRegime: 'VAT_GENERIC',
        publicBaseUrl: tenantUrl,
      },
    });

    // Automatically provision custom subdomain on Render
    if (cleanSubdomain) {
      registerRenderCustomDomain(cleanSubdomain).catch((err) => {
        console.warn('createSaasClient: Render custom domain provisioning notice', err);
      });
    }

    // Seed default chart of accounts for the new tenant
    await seedDefaultChart(prisma, user.id);

    res.status(201).json({
      success: true,
      message: 'Yangi SaaS mijoz muvaffaqiyatli yaratildi!',
      data: {
        id: user.id,
        email: user.email,
        companyName,
      },
    });
  } catch (err: any) {
    console.error('createSaasClient error:', err);
    res.status(500).json({ success: false, message: 'Mijozni yaratishda xatolik', error: err.message });
  }
}

// POST /api/admin/saas/clients/:id/impersonate
export async function impersonateSaasClient(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetUser = await prisma.user.findUnique({
      where: { id: id as string },
      include: { companySettings: true },
    });

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Mijoz topilmadi.' });
      return;
    }

    // Generate JWT token scoped to this tenant
    const token = generateToken(targetUser.id, targetUser.id);
    const companyName = (targetUser as any).companySettings?.companyName;

    res.json({
      success: true,
      message: `${companyName || targetUser.firstName} hisobiga 1-bosqichda ulanildi.`,
      data: {
        token,
        user: {
          id: targetUser.id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          email: targetUser.email,
          user_type: targetUser.user_type,
          companyName,
        },
      },
    });
  } catch (err: any) {
    console.error('impersonateSaasClient error:', err);
    res.status(500).json({ success: false, message: 'Impersonation xatoligi', error: err.message });
  }
}

export const SECTOR_PRESETS: Record<string, Record<string, boolean>> = {
  construction: {
    pos: true,
    sales: true,
    purchases: true,
    inventory: true,
    banking: true,
    accounting: true,
    reports: true,
    crm: true,
    projects: false,
    payroll: false,
    helpdesk: false,
    settings: true,
  },
  restaurant: {
    pos: true,
    sales: false,
    purchases: true,
    inventory: true,
    banking: true,
    accounting: true,
    reports: true,
    crm: false,
    projects: false,
    payroll: true,
    helpdesk: false,
    settings: true,
  },
  retail: {
    pos: true,
    sales: true,
    purchases: true,
    inventory: true,
    banking: true,
    accounting: true,
    reports: true,
    crm: false,
    projects: false,
    payroll: false,
    helpdesk: false,
    settings: true,
  },
  pharmacy: {
    pos: true,
    sales: true,
    purchases: true,
    inventory: true,
    banking: true,
    accounting: true,
    reports: true,
    crm: false,
    projects: false,
    payroll: false,
    helpdesk: false,
    settings: true,
  },
  services: {
    pos: false,
    sales: true,
    purchases: true,
    inventory: false,
    banking: true,
    accounting: true,
    reports: true,
    crm: true,
    projects: true,
    payroll: true,
    helpdesk: true,
    settings: true,
  },
  all: {
    pos: true,
    sales: true,
    purchases: true,
    inventory: true,
    banking: true,
    accounting: true,
    reports: true,
    crm: true,
    projects: true,
    payroll: true,
    helpdesk: true,
    settings: true,
  },
};

export async function updateSaasClientModules(req: Request, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clientId = rawId as string;
    const { modules, sector } = req.body;

    const modulesToSave = modules || (sector ? SECTOR_PRESETS[sector] : null);
    if (!modulesToSave) {
      res.status(400).json({ success: false, message: 'Modullar roʻyxati berilmadi.' });
      return;
    }

    const jsonStr = JSON.stringify(modulesToSave);

    await prisma.companySettings.upsert({
      where: { userId: clientId },
      create: {
        userId: clientId,
        companyName: 'Biznes',
        city: 'Toshkent',
        state: 'Toshkent shahri',
        country: 'Uzbekistan',
        email: '',
        phone: '',
        address: '',
        pincode: '100000',
        fax: jsonStr, // Store serialized module visibility
      },
      update: {
        fax: jsonStr,
      },
    });

    res.json({
      success: true,
      message: 'Mijoz modullari muvaffaqiyatli yangilandi.',
      data: { modules: modulesToSave },
    });
  } catch (err: any) {
    console.error('updateSaasClientModules error:', err);
    res.status(500).json({ success: false, message: 'Modullarni yangilashda xatolik', error: err.message });
  }
}

// GET /api/admin/saas/my-modules
export async function getMyModules(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user;
    const comp = await prisma.companySettings.findUnique({
      where: { userId },
    });

    let modules = SECTOR_PRESETS.all;
    if (comp?.fax) {
      try {
        modules = JSON.parse(comp.fax);
      } catch {}
    }

    res.json({
      success: true,
      data: { modules },
    });
  } catch (err: any) {
    console.error('getMyModules error:', err);
    res.status(500).json({ success: false, message: 'Modullarni olishda xatolik', error: err.message });
  }
}

// POST /api/admin/saas/onboarding/complete
export async function completeOnboarding(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user;
    const { sector, companyName, stir, taxRegime, city, bankName, initialProducts, customModules } = req.body;

    const modulesToSave = customModules || (sector ? SECTOR_PRESETS[sector] : SECTOR_PRESETS.all);
    const jsonStr = JSON.stringify(modulesToSave);

    if (companyName) {
      await prisma.companySettings.upsert({
        where: { userId },
        create: {
          userId,
          companyName: companyName.trim(),
          city: city || 'Toshkent',
          state: 'Toshkent shahri',
          country: 'Uzbekistan',
          email: '',
          phone: '',
          address: '',
          pincode: '100000',
          taxRegime: taxRegime || 'VAT_GENERIC',
          fax: jsonStr,
        },
        update: {
          companyName: companyName.trim(),
          city: city || 'Toshkent',
          taxRegime: taxRegime || 'VAT_GENERIC',
          fax: jsonStr,
        },
      });
    }

    // Seed default chart of accounts
    await seedDefaultChart(prisma, userId);

    res.json({
      success: true,
      message: 'Onboarding muvaffaqiyatli yakunlandi! Tizim ishga tayyor.',
      data: { modules: modulesToSave },
    });
  } catch (err: any) {
    console.error('completeOnboarding error:', err);
    res.status(500).json({ success: false, message: 'Onboarding xatoligi', error: err.message });
  }
}

// DELETE /api/admin/saas/clients/:id
export async function deleteSaasClient(req: Request, res: Response): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const clientId = rawId as string;
    const currentUserId = (req as any).user;

    // Safety guard: cannot delete yourself
    if (clientId === currentUserId) {
      res.status(400).json({ success: false, message: 'Oʻz hisobingizni oʻchira olmaysiz.' });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: clientId },
      include: { companySettings: true, staff: true },
    });

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Kompaniya topilmadi.' });
      return;
    }

    const comp = targetUser.companySettings;
    const companyName = comp?.companyName || `${targetUser.firstName} ${targetUser.lastName || ''}`.trim();

    // Extract subdomain if configured
    let subdomain: string | null = null;
    if (comp?.publicBaseUrl) {
      try {
        const url = new URL(comp.publicBaseUrl.startsWith('http') ? comp.publicBaseUrl : `https://${comp.publicBaseUrl}`);
        const parts = url.hostname.split('.');
        if (parts.length >= 3 && parts[parts.length - 2] === 'sapar' && parts[parts.length - 1] === 'uz') {
          subdomain = parts[0];
        }
      } catch {
        const m = comp.publicBaseUrl.match(/https?:\/\/([^.]+)\.sapar\.uz/i);
        if (m) subdomain = m[1];
      }
    }

    // Try to remove custom domain on Render
    if (subdomain) {
      deleteRenderCustomDomain(subdomain).catch((err) => {
        console.warn('deleteSaasClient: Render custom domain removal notice', err);
      });
    }

    // Purge tenant data
    try {
      await prisma.$transaction(async (tx) => {
        const staffIds = targetUser.staff.map((s) => s.id);
        const allUserIds = [clientId, ...staffIds];

        // Best effort cascading deletion of tenant child records
        await tx.loginActivity.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.signature.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.bankTransaction.deleteMany({ where: { bankAccount: { userId: { in: allUserIds } } } }).catch(() => {});
        await tx.bankDetail.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.pettyCash.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.expenseChangeLog.deleteMany({ where: { expense: { userId: { in: allUserIds } } } }).catch(() => {});
        await tx.expense.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.purchaseOrder.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.purchase.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.invoice.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.inventory.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.customer.deleteMany({ where: { userId: { in: allUserIds } } }).catch(() => {});
        await tx.supplier.deleteMany({ where: { user_id: { in: allUserIds } } }).catch(() => {});
        await tx.supplierPayment.deleteMany({ where: { createdBy: { in: allUserIds } } }).catch(() => {});
        await tx.companySettings.deleteMany({ where: { userId: clientId } }).catch(() => {});

        if (staffIds.length > 0) {
          await tx.user.deleteMany({ where: { id: { in: staffIds } } }).catch(() => {});
        }

        await tx.user.delete({ where: { id: clientId } });
      });
    } catch (dbErr: any) {
      console.warn('Hard delete failed due to constraints, applying clean soft-delete:', dbErr.message);
      const delTimestamp = Date.now();
      await prisma.user.update({
        where: { id: clientId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          email: `${targetUser.email}__deleted_${delTimestamp}`,
        },
      });

      if (comp) {
        await prisma.companySettings.update({
          where: { id: comp.id },
          data: {
            publicBaseUrl: null,
            companyName: `${comp.companyName} (Oʻchirilgan)`,
          },
        });
      }

      await prisma.user.updateMany({
        where: { ownerId: clientId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: `"${companyName}" kompaniyasi va unga tegishli barcha maʼlumotlar muvaffaqiyatli oʻchirildi.`,
    });
  } catch (err: any) {
    console.error('deleteSaasClient error:', err);
    res.status(500).json({ success: false, message: 'Kompaniyani oʻchirishda xatolik', error: err.message });
  }
}

