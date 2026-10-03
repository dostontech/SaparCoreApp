import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bootstrapTenant, DEFAULT_UNITS } from '../lib/tenantBootstrap';

const { mockFindUnique, mockUpdate, mockFindFirstPettyCash, mockCreatePettyCash, mockFindFirstBank, mockCreateBank, mockFindFirstUnit, mockCreateUnit, mockFindFirstCat, mockCreateCat } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockFindFirstPettyCash: vi.fn(),
  mockCreatePettyCash: vi.fn(),
  mockFindFirstBank: vi.fn(),
  mockCreateBank: vi.fn(),
  mockFindFirstUnit: vi.fn(),
  mockCreateUnit: vi.fn(),
  mockFindFirstCat: vi.fn(),
  mockCreateCat: vi.fn(),
}));

vi.mock('../lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (cb) => cb({
      companySettings: { update: mockUpdate },
      account: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      ledgerAccountMapping: { upsert: vi.fn() },
      taxGroup: { findFirst: vi.fn(), create: vi.fn() },
      taxRate: { findFirst: vi.fn(), create: vi.fn() },
    })),
    companySettings: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
    pettyCash: {
      findFirst: mockFindFirstPettyCash,
      create: mockCreatePettyCash,
    },
    bankDetail: {
      findFirst: mockFindFirstBank,
      create: mockCreateBank,
    },
    unit: {
      findFirst: mockFindFirstUnit,
      create: mockCreateUnit,
    },
    category: {
      findFirst: mockFindFirstCat,
      create: mockCreateCat,
    },
    taxGroup: { findFirst: vi.fn(), create: vi.fn() },
    taxRate: { findFirst: vi.fn(), create: vi.fn() },
    transactionCategory: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('../lib/ledger/applyPack', () => ({
  applyPack: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../prisma/seedTransactionCategories', () => ({
  seedTransactionCategoriesForUser: vi.fn().mockResolvedValue({ created: 5, migrated: 0 }),
}));

vi.mock('../lib/tax/ensureDefaultTaxGroup', () => ({
  ensureDefaultTaxGroup: vi.fn().mockResolvedValue({ taxGroupId: 'tg-1', created: true }),
}));

describe('tenantBootstrap', () => {
  const USER_ID = 'test-user-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provisions foundational master data (units, petty cash, bank, category) for new tenant', async () => {
    mockFindUnique.mockResolvedValue({ id: 'cs-1', userId: USER_ID, ledgerInitialized: false });
    mockFindFirstPettyCash.mockResolvedValue(null);
    mockFindFirstBank.mockResolvedValue(null);
    mockFindFirstUnit.mockResolvedValue(null);
    mockFindFirstCat.mockResolvedValue(null);

    const res = await bootstrapTenant(USER_ID, {
      companyName: 'Test MCHJ',
      bankName: 'Kapitalbank',
      bankAccount: '20208000500123456001',
      bankMfo: '01036',
      stir: '308123456',
      customModules: { pos: true, sales: true },
    });

    expect(res.success).toBe(true);
    expect(res.details.ledgerInitialized).toBe(true);
    expect(res.details.taxGroupEnsured).toBe(true);
    expect(res.details.unitsEnsured).toBe(true);
    expect(res.details.pettyCashCreated).toBe(true);
    expect(res.details.bankDetailCreated).toBe(true);
    expect(res.details.categoryCreated).toBe(true);

    expect(mockCreatePettyCash).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER_ID,
          openingBalance: 0,
          currentBalance: 0,
        }),
      })
    );

    expect(mockCreateBank).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER_ID,
          bankName: 'Kapitalbank',
          accountNumber: '20208000500123456001',
          currencyCode: 'UZS',
        }),
      })
    );
  });

  it('skips ledger re-initialization if already initialized', async () => {
    mockFindUnique.mockResolvedValue({ id: 'cs-1', userId: USER_ID, ledgerInitialized: true });
    mockFindFirstPettyCash.mockResolvedValue({ id: 'pc-1' });
    mockFindFirstBank.mockResolvedValue({ id: 'bd-1' });
    mockFindFirstUnit.mockResolvedValue({ id: 'u-1' });
    mockFindFirstCat.mockResolvedValue({ id: 'cat-1' });

    const res = await bootstrapTenant(USER_ID);

    expect(res.success).toBe(true);
    expect(res.details.ledgerInitialized).toBe(false);
    expect(mockCreatePettyCash).not.toHaveBeenCalled();
    expect(mockCreateBank).not.toHaveBeenCalled();
  });
});
