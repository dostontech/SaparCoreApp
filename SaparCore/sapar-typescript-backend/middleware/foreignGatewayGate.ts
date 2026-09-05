import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that gates legacy foreign payment processors (Razorpay, Stripe).
 * Disabled by default in compliance with AGENTS.md regional scope (Uzbekistan & Central Asia).
 * Set ENABLE_FOREIGN_GATEWAYS=true in .env only if specifically required.
 */
export function gateForeignGateways(_req: Request, res: Response, next: NextFunction): void {
  if (process.env.ENABLE_FOREIGN_GATEWAYS === 'true') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: 'Foreign payment processors (Razorpay/Stripe) are disabled in Central Asia / Uzbekistan deployment. Please use Payme, Click, or Uzum Pay.',
  });
}

module.exports = { gateForeignGateways };
