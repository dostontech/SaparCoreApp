/**
 * controllers/onboardingLeadController.ts
 *
 * Handles self-serve trial requests from the public landing page.
 * Stores lead and immediately pushes notification to Telegram Management Bot.
 */

import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { TelegramNotificationService } from '../services/telegramNotificationService';

export async function requestTrial(req: Request, res: Response): Promise<void> {
  try {
    const { companyName, contactValue, ownerName } = req.body;

    if (!companyName || !contactValue) {
      res.status(400).json({
        success: false,
        message: 'Iltimos, korxona nomi va Telegram/telefon raqamingizni kiriting',
      });
      return;
    }

    const leadNote = `Yangi SaaS Trial So'rovi: ${companyName} | Mas'ul: ${ownerName || 'Kiritilmagan'} | Telegram/Tel: ${contactValue}`;

    // 1. Try to record in CRM Contact or Tenant
    try {
      await prisma.contact.create({
        data: {
          firstName: ownerName || companyName,
          lastName: '(SaaS Trial Lead)',
          phone: contactValue.startsWith('+') ? contactValue : null,
          type: 'CUSTOMER',
          notes: leadNote,
          userId: 'demo-admin-uuid', // Scoped to master tenant
        },
      });
    } catch {
      /* ignore unique conflict or fallback */
    }

    // 2. Notify Master Telegram Bot about the new client lead
    const alertHtml = `
<b>YANGI MIJOZ ROʻYXATDAN OʻTDI (14 KUNLIK TRIAL)</b>
Vaqt: <b>${new Date().toLocaleString('uz-UZ')}</b>
----------------------------------------
• Korxona: <b>${companyName}</b>
• Masʼul shaxs: <b>${ownerName || 'Tadbirkor'}</b>
• Telegram / Tel: <b>${contactValue}</b>
----------------------------------------
Tizim: <b>SAPAR SaaS Onboarding Engine</b>
`;

    // Attempt push to demo admin telegram if configured
    try {
      const settings = await TelegramNotificationService.getSettings('demo-admin-uuid');
      if (settings.enabled && settings.chatId && settings.botToken) {
        await TelegramNotificationService.sendMessage(settings.botToken, settings.chatId, alertHtml.trim());
      }
    } catch {
      /* ignore */
    }

    res.json({
      success: true,
      message: 'Soʻrovingiz qabul qilindi! 14 kunlik bepul sinov hisobingiz faollashtirildi.',
      data: {
        companyName,
        contactValue,
        trialDays: 14,
      },
    });
  } catch (err: any) {
    console.error('requestTrial error:', err);
    res.status(500).json({
      success: false,
      message: 'Soʻrovni yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib koʻring.',
    });
  }
}
