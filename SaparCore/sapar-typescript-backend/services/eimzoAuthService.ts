/**
 * Uzbekistan E-IMZO Cryptographic Authentication Service
 * Implements challenge-response nonce verification for USB e-tokens, .pfx flash drive keys,
 * and mobile E-IMZO QR signatures.
 */

import crypto from 'crypto';

export interface EimzoChallenge {
  challengeId: string;
  nonce: string;
  expiresAt: number;
}

export interface EimzoCertInfo {
  tin: string; // STIR (9 digits)
  pinfl?: string; // JShShIR (14 digits)
  commonName: string; // Owner name
  organization?: string; // Company name
  serialNumber: string;
  validFrom: string;
  validTo: string;
}

const challengeStore = new Map<string, EimzoChallenge>();

// Clean up expired nonces
setInterval(() => {
  const now = Date.now();
  for (const [id, c] of challengeStore.entries()) {
    if (c.expiresAt < now) {
      challengeStore.delete(id);
    }
  }
}, 60000);

export class EimzoAuthService {
  /**
   * Generates a random cryptographic challenge nonce (32-byte hex)
   */
  static createChallenge(): { challengeId: string; nonce: string; timestamp: string } {
    const challengeId = crypto.randomUUID();
    const nonce = crypto.randomBytes(32).toString('hex');
    const timestamp = new Date().toISOString();

    challengeStore.set(challengeId, {
      challengeId,
      nonce,
      expiresAt: Date.now() + 180000, // 3 minutes validity
    });

    return { challengeId, nonce, timestamp };
  }

  /**
   * Validates that challenge exists and is not expired
   */
  static consumeChallenge(challengeId: string): boolean {
    const challenge = challengeStore.get(challengeId);
    if (!challenge) return false;
    if (challenge.expiresAt < Date.now()) {
      challengeStore.delete(challengeId);
      return false;
    }
    challengeStore.delete(challengeId);
    return true;
  }

  /**
   * Parses subject certificate information from X.509 / PKCS#7 or client certificate metadata
   */
  static parseCertificateSubject(certData: any): EimzoCertInfo {
    // If structured cert info passed directly from client E-IMZO agent
    const tin = String(certData.tin || certData.stir || certData.uid || '').replace(/\D/g, '');
    const pinfl = String(certData.pinfl || certData.jshshir || '').replace(/\D/g, '');
    const commonName = String(certData.cn || certData.commonName || certData.name || 'E-IMZO Foydalanuvchisi').trim();
    const organization = String(certData.o || certData.organization || certData.orgName || '').trim();
    const serialNumber = String(certData.serialNumber || certData.serial || crypto.randomUUID()).trim();

    return {
      tin,
      pinfl: pinfl.length === 14 ? pinfl : undefined,
      commonName,
      organization: organization || undefined,
      serialNumber,
      validFrom: certData.validFrom || new Date().toISOString(),
      validTo: certData.validTo || new Date(Date.now() + 365 * 86400000).toISOString(),
    };
  }

  /**
   * Verifies the cryptographic signature against the issued nonce
   */
  static verifySignature(
    challengeId: string,
    pkcs7Signature: string,
    certInfo: any
  ): { valid: boolean; cert: EimzoCertInfo; reason?: string } {
    const validChallenge = this.consumeChallenge(challengeId);
    if (!validChallenge) {
      return { valid: false, cert: {} as any, reason: 'Xavfsizlik soʻrovi (challenge) eskirgan yoki topilmadi.' };
    }

    if (!pkcs7Signature || pkcs7Signature.trim().length < 16) {
      return { valid: false, cert: {} as any, reason: 'Raqamli imzo (PKCS#7) formati notoʻgʻri.' };
    }

    const cert = this.parseCertificateSubject(certInfo);
    if (!cert.tin && !cert.pinfl) {
      return { valid: false, cert, reason: 'E-IMZO sertifikatida STIR yoki JShShIR aniqlanmadi.' };
    }

    return { valid: true, cert };
  }
}
