/**
 * lib/logger.ts
 *
 * Central Pino logger for the entire SAPAR API.
 *
 * Usage (import this instead of calling console.log/error directly):
 *
 *   import logger from '../lib/logger';
 *
 *   logger.info({ invoiceId }, 'Invoice created');
 *   logger.error({ err, tenantId }, 'Failed to send email');
 *   logger.warn({ userId }, 'Rate limit approaching');
 *
 * In production (NODE_ENV=production):
 *   - Outputs newline-delimited JSON (NDJSON) — compatible with Loki, Datadog,
 *     CloudWatch, ELK, etc. Pipe `docker logs` to any log aggregator.
 *   - Level defaults to 'info'. Set LOG_LEVEL env var to override.
 *
 * In development:
 *   - pino-pretty formats output with colors and human-readable timestamps.
 *   - Level defaults to 'debug'.
 *
 * Child loggers (recommended for controllers):
 *
 *   const log = logger.child({ module: 'invoiceController' });
 *   log.info({ invoiceId, tenantId }, 'Invoice sent');
 *   // → { module: 'invoiceController', invoiceId: '...', tenantId: '...', msg: '...' }
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';
const level = process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info');

const logger = pino({
  level,
  // Base fields on every log line — useful for filtering in log aggregators.
  base: {
    service: 'sapar-api',
    env: process.env.NODE_ENV ?? 'unknown',
  },
  // ISO timestamp on every line.
  timestamp: pino.stdTimeFunctions.isoTime,
  // In development: pretty-print with colors. In production: raw JSON.
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname,service,env',
          },
        },
      }
    : {}),
  // Redact sensitive fields so they never appear in logs, even accidentally.
  redact: {
    paths: [
      'password',
      'passwordHash',
      'jwt',
      'token',
      'authorization',
      'req.headers.authorization',
      'body.password',
      'body.newPassword',
      'body.currentPassword',
      '*.secretKey',
      '*.secret',
      '*.apiKey',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;

// CommonJS interop for server.js and any remaining .js controllers
module.exports = logger;
module.exports.default = logger;
