import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';

/**
 * Contras Controller (Oʻzaro hisob-kitob / Взаимозачет)
 *
 * Implements Bukhgalteriya-standard offset between Customer Receivables (4010)
 * and Supplier Payables (6010) for mutual business counterparties.
 */

function getContactName(c: { firstName?: string | null; lastName?: string | null; organisation?: string | null }): string {
  if (c.organisation) return c.organisation;
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.join(' ') || 'Nomsiz kontakt';
}

export async function listContras(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)));

    const where: Prisma.JournalEntryWhereInput = {
      userId,
      isDeleted: false,
      OR: [
        { reference: { startsWith: 'CONTRA' } },
        { description: { contains: 'vzaimozachet', mode: 'insensitive' } },
        { description: { contains: 'oʻzaro hisob', mode: 'insensitive' } },
        { description: { contains: 'ozaro hisob', mode: 'insensitive' } },
      ],
    };

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          lines: {
            include: {
              account: { select: { id: true, code: true, name: true, accountType: true } },
            },
          },
        },
        orderBy: { entryDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    const contras = entries.map((e) => {
      const debitLine = e.lines.find((l) => Number(l.debit) > 0);
      const creditLine = e.lines.find((l) => Number(l.credit) > 0);
      const amount = Number(debitLine?.debit || creditLine?.credit || 0);

      return {
        id: e.id,
        contraNumber: e.entryNumber || e.reference || `CONTRA-${e.id.slice(0, 8)}`,
        reference: e.reference,
        date: e.entryDate,
        description: e.description,
        amount,
        lines: e.lines,
        status: 'POSTED',
        createdAt: e.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        contras,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('listContras error:', err);
    res.status(500).json({ success: false, message: 'Failed to list contras' });
  }
}

export async function getEligibleContacts(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);

    // Find contacts who have invoices AND (expenses OR supplier transactions)
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organisation: true,
        email: true,
        telephone: true,
        mobile: true,
        vatRegNumber: true,
      },
    });

    const eligible = [];

    for (const c of contacts) {
      const contactDisplayName = getContactName(c);

      // 1. Unpaid / partially paid Sales Invoices (Receivable)
      const invoices = await prisma.invoice.findMany({
        where: {
          userId,
          contactId: c.id,
          status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE', 'UNPAID'] },
          isDeleted: false,
        },
        select: {
          id: true,
          invoiceNumber: true,
          TotalAmount: true,
          invoiceDate: true,
          payments: {
            select: { amount: true },
          },
        },
      });

      const receivable = invoices.reduce((sum, inv) => {
        const paidAmount = (inv.payments || []).reduce((pSum, p) => pSum + Number(p.amount), 0);
        const remaining = Number(inv.TotalAmount) - paidAmount;
        return sum + Math.max(0, remaining);
      }, 0);

      // 2. Unpaid / partially paid Expenses (Payable)
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          contactId: c.id,
          paymentStatus: 'PENDING',
          isDeleted: false,
        },
        select: {
          id: true,
          expenseId: true,
          amount: true,
          paymentStatus: true,
          expenseDate: true,
        },
      });

      const payable = expenses.reduce((sum, exp) => {
        return sum + Math.max(0, Number(exp.amount));
      }, 0);

      const maxContra = Math.min(receivable, payable);

      if (receivable > 0 || payable > 0) {
        eligible.push({
          contact: {
            ...c,
            name: contactDisplayName,
            phone: c.telephone || c.mobile || '',
            taxNumber: c.vatRegNumber || '',
          },
          receivableBalance: receivable,
          payableBalance: payable,
          maxSettlableAmount: maxContra,
          isEligibleForContra: maxContra > 0,
          unpaidInvoicesCount: invoices.length,
          unpaidExpensesCount: expenses.length,
        });
      }
    }

    res.json({
      success: true,
      data: {
        contacts: eligible,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('getEligibleContacts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch contra contacts' });
  }
}

export async function getContactContraDetails(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { contactId } = req.params as { contactId: string };

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId, isDeleted: false },
    });

    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found' });
      return;
    }

    const [invoices, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          contactId,
          isDeleted: false,
        },
        orderBy: { invoiceDate: 'asc' },
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          dueDate: true,
          TotalAmount: true,
          status: true,
          payments: {
            select: { amount: true },
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          contactId,
          isDeleted: false,
        },
        orderBy: { expenseDate: 'asc' },
        select: {
          id: true,
          expenseId: true,
          expenseDate: true,
          amount: true,
          paymentStatus: true,
          expenseCategory: { select: { title: true } },
        },
      }),
    ]);

    const openInvoices = invoices.map((inv) => {
      const paid = (inv.payments || []).reduce((s, p) => s + Number(p.amount), 0);
      const remaining = Math.max(0, Number(inv.TotalAmount) - paid);
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: Number(inv.TotalAmount),
        paidAmount: paid,
        status: inv.status,
        remainingAmount: remaining,
      };
    });

    const openExpenses = expenses.map((exp) => {
      const paid = exp.paymentStatus === 'PAID' ? Number(exp.amount) : 0;
      const remaining = exp.paymentStatus === 'PAID' ? 0 : Number(exp.amount);
      return {
        id: exp.id,
        expenseNumber: exp.expenseId,
        expenseDate: exp.expenseDate,
        amount: Number(exp.amount),
        paidAmount: paid,
        status: exp.paymentStatus,
        category: exp.expenseCategory?.title || 'Expense',
        remainingAmount: remaining,
      };
    });

    const totalReceivable = openInvoices.reduce((s, i) => s + i.remainingAmount, 0);
    const totalPayable = openExpenses.reduce((s, e) => s + e.remainingAmount, 0);
    const maxSettlable = Math.min(totalReceivable, totalPayable);

    res.json({
      success: true,
      data: {
        contact: {
          ...contact,
          name: getContactName(contact),
          phone: contact.telephone || contact.mobile || '',
          taxNumber: contact.vatRegNumber || '',
        },
        invoices: openInvoices,
        expenses: openExpenses,
        totalReceivable,
        totalPayable,
        maxSettlable,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('getContactContraDetails error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch contact contra details' });
  }
}

