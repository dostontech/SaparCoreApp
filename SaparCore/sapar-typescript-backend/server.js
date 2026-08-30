/**
 * ==============================================================================================
 * SAPAR ENTERPRISE RESOURCE PLANNING (ERP) — CORE API SERVER
 * ----------------------------------------------------------------------------------------------
 * Copyright (c) 2026 SAPAR ERP Technologies. All Rights Reserved.
 * Built for the Republic of Uzbekistan & Central Asia.
 *
 * PROPRIETARY & CONFIDENTIAL.
 * Protected under the Intellectual Property Laws of the Republic of Uzbekistan (Law No. ZRU-42).
 * Unauthorized reproduction, reverse engineering, or commercial use is strictly prohibited.
 *
 * President Tech Award 2026 Candidate: Best Enterprise Software / Digital Transformation
 * Official Website: https://sapar.uz
 * ==============================================================================================
 */

// ts-node enables on-the-fly execution for TypeScript modules.
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});
require('module-alias/register');
require('dotenv').config();
// Validate critical env vars immediately — fails fast with clear error messages
// before the server binds to any port if config is missing or has placeholders.
const { validateEnv } = require('./lib/validateEnv');
validateEnv();
const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const externalRoutes = require('./routes/externalRoutes');
const publicRoutes = require('./routes/publicRoutes');
const dimensionRoutes = require('./routes/dimensionRoutes');
const { auditContextMiddleware } = require('./middleware/auditContext');
const { blockSettingsWriteInDemo, isDemoMode } = require('./middleware/demoMode');
const logger = require('./lib/logger');
const { requestLogger } = require('./middleware/requestLogger');
const app = express();
// Behind an HTTPS reverse proxy (TLS terminated upstream). Trust X-Forwarded-*
// so req.protocol reflects the original scheme (https) — otherwise generated
// upload/image URLs come out as http://.
app.set('trust proxy', true);
connectDB();


require('./invoiceReminderCron');
require('./quotationReminderCron');
require('./recurringInvoicesCron');
require('./recurringExpensesCron');

// ---------------------------------------------------------------------------
// Security headers — must be first middleware before any routes.
// helmet sets: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
// Strict-Transport-Security, Referrer-Policy, and removes X-Powered-By.
// ---------------------------------------------------------------------------
app.use(helmet({
  // Relax CSP slightly to allow inline scripts needed by Swagger UI and the
  // React SPA's injected chunks when served via nginx reverse proxy.
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // Swagger UI needs inline
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  // HSTS: tell browsers to always use HTTPS (1 year, include subdomains)
  strictTransportSecurity: {
    maxAge: 31_536_000,
    includeSubDomains: true,
  },
}));

// ---------------------------------------------------------------------------
// CORS — in production lock to CORS_ORIGIN; in dev allow all origins so that
// the Vite dev server on :5173 can reach the API on :3001 without extra config.
// ---------------------------------------------------------------------------
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin && corsOrigin !== '*'
    ? corsOrigin.split(',').map(o => o.trim())
    : true,
  credentials: true,
}));
app.use(express.json());
// HTTP request/response logging — structured JSON in prod, pretty in dev.
app.use(requestLogger);
app.use(auditContextMiddleware); // audit: carry actor context into Prisma writes
app.use('/uploads', express.static('uploads'));

const { checkMailHealth } = require('./utils/mailer');

