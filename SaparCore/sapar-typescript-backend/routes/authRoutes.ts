import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { register, login, logout } from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidator';

const router = Router();

// ---------------------------------------------------------------------------
// Rate limiters — defend against brute-force and SMS cost attacks.
// express-rate-limit is already in package.json (used by publicRoutes too).
// ---------------------------------------------------------------------------

/** Login: 10 attempts per 15 minutes per IP */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Juda koʻp urinish. 15 daqiqadan soʻng qayta urinib koʻring. | Too many login attempts. Try again in 15 minutes.',
  },
});

/** Register: 5 new accounts per hour per IP */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: "Roʻyxatdan oʻtish cheklangan. 1 soatdan soʻng qayta urinib koʻring. | Registration limit reached. Try again in 1 hour.",
  },
});

/** OTP send: 3 SMS per hour per IP — prevents SMS cost attack */
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: "OTP yuborish cheklangan. 1 soatdan soʻng qayta urinib koʻring. | OTP send limit reached. Try again in 1 hour.",
  },
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', registerLimiter, registerValidator, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Returns JWT token
 */
router.post('/login', loginLimiter, loginValidator, login);

/**
 * Uzbekistan Native Multi-Factor Authentication Routes
 */
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  loginWithPhonePassword,
  getEimzoChallenge,
  verifyEimzoSignature,
  createQrSession,
  getQrStatus,
  approveQrSession,
} from '../controllers/uzAuthController';

// Phone Auth & SMS OTP
router.post('/phone/send-otp', otpLimiter, sendPhoneOtp);
router.post('/phone/verify-otp', loginLimiter, verifyPhoneOtp);
router.post('/phone/login', loginLimiter, loginWithPhonePassword);

// E-IMZO USB e-token & Flash Drive .pfx Key Auth
router.get('/eimzo/challenge', getEimzoChallenge);
router.post('/eimzo/verify', verifyEimzoSignature);

// Mobile E-IMZO QR Code Auth
router.post('/qr/session', createQrSession);
router.get('/qr/status/:sessionId', getQrStatus);
router.post('/qr/approve', approveQrSession);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out current session
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', logout);

export default router;

// CommonJS interop so server.js's require() picks up the Express router
module.exports = router;