export async function createContra(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const body = req.body as {
      contactId: string;
      date?: string;
      amount: number;
      remarks?: string;
      invoiceAllocations?: Array<{ invoiceId: string; amount: number }>;
      expenseAllocations?: Array<{ expenseId: string; amount: number }>;
    };

    const { contactId, amount } = body;
    if (!contactId || !amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Contact ID and valid settlement amount are required' });
      return;
    }

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId, isDeleted: false },
    });
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found' });
      return;
    }

    const contactDisplayName = getContactName(contact);

    // Find accounts for AP (6010) and AR (4010)
    let arAccount = await prisma.account.findFirst({
      where: {
        userId,
        isDeleted: false,
        OR: [
          { code: '4010' },
          { code: { startsWith: '40' } },
          { accountType: 'ASSET', name: { contains: 'Receivable', mode: 'insensitive' } },
          { accountType: 'ASSET', name: { contains: 'Xaridor', mode: 'insensitive' } },
        ],
      },
    });

    let apAccount = await prisma.account.findFirst({
      where: {
        userId,
        isDeleted: false,
        OR: [
          { code: '6010' },
          { code: { startsWith: '60' } },
          { accountType: 'LIABILITY', name: { contains: 'Payable', mode: 'insensitive' } },
          { accountType: 'LIABILITY', name: { contains: 'Yetkazib', mode: 'insensitive' } },
        ],
      },
    });

    if (!arAccount) {
      arAccount = await prisma.account.findFirst({ where: { userId, accountType: 'ASSET', isDeleted: false } });
    }
    if (!apAccount) {
      apAccount = await prisma.account.findFirst({ where: { userId, accountType: 'LIABILITY', isDeleted: false } });
    }

    if (!arAccount || !apAccount) {
      res.status(400).json({
        success: false,
        message: 'Accounts Receivable or Accounts Payable ledger account not found. Please ensure Chart of Accounts is seeded.',
      });
      return;
    }

    const settlementAmount = new Prisma.Decimal(Number(amount));
    const entryDate = body.date ? new Date(body.date) : new Date();
    const contraRef = `CONTRA-${Date.now().toString().slice(-6)}`;

    // Generate Journal Entry:
    // Debit 6010 (Accounts Payable decreases)
    // Credit 4010 (Accounts Receivable decreases)
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId,
        entryNumber: contraRef,
        entryDate,
        reference: contraRef,
        description: body.remarks || `Oʻzaro hisob-kitob (Взаимозачет) — ${contactDisplayName}`,
        lines: {
          create: [
            {
              accountId: apAccount.id,
              debit: settlementAmount,
              credit: new Prisma.Decimal(0),
              baseDebit: settlementAmount,
              baseCredit: new Prisma.Decimal(0),
              currencyCode: 'UZS',
              exchangeRate: new Prisma.Decimal(1),
              description: `Debit 6010 Majburiyat kamayishi (${contactDisplayName})`,
            },
            {
              accountId: arAccount.id,
              debit: new Prisma.Decimal(0),
              credit: settlementAmount,
              baseDebit: new Prisma.Decimal(0),
              baseCredit: settlementAmount,
              currencyCode: 'UZS',
              exchangeRate: new Prisma.Decimal(1),
              description: `Credit 4010 Talab kamayishi (${contactDisplayName})`,
            },
          ],
        },
      },
      include: { lines: true },
    });

    // Update allocated invoices paid status if provided
    if (body.invoiceAllocations && body.invoiceAllocations.length > 0) {
      for (const alloc of body.invoiceAllocations) {
        if (alloc.amount > 0) {
          const inv = await prisma.invoice.findUnique({
            where: { id: alloc.invoiceId },
            include: { payments: true },
          });
          if (inv) {
            const currentPaid = (inv.payments || []).reduce((s, p) => s + Number(p.amount), 0);
            const newTotalPaid = currentPaid + Number(alloc.amount);
            const isFull = newTotalPaid >= Number(inv.TotalAmount);
            await prisma.invoice.update({
              where: { id: alloc.invoiceId },
              data: {
                status: isFull ? 'PAID' : 'PARTIALLY_PAID',
              },
            });
          }
        }
      }
    }

    // Update allocated expenses paid status if provided
    if (body.expenseAllocations && body.expenseAllocations.length > 0) {
      for (const alloc of body.expenseAllocations) {
        if (alloc.amount > 0) {
          const exp = await prisma.expense.findUnique({ where: { id: alloc.expenseId } });
          if (exp) {
            await prisma.expense.update({
              where: { id: alloc.expenseId },
              data: {
                paymentStatus: 'PAID',
              },
            });
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Contra offset created successfully',
      data: {
        journalEntry,
        contraNumber: contraRef,
        amount: Number(amount),
        contactName: contactDisplayName,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('createContra error:', err);
    res.status(500).json({ success: false, message: 'Failed to create contra offset' });
  }
}

const contraController = {
  listContras,
  getEligibleContacts,
  getContactContraDetails,
  createContra,
};

export default contraController;
module.exports = contraController;
module.exports.default = contraController;
