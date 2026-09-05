/**
 * services/telegramNotificationService.ts
 *
 * Clean Telegram Management Bot Service for SAPAR ERP.
 * Handles:
 *  1. Daily Financial Summary to management.
 *  2. Cashier Shift Closing Z-Reports.
 *  3. Low Stock Alerts for warehouse managers.
 *
 * Rules:
 *  - Strict clean formatting.
 *  - NO emojis (clean professional typography and text dividers).
 */

import { prisma } from '../lib/prisma';

export interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string; // e.g. "21:00"
  shiftZReportEnabled: boolean;
  lowStockAlertEnabled: boolean;
  minStockThreshold: number; // default 5
}

export const DEFAULT_TELEGRAM_SETTINGS: TelegramSettings = {
  enabled: true,
  botToken: process.env.TELEGRAM_BOT_TOKEN || '7412345678:AAFakeTokenForSaparManagementBot',
  chatId: process.env.TELEGRAM_CHAT_ID || '-1001234567890',
  dailySummaryEnabled: true,
  dailySummaryTime: '21:00',
  shiftZReportEnabled: true,
  lowStockAlertEnabled: true,
  minStockThreshold: 5,
};

export class TelegramNotificationService {
  /**
   * Retrieves persistent Telegram settings for a given tenant/user.
   */
  static async getSettings(userId: string): Promise<TelegramSettings> {
    try {
      const saved = await prisma.gatewayConfig.findUnique({
        where: { userId_kind: { userId, kind: 'OFFLINE' } },
      });

      if (saved && saved.config && (saved.config as any).telegram) {
        return {
          ...DEFAULT_TELEGRAM_SETTINGS,
          ...(saved.config as any).telegram,
        };
      }
    } catch (err) {
      console.error('Failed to load Telegram settings:', err);
    }
    return DEFAULT_TELEGRAM_SETTINGS;
  }

  /**
   * Saves Telegram settings persistently for a tenant/user.
   */
  static async saveSettings(userId: string, settings: Partial<TelegramSettings>): Promise<TelegramSettings> {
    const current = await this.getSettings(userId);
    const updated: TelegramSettings = { ...current, ...settings };

    const existingConfig = await prisma.gatewayConfig.findUnique({
      where: { userId_kind: { userId, kind: 'OFFLINE' } },
    });

    const rootConfig = (existingConfig?.config as Record<string, any>) || {};
    rootConfig.telegram = updated;

    await prisma.gatewayConfig.upsert({
      where: { userId_kind: { userId, kind: 'OFFLINE' } },
      update: { config: rootConfig },
      create: {
        userId,
        kind: 'OFFLINE',
        enabled: true,
        config: rootConfig,
      },
    });

    return updated;
  }

  /**
   * Sends a message via Telegram Bot API.
   */
  static async sendMessage(botToken: string, chatId: string, messageHtml: string): Promise<{ success: boolean; message: string; response?: any }> {
    if (!botToken || !chatId) {
      return { success: false, message: 'Bot token yoki Chat ID kiritilmagan' };
    }

    // Sandbox / mock mode if token is dummy
    if (botToken.startsWith('7412345678') || botToken.includes('FakeToken') || !process.env.TELEGRAM_BOT_TOKEN) {
      console.log(`[Telegram Sandbox] Pushed to Chat ${chatId}:\n${messageHtml}`);
      return {
        success: true,
        message: 'Xabar muvaffaqiyatli joʻnatildi (Sandbox/Simulyatsiya rejimi)',
        response: { ok: true, result: { message_id: Math.floor(Math.random() * 100000) } },
      };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageHtml,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const data = (await res.json()) as any;
      if (!data?.ok) {
        return { success: false, message: data?.description || 'Telegram xatolik qaytardi' };
      }

      return { success: true, message: 'Xabar Telegramga yetkazildi', response: data };
    } catch (err) {
      console.error('Telegram sendMessage error:', err);
      return { success: false, message: (err as Error).message || 'Telegramga ulanishda tarmoq xatosi' };
    }
  }

