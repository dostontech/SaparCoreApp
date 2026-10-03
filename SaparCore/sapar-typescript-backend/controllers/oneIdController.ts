/**
 * One ID Uzbekistan - OAuth2 / OpenID Connect controller
 *
 * Flow:
 *   1. GET /api/auth/oneid/init  -> generate auth URL + PKCE + QR session -> return authUrl + sessionId
 *   2. User scans QR -> One ID redirects GET /api/auth/oneid/callback?code=X&state=sessionId
 *   3. Exchange code for token -> get userinfo -> find/create user -> approve QR session
 *   4. Browser polls GET /api/auth/oneid/status/:sessionId -> when APPROVED returns JWT
 *
 * Env vars required (from id.egov.uz partner portal):
 *   ONE_ID_CLIENT_ID, ONE_ID_CLIENT_SECRET, ONE_ID_REDIRECT_URI
 * Optional:
 *   ONE_ID_AUTH_URL, ONE_ID_TOKEN_URL, ONE_ID_USERINFO_URL, FRONTEND_URL
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import https from 'https';
import { QrAuthService } from '../services/qrAuthService';

const ONE_ID_AUTH_URL =
  process.env.ONE_ID_AUTH_URL ||
  'https://id.egov.uz/auth/realms/one-id/protocol/openid-connect/auth';
const ONE_ID_TOKEN_URL =
  process.env.ONE_ID_TOKEN_URL ||
  'https://id.egov.uz/auth/realms/one-id/protocol/openid-connect/token';
const ONE_ID_USERINFO_URL =
  process.env.ONE_ID_USERINFO_URL ||
  'https://id.egov.uz/auth/realms/one-id/protocol/openid-connect/userinfo';

const CLIENT_ID = process.env.ONE_ID_CLIENT_ID || '';
const CLIENT_SECRET = process.env.ONE_ID_CLIENT_SECRET || '';
const REDIRECT_URI =
  process.env.ONE_ID_REDIRECT_URI ||
  `http://localhost:${process.env.PORT || 3005}/api/auth/oneid/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// PKCE verifier store  (sessionId -> { codeVerifier, expiresAt })
const pkceStore = new Map<string, { codeVerifier: string; expiresAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pkceStore.entries()) {
    if (v.expiresAt < now) pkceStore.delete(k);
  }
}, 5 * 60 * 1000);

function generateCodeVerifier(): string {
  return crypto.randomBytes(48).toString('base64url').slice(0, 96);
}
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function httpsPost(url: string, body: string, extraHeaders: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, port: 443, path: u.pathname + u.search, method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body), ...extraHeaders } },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Bad JSON: ' + data)); } });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpsGet(url: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, port: 443, path: u.pathname + u.search, method: 'GET', headers },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Bad JSON: ' + data)); } });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

// --------------------------------------------------------------------------
// GET /api/auth/oneid/init
// --------------------------------------------------------------------------
export const initOneId = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = QrAuthService.createSession();
    const { sessionId, expiresAt, token, qrPayload } = session;

    if (!CLIENT_ID) {
      // Not configured yet - return placeholder so UI still renders a QR
      res.json({
        success: true,
        data: {
          sessionId,
          token,
          qrPayload,
          authUrl: 'https://id.egov.uz',
          configured: false,
          message: 'Set ONE_ID_CLIENT_ID in .env (get from https://id.egov.uz/partner)',
          expiresAt,
        },
      });
      return;
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    pkceStore.set(sessionId, { codeVerifier, expiresAt });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'openid profile',
      state: sessionId,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    res.json({
      success: true,
      data: {
        sessionId,
        token,
        qrPayload,
        authUrl: `${ONE_ID_AUTH_URL}?${params.toString()}`,
        configured: true,
        expiresAt,
      },
    });
  } catch (err: any) {
    console.error('[OneID] init error:', err.message);
    res.status(500).json({ success: false, message: 'One ID init failed' });
  }
};

// --------------------------------------------------------------------------
// GET /api/auth/oneid/callback?code=XXX&state=<sessionId>
// Called by One ID after user authenticates with mobile app
// --------------------------------------------------------------------------
export const oneIdCallback = async (req: Request, res: Response): Promise<void> => {
  const { code, state: sessionId, error, error_description } = req.query as Record<string, string>;

  if (error) {
    console.error('[OneID] callback error:', error, error_description);
    res.redirect(`${FRONTEND_URL}/admin/login?oneid_error=${encodeURIComponent(error_description || error)}`);
    return;
  }

  if (!code || !sessionId) {
    res.redirect(`${FRONTEND_URL}/admin/login?oneid_error=missing_params`);
    return;
  }

  try {
    const pkce = pkceStore.get(sessionId);
    if (!pkce) {
      res.redirect(`${FRONTEND_URL}/admin/login?oneid_error=session_expired`);
      return;
    }

    // 1. Token exchange
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: pkce.codeVerifier,
    });
    if (CLIENT_SECRET) tokenParams.append('client_secret', CLIENT_SECRET);

    const tokenData = await httpsPost(ONE_ID_TOKEN_URL, tokenParams.toString());
    if (!tokenData.access_token) {
      console.error('[OneID] no access_token:', tokenData);
      res.redirect(`${FRONTEND_URL}/admin/login?oneid_error=token_failed`);
      return;
    }

    // 2. Fetch userinfo (PINFL, FIO, phone)
    const userInfo = await httpsGet(ONE_ID_USERINFO_URL, {
      Authorization: `Bearer ${tokenData.access_token}`,
    });

    // One ID standard claims
    const pinfl = userInfo.sub || userInfo.pinfl || userInfo.pin || '';
    const firstName = userInfo.given_name || userInfo.firstName || 'Foydalanuvchi';
    const lastName = userInfo.family_name || userInfo.lastName || '';
    const phone = userInfo.phone_number || userInfo.phone || '';
    const email = userInfo.email || (pinfl ? `${pinfl}@oneid.uz` : '');

    if (!email) {
      res.redirect(`${FRONTEND_URL}/admin/login?oneid_error=no_email`);
      return;
    }

    // 3. Find or create SAPAR user
    const { prisma } = require('../lib/prisma');
    const bcrypt = require('bcryptjs');
    const { generateToken } = require('../controllers/authController');

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (!user) {
      const randomPwd = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone: phone || '',
          password: randomPwd,
          user_type: 1,
        },
      });
    }

    // 4. Generate SAPAR JWT and approve QR session
    const saparToken = generateToken(user.id);
    const userPayload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
      roleId: user.roleId,
      profileImageUrl: user.profileImageUrl || null,
    };

    const sessionStatus = QrAuthService.getSessionStatus(sessionId);
    QrAuthService.approveSession(sessionId, sessionStatus?.token || '', user.id, saparToken, userPayload);
    pkceStore.delete(sessionId);

    // 5. Redirect browser back � poll detects APPROVED and completes login
    res.redirect(`${FRONTEND_URL}/admin/login?oneid_success=1`);
  } catch (err: any) {
    console.error('[OneID] callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/admin/login?oneid_error=server_error`);
  }
};

// --------------------------------------------------------------------------
// GET /api/auth/oneid/status/:sessionId
// --------------------------------------------------------------------------
export const getOneIdStatus = (req: Request, res: Response): void => {
  const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
  const session = QrAuthService.getSessionStatus(sessionId as string);

  if (!session) {
    res.status(404).json({ success: false, status: 'NOT_FOUND' });
    return;
  }

  if (session.status === 'APPROVED') {
    res.json({
      success: true,
      status: 'APPROVED',
      authToken: session.authToken,
      userPayload: session.userPayload,
    });
    return;
  }

  res.json({ success: true, status: session.status });
};
