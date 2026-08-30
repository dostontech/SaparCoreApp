/**
 * middleware/requestLogger.ts
 *
 * HTTP request/response logging middleware using Pino.
 * Logs each request on completion with: method, url, status, duration (ms),
 * IP address, and user-agent. Sensitive headers are never logged.
 *
 * Skips logging for:
 *  - /api/healthz  (noisy in uptime checks, adds no value)
 *  - Static asset requests under /uploads/
 *
 * Usage in server.js:
 *   const { requestLogger } = require('./middleware/requestLogger');
 *   app.use(requestLogger);
 */

import type { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

const SKIP_PATHS = new Set(['/api/healthz']);

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Skip health checks and static file noise
  if (
    SKIP_PATHS.has(req.path) ||
    req.path.startsWith('/uploads/')
  ) {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level]({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
        ?? req.socket?.remoteAddress
        ?? 'unknown',
      ua: req.headers['user-agent']?.slice(0, 120) ?? '',
      // Attach user/tenant context when available (set by authMiddleware)
      userId: (req as any).user ?? undefined,
      tenantId: (req as any).tenantId ?? undefined,
    }, `${req.method} ${req.originalUrl} ${res.statusCode}`);
  });

  next();
}

// CommonJS interop
module.exports = { requestLogger };
