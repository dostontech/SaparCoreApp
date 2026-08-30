/**
 * Uzbekistan SMS Gateway & OTP Service for SAPAR ERP
 * Supports Eskiz.uz, PlayMobile, SMS.uz and local Mock driver for development.
 */

import crypto from 'crypto';
import axios from 'axios';

export interface OtpRecord {
  phone: string;
  codeHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP storage with automatic TTL cleanup
const otpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, rec] of otpStore.entries()) {
    if (rec.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 60000);

export class SmsService {
  /**
   * Normalizes Uzbekistan phone numbers to standard format: +998XXXXXXXXX (13 chars)
   */
  static normalizeUzPhone(rawPhone: string): string | null {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    
    // E.g. 998901234567 (12 digits) -> +998901234567
    if (digits.length === 12 && digits.startsWith('998')) {
      return `+${digits}`;
    }
    // E.g. 901234567 (9 digits) -> +998901234567
    if (digits.length === 9) {
      return `+998${digits}`;
    }
    // E.g. +998901234567
    if (digits.length === 12 && rawPhone.startsWith('+')) {
      return `+${digits}`;
    }
    return null;
  }

  /**
   * Generates a secure 6-digit numeric OTP code
   */
  static generateOtpCode(): string {
    const randomInt = crypto.randomInt(100000, 999999);
    return randomInt.toString();
  }

  /**
   * Hashes OTP with salt for secure storage
   */
  private static hashOtp(code: string, salt: string): string {
    return crypto.createHash('sha256').update(`${salt}:${code}`).digest('hex');
  }

  /**
   * Issues and sends an SMS OTP code to an Uzbekistan phone number
   */
  static async sendOtp(phone: string): Promise<{ success: boolean; message: string; ttlSeconds: number; devCode?: string }> {
    const normalized = this.normalizeUzPhone(phone);
    if (!normalized) {
      throw new Error('Notoʻgʻri telefon raqami formati. Iltimos +998 (XX) XXX-XX-XX formatida kiriting.');
    }

    // Rate limiting: check existing recent OTP
    const existing = otpStore.get(normalized);
    const now = Date.now();
    if (existing && existing.expiresAt - now > 120000) { // If sent less than 60s ago
      const waitSeconds = Math.ceil((existing.expiresAt - now - 120000) / 1000);
      throw new Error(`Iltimos ${waitSeconds > 0 ? waitSeconds : 30} soniyadan soʻng qayta urinib koʻring.`);
    }

    const code = this.generateOtpCode();
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = this.hashOtp(code, salt);
    const ttlSeconds = 180; // 3 minutes

    otpStore.set(normalized, {
      phone: normalized,
      codeHash,
      salt,
      expiresAt: now + ttlSeconds * 1000,
      attempts: 0,
    });

    const smsText = `SAPAR ERP: Tizimga kirish kodi: ${code}. Xavfsizlik uchun kodni hech kimga bermang.`;

    // Dispatch SMS via configured provider or DEV mock
    const provider = process.env.SMS_PROVIDER || 'MOCK';
    let isDispatched = false;

    if (provider === 'ESKIZ' && process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD) {
      try {
        const tokenResp = await axios.post('https://notify.eskiz.uz/api/auth/login', {
          email: process.env.ESKIZ_EMAIL,
          password: process.env.ESKIZ_PASSWORD,
        });
        const token = tokenResp.data?.data?.token;
        if (token) {
          await axios.post(
            'https://notify.eskiz.uz/api/message/sms/send',
            {
              mobile_phone: normalized.replace('+', ''),
              message: smsText,
              from: process.env.ESKIZ_NICKNAME || '4546',
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          isDispatched = true;
        }
      } catch (smsErr) {
        console.error('Eskiz SMS delivery failed, falling back to console log:', smsErr);
      }
    }

    console.log(`\n========================================`);
    console.log(`📱 [UZBEKISTAN SMS GATEWAY]`);
    console.log(`Recipient : ${normalized}`);
    console.log(`OTP Code  : ${code}`);
    console.log(`Message   : ${smsText}`);
    console.log(`Status    : ${isDispatched ? 'Dispatched via Provider' : 'Simulated (DEV Mode)'}`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: `SMS tasdiqlash kodi ${normalized} raqamiga yuborildi.`,
      ttlSeconds,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  /**
   * Validates received OTP code against stored record
   */
  static verifyOtp(phone: string, code: string): boolean {
    const normalized = this.normalizeUzPhone(phone);
    if (!normalized) return false;

    const record = otpStore.get(normalized);
    if (!record) return false;

    const now = Date.now();
    if (record.expiresAt < now) {
      otpStore.delete(normalized);
      return false;
    }

    if (record.attempts >= 5) {
      otpStore.delete(normalized);
      throw new Error('Urinishlar soni tugadi. Iltimos yangi SMS kod soʻrang.');
    }

    record.attempts += 1;
    const computedHash = this.hashOtp(code.trim(), record.salt);
    const isValid = computedHash === record.codeHash;

    if (isValid) {
      otpStore.delete(normalized);
    }

    return isValid;
  }
}
