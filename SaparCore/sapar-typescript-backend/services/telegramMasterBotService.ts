/**
 * services/telegramMasterBotService.ts
 *
 * Automated 1-Click Master Telegram Bot Service for SAPAR Clients.
 * Ordinary clients do NOT need to create any bots in BotFather.
 * They simply click "Connect Telegram", press /start in the official bot,
 * and their tenant is instantly linked to receive all financial alerts.
 */

import { prisma } from '../lib/prisma';
import { TelegramNotificationService } from './telegramNotificationService';

// In-memory or database temporary pairing codes: code -> { userId, expiresAt }
const pairingCodes = new Map<string, { userId: string; expiresAt: number }>();

export class TelegramMasterBotService {
  /**
   * Generates a 6-digit one-time pairing code for the logged-in client.
   */
  static generatePairingCode(userId: string): { code: string; telegramLink: string; expiresMinutes: number } {
    // Generate 6 digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    pairingCodes.set(code, { userId, expiresAt });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'sapar_test_bot';
    const telegramLink = `https://t.me/${botUsername}?start=${code}`;

    return {
      code,
      telegramLink,
      expiresMinutes: 15,
    };
  }

  /**
   * Handles incoming Telegram webhook events (e.g. when a client presses /start <code>)
   */
  static async handleWebhookUpdate(update: any): Promise<{ success: boolean; message: string }> {
    const message = update?.message;
    if (!message || !message.text) {
      return { success: false, message: 'Xabar matni topilmadi' };
    }

    const chatId = message.chat.id.toString();
    const senderName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') || message.from?.username || 'Foydalanuvchi';
    const text = message.text.trim();

    // Check if message is /start with a pairing code: e.g. "/start 849102"
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const code = parts[1]?.trim();

      if (!code) {
        const welcomeText = `
<b>SAPAR ERP RASMIY BILDIRISHNOMALAR BOTI</b>
----------------------------------------
Assalomu alaykum, <b>${senderName}</b>!

Tizim bildirishnomalarini qabul qilish uchun SAPAR dasturingizdagi <b>Sozlamalar -> Telegram Boti</b> sahifasiga kiring va "Telegramda Ochish va Ulash" tugmasini bosing yoki botga 6 xonali ulanish kodini yuboring.

Format: <code>/start [6_xonali_kod]</code>
`;
        await TelegramNotificationService.sendMessage(process.env.TELEGRAM_BOT_TOKEN || '', chatId, welcomeText.trim());
        return { success: true, message: 'Welcome message sent' };
      }

      // Verify pairing code
      const entry = pairingCodes.get(code);
      if (!entry || entry.expiresAt < Date.now()) {
        const errText = `
<b>ULANISH VAQTI TUGAGAN YOKI KOD NOTOʻGʻRI</b>
----------------------------------------
Kiritilgan ulanish kodi eskirgan. Iltimos, SAPAR paneliga qaytib yangi ulanish kodini oling.
`;
        await TelegramNotificationService.sendMessage(process.env.TELEGRAM_BOT_TOKEN || '', chatId, errText.trim());
        return { success: false, message: 'Invalid or expired pairing code' };
      }

      const { userId } = entry;
      pairingCodes.delete(code); // Consume code

      // Save client's chat ID into tenant settings
      await TelegramNotificationService.saveSettings(userId, {
        enabled: true,
        chatId,
      });

      const successText = `
<b>SAPAR HISOBINGIZ MUVOFAQIYATLI ULANDI!</b>
----------------------------------------
Hurmatli <b>${senderName}</b>,
Sizning Telegramingiz SAPAR ERP tizimidagi korxonangizga ulandi.

Endi siz:
• Har kuni kechki moliyaviy tushum va sof foyda hisobotini
• Kassirlar smena yopgandagi Z-hisobotlarni
• Ombor qoldigʻi kamayganda ogohlantirishlarni

toʻgʻridan-toʻgʻri shu yerda qabul qilasiz.
`;

      await TelegramNotificationService.sendMessage(process.env.TELEGRAM_BOT_TOKEN || '', chatId, successText.trim());
      return { success: true, message: `Successfully paired userId ${userId} with chatId ${chatId}` };
    }

    return { success: true, message: 'Ignored non-command message' };
  }

  /**
   * Direct manual 1-click pairing for instant test without public webhook.
   */
  static async pairDirect(userId: string, chatIdOrUsername: string): Promise<any> {
    const cleanId = chatIdOrUsername.trim();
    const updated = await TelegramNotificationService.saveSettings(userId, {
      enabled: true,
      chatId: cleanId,
    });

    const testText = `
<b>SAPAR ERP — HISOBINGIZ MUVOFAQIYATLI ULANDI!</b>
Vaqt: <b>${new Date().toLocaleString('uz-UZ')}</b>
----------------------------------------
Telegram bildirishnomalar xizmati 1 bosishda ulandi.
Barcha moliyaviy xulosalar, kassa Z-hisobotlari va ombor signallari shu chatga yuboriladi.
`;

    await TelegramNotificationService.sendMessage(updated.botToken, cleanId, testText.trim());
    return updated;
  }
}
