/**
 * controllers/telegramNotificationController.ts
 *
 * REST API controller for Telegram Notification Settings & 1-Click Master Bot Connection.
 */

import type { Request, Response } from 'express';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';
import { TelegramNotificationService } from '../services/telegramNotificationService';
import { TelegramMasterBotService } from '../services/telegramMasterBotService';

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const settings = await TelegramNotificationService.getSettings(userId);
    res.json({ success: true, data: settings });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('getSettings error:', err);
    res.status(500).json({ success: false, message: 'Telegram sozlamalarini yuklashda xatolik' });
  }
}

export async function saveSettings(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const updated = await TelegramNotificationService.saveSettings(userId, req.body);
    res.json({ success: true, message: 'Telegram sozlamalari muvaffaqiyatli saqlandi', data: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('saveSettings error:', err);
    res.status(500).json({ success: false, message: 'Telegram sozlamalarini saqlashda xatolik' });
  }
}

/**
 * 1-Click Connect: Generates a 6-digit one-time code for instant Telegram pairing.
 */
export async function getPairingCode(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const pairing = TelegramMasterBotService.generatePairingCode(userId);
    res.json({ success: true, data: pairing });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('getPairingCode error:', err);
    res.status(500).json({ success: false, message: 'Ulanish kodini generatsiya qilishda xatolik' });
  }
}

/**
 * Direct Instant Connect by username or Chat ID
 */
export async function pairDirect(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { chatIdOrUsername } = req.body;
    if (!chatIdOrUsername) {
      res.status(400).json({ success: false, message: 'Telegram username yoki Chat ID kiritilmadi' });
      return;
    }
    const updated = await TelegramMasterBotService.pairDirect(userId, chatIdOrUsername);
    res.json({ success: true, message: 'Telegram hisobingiz muvaffaqiyatli ulandi', data: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('pairDirect error:', err);
    res.status(500).json({ success: false, message: 'Ulashda xatolik' });
  }
}

/**
 * Public Webhook for Telegram Master Bot
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const result = await TelegramMasterBotService.handleWebhookUpdate(req.body);
    res.json(result);
  } catch (err) {
    console.error('Telegram webhook error:', err);
    res.status(200).json({ success: false, message: 'Handled with error' });
  }
}

export async function testConnection(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { botToken, chatId } = req.body;

    const targetBotToken = botToken || (await TelegramNotificationService.getSettings(userId)).botToken;
    const targetChatId = chatId || (await TelegramNotificationService.getSettings(userId)).chatId;

    const testMessage = `
<b>SAPAR ERP — TIZIM BILAN ALOQA OʻRNATILDI</b>
Vaqt: <b>${new Date().toLocaleString('uz-UZ')}</b>
----------------------------------------
Telegram bildirishnomalar xizmati muvaffaqiyatli ulandi va faol holatda ishlamoqda.
Quyidagi avtomatik signallar yoqilgan:
• Kunlik moliyaviy tushum xulosasi
• Kassir smena yopilish Z-hisobotlari
• Ombor qoldigʻi kamayganda ogohlantirishlar
----------------------------------------
Boshqaruv: SAPAR Cloud ERP
`;

    const result = await TelegramNotificationService.sendMessage(targetBotToken, targetChatId, testMessage.trim());

    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.json({ success: true, message: 'Sinov xabari Telegramga muvaffaqiyatli yuborildi', data: result });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('testConnection error:', err);
    res.status(500).json({ success: false, message: 'Sinov xabarini yuborishda xatolik' });
  }
}

export async function triggerDailySummary(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const result = await TelegramNotificationService.sendDailyFinancialSummary(userId);
    res.json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('triggerDailySummary error:', err);
    res.status(500).json({ success: false, message: 'Kunlik xulosani yuborishda xatolik' });
  }
}

export async function triggerLowStockCheck(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const result = await TelegramNotificationService.checkAndSendLowStockAlerts(userId);
    res.json(result);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('triggerLowStockCheck error:', err);
    res.status(500).json({ success: false, message: 'Ombor tekshiruvini yuborishda xatolik' });
  }
}
