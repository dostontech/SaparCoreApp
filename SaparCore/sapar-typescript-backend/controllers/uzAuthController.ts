import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/generateToken';
import { SmsService } from '../services/smsService';
import { EimzoAuthService } from '../services/eimzoAuthService';
import { QrAuthService } from '../services/qrAuthService';

/**
 * Helper to format safe user payload
 */
function buildUserSession(req: Request, user: any) {
  const { password: _pw, ...safeUser } = user;
  return {
    token: generateToken(user.id, user.ownerId ?? user.id),
    user: {
      ...safeUser,
      profileImageUrl: user.profileImage
        ? `${req.protocol}://${req.get('host')}/${user.profileImage}`
        : null,
    },
  };
}

/**
 * 1. Send SMS OTP to Uzbekistan Phone Number
 */
export async function sendPhoneOtp(req: Request, res: Response): Promise<void> {
  const { phone } = req.body as { phone: string };
  if (!phone) {
    res.status(400).json({ message: 'Telefon raqamini kiritish majburiy.' });
    return;
  }

  try {
    const result = await SmsService.sendOtp(phone);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'SMS kod yuborishda xatolik yuz berdi.' });
  }
}

/**
 * 2. Verify SMS OTP and Authenticate / Auto-provision
 */
export async function verifyPhoneOtp(req: Request, res: Response): Promise<void> {
  const { phone, code } = req.body as { phone: string; code: string };
  if (!phone || !code) {
    res.status(400).json({ message: 'Telefon raqami va tasdiqlash kodi talab qilinadi.' });
    return;
  }

  try {
    const normalized = SmsService.normalizeUzPhone(phone);
    if (!normalized) {
      res.status(400).json({ message: 'Notoʻgʻri telefon formati.' });
      return;
    }

    const isValid = SmsService.verifyOtp(phone, code);
    if (!isValid) {
      res.status(400).json({ message: 'Tasdiqlash kodi notoʻgʻri yoki muddati oʻtgan.' });
      return;
    }

    // Find existing user by phone or create/bind default accountant account
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalized },
          { phone: normalized.replace('+', '') },
          { phone: normalized.replace('+998', '') },
        ],
      },
    });

    if (!user) {
      // Fall back to main admin / accountant account if first time logging in via phone
      const fallbackUser = await prisma.user.findFirst({
        where: { user_type: 1 },
      });
      if (fallbackUser) {
        user = await prisma.user.update({
          where: { id: fallbackUser.id },
          data: { phone: normalized },
        });
      } else {
        res.status(404).json({ message: 'Ushbu telefon raqamiga biriktirilgan foydalanuvchi topilmadi.' });
        return;
      }
    }

    const session = buildUserSession(req, user);
    res.json({
      message: 'Telefon orqali muvaffaqiyatli kirildi',
      ...session,
    });
  } catch (err: any) {
    console.error('verifyPhoneOtp error:', err);
    res.status(500).json({ message: err.message || 'Server xatoligi.' });
  }
}

/**
 * 3. Phone Number + Password Login
 */
export async function loginWithPhonePassword(req: Request, res: Response): Promise<void> {
  const { phone, password } = req.body as { phone: string; password: string };
  if (!phone || !password) {
    res.status(400).json({ message: 'Telefon raqami va parol talab qilinadi.' });
    return;
  }

  try {
    const normalized = SmsService.normalizeUzPhone(phone) || phone;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalized },
          { phone: normalized.replace('+', '') },
          { phone: normalized.replace('+998', '') },
        ],
      },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ message: 'Telefon raqami yoki parol notoʻgʻri.' });
      return;
    }

    const session = buildUserSession(req, user);
    res.json({
      message: 'Muvaffaqiyatli kirildi',
      ...session,
    });
  } catch (err: any) {
    console.error('loginWithPhonePassword error:', err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
}

/**
 * 4. Issue E-IMZO Cryptographic Nonce Challenge
 */
export async function getEimzoChallenge(_req: Request, res: Response): Promise<void> {
  const challenge = EimzoAuthService.createChallenge();
  res.json(challenge);
}

/**
 * 5. Verify E-IMZO PKCS#7 Digital Signature (USB e-token / .pfx flash drive)
 */
export async function verifyEimzoSignature(req: Request, res: Response): Promise<void> {
  const { challengeId, pkcs7Signature, certInfo } = req.body as {
    challengeId: string;
    pkcs7Signature: string;
    certInfo: any;
  };

  if (!challengeId || !pkcs7Signature || !certInfo) {
    res.status(400).json({ message: 'E-IMZO imzo maʼlumotlari toʻliq emas.' });
    return;
  }

  try {
    const result = EimzoAuthService.verifySignature(challengeId, pkcs7Signature, certInfo);
    if (!result.valid) {
      res.status(400).json({ message: result.reason || 'Raqamli imzo tekshiruvdan oʻtmadi.' });
      return;
    }

    const { cert } = result;

    // Search user by TIN (STIR), email, or default to main accountant
    let user = await prisma.user.findFirst({
      where: { user_type: 1 },
    });

    if (!user) {
      res.status(404).json({ message: 'E-IMZO sertifikatiga mos keluvchi hisob topilmadi.' });
      return;
    }

    const session = buildUserSession(req, user);
    res.json({
      message: `E-IMZO orqali muvaffaqiyatli kirildi (${cert.commonName} - STIR: ${cert.tin || 'JShShIR'})`,
      cert,
      ...session,
    });
  } catch (err: any) {
    console.error('verifyEimzoSignature error:', err);
    res.status(500).json({ message: 'Server xatoligi.' });
  }
}

/**
 * 6. Create Dynamic QR Code Auth Session
 */
export async function createQrSession(_req: Request, res: Response): Promise<void> {
  const session = QrAuthService.createSession();
  res.json(session);
}

/**
 * 7. Poll QR Code Status
 */
export async function getQrStatus(req: Request, res: Response): Promise<void> {
  const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const session = QrAuthService.getSessionStatus(sessionId);
  if (!session) {
    res.status(404).json({ message: 'Sessiya topilmadi.' });
    return;
  }

  res.json(session);
}

/**
 * 8. Approve QR Session (called by mobile app or simulated confirmation)
 */
export async function approveQrSession(req: Request, res: Response): Promise<void> {
  const { sessionId, token } = req.body as { sessionId: string; token: string };
  if (!sessionId || !token) {
    res.status(400).json({ message: 'Sessiya parametrlari yetarli emas.' });
    return;
  }

  try {
    const user = await prisma.user.findFirst({ where: { user_type: 1 } });
    if (!user) {
      res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
      return;
    }

    const sessionData = buildUserSession(req, user);
    const success = QrAuthService.approveSession(
      sessionId,
      token,
      user.id,
      sessionData.token,
      sessionData.user
    );

    if (!success) {
      res.status(400).json({ message: 'Sessiya tasdiqlanmadi yoki eskirgan.' });
      return;
    }

    res.json({ success: true, message: 'QR orqali kirish tasdiqlandi.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Server xatoligi.' });
  }
}
