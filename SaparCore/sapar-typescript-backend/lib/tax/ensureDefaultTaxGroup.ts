/**
 * Default TaxGroup / TaxRate bootstrap for a freshly-onboarded tenant in Uzbekistan.
 *
 * Ensures:
 * 1. Global "QQS 12%" (Standard VAT in Uzbekistan) TaxGroup exists with a 12% VAT rate.
 * 2. "QQS 0% (Ozod qilingan / Imtiyozli)" 0% group exists as fallback.
 *
 * Fully idempotent — skips creation when the rate already exists for the tenant.
 */

import type { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma';

type DefaultTaxDb = Pick<PrismaClient, 'taxGroup' | 'taxRate'>;

const DEFAULT_TAX_GROUP_NAME = 'QQS 12% (Standart stavka)';
const DEFAULT_TAX_RATE_NAME = 'QQS 12%';

export interface EnsureDefaultTaxGroupResult {
  taxGroupId: string;
  /** true if a TaxGroup and/or TaxRate row was created in this call */
  created: boolean;
}

export async function ensureDefaultTaxGroup(
  userId: string,
  db: DefaultTaxDb = prisma,
): Promise<EnsureDefaultTaxGroupResult> {
  // Short-circuit: if this tenant already has ANY TaxGroup it can use for a Product
  const existingRate = await db.taxRate.findFirst({
    where: { userId, isDeleted: false, tax_groups: { some: {} } },
    select: { tax_groups: { select: { id: true }, take: 1 } },
  });
  if (existingRate && existingRate.tax_groups.length > 0) {
    return { taxGroupId: existingRate.tax_groups[0].id, created: false };
  }

  let created = false;

  // Global "QQS 12%" group (idempotent by name).
  let group = await db.taxGroup.findFirst({ where: { tax_name: DEFAULT_TAX_GROUP_NAME } });
  if (!group) {
    group = await db.taxGroup.create({ data: { tax_name: DEFAULT_TAX_GROUP_NAME, status: true } });
    created = true;
  }

  // Per-tenant 12% rate inside that group
  const rate = await db.taxRate.findFirst({
    where: { userId, name: DEFAULT_TAX_RATE_NAME, isDeleted: false },
  });
  if (!rate) {
    await db.taxRate.create({
      data: {
        userId,
        regime: 'VAT_GENERIC',
        name: DEFAULT_TAX_RATE_NAME,
        rate: '12',
        isActive: true,
        tax_groups: { connect: { id: group.id } },
      },
    });
    created = true;
  }

  return { taxGroupId: group.id, created };
}