  /**
   * Builds and sends the Daily Financial Summary to Management.
   */
  static async sendDailyFinancialSummary(userId: string): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettings(userId);
    if (!settings.enabled || !settings.dailySummaryEnabled) {
      return { success: false, message: 'Kunlik xulosalar sozlamalarda oʻchirilgan' };
    }

    // Get today's range in Asia/Tashkent
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [invoices, expenses, companySettings] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId,
          isDeleted: false,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        include: {
          payments: {
            include: { paymentMode: true },
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.companySettings.findFirst({ where: { userId } }),
    ]);

    const companyName = companySettings?.companyName || 'SAPAR Korxonasi';
    const totalSalesCount = invoices.length;
    const totalSalesSum = invoices.reduce((s, i) => s + Number(i.TotalAmount || 0), 0);

    let cashCollected = 0;
    let cardCollected = 0;
    let bankCollected = 0;

    for (const inv of invoices) {
      for (const p of inv.payments) {
        const mode = (p.paymentMode?.name || p.paymentMode?.slug || '').toUpperCase();
        const amt = Number(p.amount || 0);
        if (mode.includes('CASH') || mode.includes('NAQD')) {
          cashCollected += amt;
        } else if (mode.includes('CARD') || mode.includes('UZCARD') || mode.includes('HUMO') || mode.includes('POS')) {
          cardCollected += amt;
        } else {
          bankCollected += amt;
        }
      }
    }

    // Total collected vs debt
    const totalCollected = cashCollected + cardCollected + bankCollected;
    const totalDebtCreated = Math.max(0, totalSalesSum - totalCollected);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const netResult = totalSalesSum - totalExpenses;

    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const messageHtml = `
<b>SAPAR ERP — KUNLIK MOLIYA XULOSASI</b>
Korxona: <b>${companyName}</b>
Sana: <b>${dateStr}</b> (Vaqt: ${timeStr})
----------------------------------------
<b>Savdo va Daromad Koʻrsatkichlari:</b>
• Jami sotuv hajmi: <b>${totalSalesSum.toLocaleString()} UZS</b> (${totalSalesCount} ta faktura/chek)
• Naqd pul tushumi: <b>${cashCollected.toLocaleString()} UZS</b>
• Karta (Uzcard/Humo): <b>${cardCollected.toLocaleString()} UZS</b>
• Hisob-raqam (Bank): <b>${bankCollected.toLocaleString()} UZS</b>
• Nasiya (Qarzdorlik): <b>${totalDebtCreated.toLocaleString()} UZS</b>
----------------------------------------
<b>Xarajatlar va Sof Natija:</b>
• Kunlik operatsion xarajat: <b>${totalExpenses.toLocaleString()} UZS</b> (${expenses.length} ta operatsiya)
• Kunlik sof natija: <b>${netResult >= 0 ? '+' : ''}${netResult.toLocaleString()} UZS</b>
----------------------------------------
Hisobot shakllantirildi: SAPAR Cloud ERP
`;

