/**
 * Dynamic QR Code / Mobile Token Authentication Service
 * Allows users to scan a QR code on desktop with their phone E-IMZO app to log in instantly.
 */

import crypto from 'crypto';

export interface QrSession {
  sessionId: string;
  token: string;
  status: 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REJECTED';
  userId?: string;
  authToken?: string;
  userPayload?: any;
  createdAt: number;
  expiresAt: number;
}

const qrSessionStore = new Map<string, QrSession>();

// Cleanup expired QR sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of qrSessionStore.entries()) {
    if (s.expiresAt < now) {
      qrSessionStore.delete(id);
    }
  }
}, 30000);

export class QrAuthService {
  /**
   * Generates a new dynamic QR session with a 2-minute validity
   */
  static createSession(): { sessionId: string; token: string; qrPayload: string; expiresAt: number } {
    const sessionId = crypto.randomUUID();
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 120000; // 2 minutes

    // Standard deep link format scannable by E-IMZO Mobile App
    const qrPayload = JSON.stringify({
      app: 'sapar_erp',
      action: 'auth',
      sessionId,
      token,
      ts: Date.now(),
    });

    qrSessionStore.set(sessionId, {
      sessionId,
      token,
      status: 'PENDING',
      createdAt: Date.now(),
      expiresAt,
    });

    return { sessionId, token, qrPayload, expiresAt };
  }

  /**
   * Checks status of a QR session
   */
  static getSessionStatus(sessionId: string): QrSession | null {
    const session = qrSessionStore.get(sessionId);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      session.status = 'EXPIRED';
    }
    return session;
  }

  /**
   * Approves a QR session (invoked when phone signs/confirms the login)
   */
  static approveSession(sessionId: string, token: string, userId: string, authToken: string, userPayload: any): boolean {
    const session = qrSessionStore.get(sessionId);
    if (!session) return false;
    if (session.token !== token || session.expiresAt < Date.now()) return false;

    session.status = 'APPROVED';
    session.userId = userId;
    session.authToken = authToken;
    session.userPayload = userPayload;

    return true;
  }
}
