/**
 * lib/validateEnv.ts
 *
 * Validates critical environment variables at startup.
 * Fails fast (throws) before the server binds to any port so that a
 * misconfigured container is immediately visible in container logs and the
 * health-check fails, instead of silently running with insecure defaults.
 *
 * Call this ONCE at the very top of server.js (after dotenv.config()).
 */

const PLACEHOLDER_PATTERNS = [
  /^change-me/i,
  /^your-/i,
  /^<.*>$/,
  /^example/i,
  /^replace/i,
  /^TODO/,
  /^FIXME/,
];

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(value.trim()));
}

interface EnvRule {
  key: string;
  /** If true the check is only enforced when NODE_ENV === 'production' */
  productionOnly?: boolean;
  /** Minimum string length (after trimming) */
  minLength?: number;
  description: string;
}

const REQUIRED_VARS: EnvRule[] = [
  {
    key: 'JWT_SECRET',
    minLength: 32,
    description: 'JWT signing secret — generate with: openssl rand -hex 32',
  },
  {
    key: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
  },
  {
    key: 'POSTGRES_PASSWORD',
    productionOnly: true,
    minLength: 8,
    description: 'PostgreSQL password — must be a strong unique value',
  },
];

const RECOMMENDED_VARS: EnvRule[] = [
  {
    key: 'AI_ENCRYPTION_KEY',
    minLength: 32,
    productionOnly: true,
    description: 'AES-256-GCM key for BYOK provider keys — generate with: openssl rand -hex 32',
  },
  {
    key: 'CORS_ORIGIN',
    productionOnly: true,
    description: 'Comma-separated list of allowed CORS origins, e.g. https://app.sapar.uz',
  },
  {
    key: 'SMTP_HOST',
    productionOnly: true,
    description: 'SMTP host for invoice emails and reminders',
  },
];

export function validateEnv(): void {
  const isProd = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of REQUIRED_VARS) {
    if (rule.productionOnly && !isProd) continue;

    const value = process.env[rule.key];

    if (!value || value.trim() === '') {
      errors.push(`  ❌ ${rule.key} is not set — ${rule.description}`);
      continue;
    }

    if (isPlaceholder(value)) {
      errors.push(
        `  ❌ ${rule.key} still contains a placeholder value ("${value.slice(0, 20)}...") — ${rule.description}`
      );
      continue;
    }

    if (rule.minLength && value.trim().length < rule.minLength) {
      errors.push(
        `  ❌ ${rule.key} is too short (${value.trim().length} chars, minimum ${rule.minLength}) — ${rule.description}`
      );
    }
  }

  for (const rule of RECOMMENDED_VARS) {
    if (rule.productionOnly && !isProd) continue;

    const value = process.env[rule.key];

    if (!value || value.trim() === '') {
      warnings.push(`  ⚠️  ${rule.key} is not set — ${rule.description}`);
      continue;
    }

    if (isPlaceholder(value)) {
      warnings.push(
        `  ⚠️  ${rule.key} still contains a placeholder value — ${rule.description}`
      );
    }
  }

  if (warnings.length > 0) {
    console.warn('\n[env] Configuration warnings:');
    warnings.forEach(w => console.warn(w));
    console.warn('');
  }

  if (errors.length > 0) {
    console.error('\n[env] ❌ FATAL: Invalid or missing environment variables:');
    errors.forEach(e => console.error(e));
    console.error('\nFix the above issues in your docker/.env file before starting the server.');
    console.error('See DEPLOYMENT.md for setup instructions.\n');
    process.exit(1);
  }

  console.log(`[env] ✅ Environment validated (NODE_ENV=${process.env.NODE_ENV})`);
}