app.get('/api/healthz', async (req, res) => {
  const isDetailed = req.query.detailed === 'true';
  const mailHealth = isDetailed ? await checkMailHealth() : undefined;

  res.status(200).json({
    status: 'ok',
    service: 'sapar-api',
    demo: isDemoMode(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    ...(mailHealth ? { mail: mailHealth } : {}),
  });
});

app.use('/api/auth', authRoutes);
// Demo mode: freeze settings writes before they reach the admin routes.
app.use('/api/admin', blockSettingsWriteInDemo);
app.use('/api/admin', adminRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', dimensionRoutes); // P3.3 cost-centers + projects + pnl reports

// Swagger UI at /api/docs (slice G.4)
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./lib/swaggerConfig');
// Auto-list every live route in the spec (hand-written @swagger docs win).
const { mergeGeneratedPaths } = require('./lib/swaggerRoutes');
try {
  const { added, total } = mergeGeneratedPaths(swaggerSpec, [
    { base: '/auth', router: authRoutes, secured: false, tag: 'Auth' },
    { base: '/admin', router: adminRoutes, secured: true },
    { base: '/admin', router: dimensionRoutes, secured: true, tag: 'Reports' },
    { base: '/reminders', router: reminderRoutes, secured: true, tag: 'Reminders' },
    { base: '/conversation', router: conversationRoutes, secured: true, tag: 'AI' },
    { base: '/external', router: externalRoutes, secured: false, tag: 'Integrations' },
    { base: '/public', router: publicRoutes, secured: false, tag: 'Public' },
  ]);
  logger.info({ added, total }, `[swagger] auto-documented ${added} routes (spec now lists ${total} operations)`);
} catch (e) {
  logger.error({ err: e }, '[swagger] route auto-documentation failed');
}
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Sapar API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get(['/api-docs', '/docs'], (_req, res) => res.redirect('/api/docs/'));
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Global upload error handler (before the Prisma handler): maps multer file-type
// rejections and limit breaches from ANY upload route to a 400 instead of 500.
const { handleUploadError } = require('./middleware/uploadError');
app.use(handleUploadError);

// Global error handler (must be last, after all routes): translates uncaught
// Prisma/validation errors into actionable HTTP responses instead of opaque 500s.
const { prismaErrorHandler } = require('./middleware/prismaError');
app.use(prismaErrorHandler);

const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Boot bootstrap — migrate + seed before accepting traffic.
//
// Runs regardless of deployment method (Docker, PM2, bare node server.js).
// Both steps are idempotent and non-fatal: a failure logs a warning but
// never prevents the server from starting.
//
// Disable individual steps via environment variables:
//   MIGRATE_ON_BOOT=false    — skip `prisma migrate deploy` (e.g. in CI where
//                              migrations are applied externally)
//   SEED_ON_BOOT=false       — skip baseline seed (e.g. when using the Docker
//                              entrypoint to control sequencing manually)
//   BACKFILL_ON_BOOT=false   — skip the legacy Customer/Supplier -> Contact
//                              data migration (e.g. if you run it manually)
//   GEO_ON_BOOT=false        — skip the Country/State geo dataset import
//                              (e.g. if you run `npm run prisma:import:geo`
//                              manually, or manage that data yourself)
// ---------------------------------------------------------------------------
(async function bootstrap() {
  if (process.env.MIGRATE_ON_BOOT !== 'false') {
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      logger.info('[boot] migrations applied.');
    } catch (err) {
      logger.warn({ err }, '[boot] migrate deploy failed (non-fatal — schema may already be current)');
    }
  }

  if (process.env.SEED_ON_BOOT !== 'false') {
    try {
      await require('./prisma/seed').runBaselineSeed();
      logger.info('[boot] baseline seed complete.');
    } catch (err) {
      logger.warn({ err }, '[boot] seed failed (non-fatal)');
    }
  }

  // Idempotent data migration: on self-hosted upgrades from the legacy
  // Customer/Supplier model, this populates the unified Contact table and
  // repoints legacy FKs. Both scripts skip rows that are already migrated,
  // so this is a cheap no-op on every boot once an install is caught up.
  if (process.env.BACKFILL_ON_BOOT !== 'false') {
    try {
      logger.info('[boot] contact data backfill...');
      await require('./prisma/migrateContacts').migrateContacts();
      await require('./prisma/backfillContactFks').backfillContactFks();
      logger.info('[boot] contact backfill complete.');
    } catch (err) {
      logger.warn({ err }, '[boot] contact backfill failed (non-fatal)');
    }

    // Idempotent role backfill: adds the ACCOUNT_CREDIT / CUSTOMER_CREDIT_EXPENSE
    // ledger roles for any tenant that already went live before these roles
    // existed (applyPack refuses to re-run once ledgerInitialized=true). A cheap
    // no-op once every tenant is caught up.
    try {
      logger.info('[boot] account-credit role backfill...');
      await require('./prisma/backfillAccountCreditRoles').backfillAccountCreditRoles();
      logger.info('[boot] account-credit role backfill complete.');
    } catch (err) {
      logger.warn({ err }, '[boot] account-credit role backfill failed (non-fatal)');
    }
  }

  // Idempotent geo dataset import: populates the Country/State lookup tables
  // from the bundled dataset (prisma/data/geo-countries-states.json). Without
  // this, a fresh self-hosted install has empty/sparse Country/State tables,
  // and ANY country/state selection in Company Settings would violate the
  // CompanySettings.countryId/stateId foreign key on save. Match-then-update
  // by iso2/code preserves fixed seeded ids, so re-running is a cheap no-op.
  if (process.env.GEO_ON_BOOT !== 'false') {
    try {
      logger.info('[boot] geo dataset import...');
      await require('./prisma/importGeoDataset').importGeoDataset();
      logger.info('[boot] geo dataset import complete.');
    } catch (err) {
      logger.warn({ err }, '[boot] geo dataset import failed (non-fatal)');
    }
  }

  // -------------------------------------------------------------------------
  // Start listening — runs after migrate + seed + contact backfill + geo
  // import complete (or are skipped).
  // -------------------------------------------------------------------------
  if (process.env.ENABLE_HTTPS === 'true') {
    const options = {
      key: fs.readFileSync(__dirname + '/ssl.key'),
      cert: fs.readFileSync(__dirname + '/ssl.crt'),
    };
    https.createServer(options, app).listen(PORT, () => {
      logger.info({ port: PORT, protocol: 'https' }, `SAPAR API listening on port ${PORT} (HTTPS)`);
    });
  } else {
    app.listen(PORT, () => {
      logger.info({ port: PORT, protocol: 'http' }, `SAPAR API listening on port ${PORT}`);
    });
  }
})();
