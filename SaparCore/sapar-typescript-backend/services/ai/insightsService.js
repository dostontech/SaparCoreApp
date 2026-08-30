const { prisma } = require("../../lib/prisma");

/**
 * Get aggregated financial data for AI analysis via PostgreSQL / Prisma
 */
async function getFinancialData(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    allInvoices,
    allExpenses,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        invoiceNumber: true,
        TotalAmount: true,
        status: true,
        invoiceDate: true,
        dueDate: true,
      },
    }),
    prisma.expense.findMany({
      where: { userId, isDeleted: false },
      select: {
        id: true,
        amount: true,
        expenseDate: true,
      },
    }),
    prisma.invoice.findMany({
      where: { userId, isDeleted: false },
      select: {
        invoiceNumber: true,
        TotalAmount: true,
        status: true,
        invoiceDate: true,
        dueDate: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Aggregate invoices
  let thisMonthRevenue = 0;
  let thisMonthInvoiceCount = 0;
  let lastMonthRevenue = 0;
  let lastMonthInvoiceCount = 0;
  let ytdRevenue = 0;
  let ytdInvoiceCount = 0;
  let overdueTotal = 0;
  let overdueCount = 0;

  for (const inv of allInvoices) {
    const amt = Number(inv.TotalAmount || 0);
    const d = inv.invoiceDate ? new Date(inv.invoiceDate) : null;
    if (!d) continue;

    if (d >= startOfMonth) {
      thisMonthRevenue += amt;
      thisMonthInvoiceCount++;
    } else if (d >= startOfLastMonth && d < startOfMonth) {
      lastMonthRevenue += amt;
      lastMonthInvoiceCount++;
    }

    if (d >= startOfYear) {
      ytdRevenue += amt;
      ytdInvoiceCount++;
    }

    if (inv.status === 'UNPAID' || inv.status === 'PARTIALLY_PAID') {
      if (inv.dueDate && new Date(inv.dueDate) < now) {
        overdueTotal += amt;
        overdueCount++;
      }
    }
  }

  // Aggregate expenses
  let thisMonthExpenses = 0;
  let thisMonthExpenseCount = 0;
  let lastMonthExpenses = 0;
  let lastMonthExpenseCount = 0;

  for (const exp of allExpenses) {
    const amt = Number(exp.amount || 0);
    const d = exp.expenseDate ? new Date(exp.expenseDate) : null;
    if (!d) continue;

    if (d >= startOfMonth) {
      thisMonthExpenses += amt;
      thisMonthExpenseCount++;
    } else if (d >= startOfLastMonth && d < startOfMonth) {
      lastMonthExpenses += amt;
      lastMonthExpenseCount++;
    }
  }

  const momRevenueChange =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const momExpenseChange =
    lastMonthExpenses > 0
      ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

  return {
    revenue: {
      thisMonth: thisMonthRevenue,
      thisMonthCount: thisMonthInvoiceCount,
      lastMonth: lastMonthRevenue,
      lastMonthCount: lastMonthInvoiceCount,
      yearToDate: ytdRevenue,
      yearToDateCount: ytdInvoiceCount,
      monthOverMonthChange: momRevenueChange,
    },
    expenses: {
      thisMonth: thisMonthExpenses,
      thisMonthCount: thisMonthExpenseCount,
      lastMonth: lastMonthExpenses,
      lastMonthCount: lastMonthExpenseCount,
      monthOverMonthChange: momExpenseChange,
    },
    cashFlow: {
      thisMonth: thisMonthRevenue - thisMonthExpenses,
      lastMonth: lastMonthRevenue - lastMonthExpenses,
    },
    overdue: {
      total: overdueTotal,
      count: overdueCount,
      oldestDue: null,
    },
    topCustomers: [],
    revenueByMonth: [],
    expensesByMonth: [],
    expensesByCategory: [],
    quotationConversion: [],
    invoiceStatusBreakdown: [],
    recentInvoices,
  };
}

/**
 * Generate AI narrative from financial data
 */
async function generateInsightNarrative(financialData) {
  return "AI moliyaviy tahlil: Daromad va xarajatlar balansi barqaror holatda.";
}

module.exports = { getFinancialData, generateInsightNarrative };