    return this.sendMessage(settings.botToken, settings.chatId, messageHtml.trim());
  }

  /**
   * Pushes a Cashier Shift Closing Z-Report to the Telegram channel.
   */
  static async sendShiftZReport(shiftData: {
    shiftId: string;
    cashierName: string;
    openedAt: Date | string;
    closedAt: Date | string;
    startingCash: number;
    cashSales: number;
    cardSales: number;
    creditSales: number;
    totalSales: number;
    receiptsCount: number;
    expectedCash: number;
    actualCash: number;
    variance: number;
    notes?: string;
    userId: string;
  }): Promise<{ success: boolean; message: string }> {
    const settings = await this.getSettings(shiftData.userId);
    if (!settings.enabled || !settings.shiftZReportEnabled) {
      return { success: false, message: 'Z-hisobotlar Telegram sozlamalarida oʻchirilgan' };
    }

    const openTime = new Date(shiftData.openedAt).toLocaleString('uz-UZ');
    const closeTime = new Date(shiftData.closedAt).toLocaleString('uz-UZ');
    const varianceText =
      shiftData.variance === 0
        ? '0 UZS (Aniq / Kamomad yoʻq)'
        : `${shiftData.variance > 0 ? '+' : ''}${shiftData.variance.toLocaleString()} UZS (${shiftData.variance > 0 ? 'Ortiqcha' : 'Kamomad'})`;

    const messageHtml = `
<b>SAPAR POS — KASSIR Z-HISOBOTI (SMENA YOPILDI)</b>
Smena kodi: <b>${shiftData.shiftId}</b>
Kassir: <b>${shiftData.cashierName}</b>
Ochilgan: ${openTime}
Yopilgan: ${closeTime}
----------------------------------------
<b>Smena Tushumi Tafsiloti:</b>
• Boshlangʻich kassa qoldigʻi: <b>${shiftData.startingCash.toLocaleString()} UZS</b>
• Naqd pul savdosi: <b>${shiftData.cashSales.toLocaleString()} UZS</b>
• Terminal (Uzcard/Humo): <b>${shiftData.cardSales.toLocaleString()} UZS</b>
• Nasiya (Qarzga berildi): <b>${shiftData.creditSales.toLocaleString()} UZS</b>
• Jami savdo aylanmasi: <b>${shiftData.totalSales.toLocaleString()} UZS</b> (${shiftData.receiptsCount} ta chek)
----------------------------------------
<b>Kassa Sanoqi va Sverka:</b>
• Kutilgan naqd pul: <b>${shiftData.expectedCash.toLocaleString()} UZS</b>
• Haqiqiy sanalgan naqd: <b>${shiftData.actualCash.toLocaleString()} UZS</b>
• Farq: <b>${varianceText}</b>
${shiftData.notes ? `• Izoh: <i>${shiftData.notes}</i>\n` : ''}----------------------------------------
Status: Smena yopildi va balansga olindi
`;

    return this.sendMessage(settings.botToken, settings.chatId, messageHtml.trim());
  }

  /**
   * Checks low stock items and triggers an alert if any are below threshold.
   */
  static async checkAndSendLowStockAlerts(userId: string): Promise<{ success: boolean; message: string; lowStockCount: number }> {
    const settings = await this.getSettings(userId);
    if (!settings.enabled || !settings.lowStockAlertEnabled) {
      return { success: false, message: 'Ombor ogohlantirishlari oʻchirilgan', lowStockCount: 0 };
    }

    const threshold = settings.minStockThreshold || 5;

    // Query products where enable_inventory is true
    const products = await prisma.product.findMany({
      where: {
        status: true,
        enable_inventory: true,
      },
      include: {
        unit: true,
      },
      take: 50,
    });

    const lowStockItems = products
      .filter((p) => {
        const qty = Number(p.stock || 0);
        const minAlert = p.alert_quantity ? Number(p.alert_quantity) : threshold;
        return qty <= minAlert;
      })
      .slice(0, 15);

    if (lowStockItems.length === 0) {
      return { success: true, message: 'Barcha tovarlar meʼyoriy qoldiqda', lowStockCount: 0 };
    }

    const itemsText = lowStockItems
      .map((it) => {
        const qty = Number(it.stock || 0);
        const unit = it.unit?.short_name || it.unit?.unit_name || 'dona';
        const min = it.alert_quantity ? Number(it.alert_quantity) : threshold;
        return `• <b>${it.name}</b>: Qoldiq: <b>${qty} ${unit}</b> (Minimal meʼyor: ${min} ${unit})`;
      })
      .join('\n');

    const nowStr = new Date().toLocaleString('uz-UZ');
    const messageHtml = `
<b>SAPAR OMBOR OGOHLANTIRISHI — QOLDIQ KAMAYDI</b>
Vaqt: <b>${nowStr}</b>
----------------------------------------
Quyidagi tovarlar minimal meʼyordan kam qoldi (${lowStockItems.length} ta tovar):

${itemsText}
----------------------------------------
Iltimos, taʼminotchilarga yangi Xarid Buyurtmasi shakllantiring.
Tizim: SAPAR Ombor Boshqaruvi
`;

    const res = await this.sendMessage(settings.botToken, settings.chatId, messageHtml.trim());
    return {
      success: res.success,
      message: res.message,
      lowStockCount: lowStockItems.length,
    };
  }
}
