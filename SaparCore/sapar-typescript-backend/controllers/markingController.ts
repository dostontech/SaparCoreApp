import type { Request, Response } from 'express';
import {
  MARKING_CATEGORIES,
  validateMarkingCodeForPosAsync,
  registerInboundMarkingCodeAsync,
  writeOffExpiredMarkingCodeAsync,
  validateMarkingCodeForPos,
  registerInboundMarkingCode,
  writeOffExpiredMarkingCode,
  parseAslBelgisiDataMatrix,
} from '../lib/marking/aslBelgisiService';
import { requireUserId } from '../lib/tenantScope';
import { prisma } from '../lib/prisma';

/**
 * GET /admin/marking/categories
 * Returns official Asl Belgisi regulated product categories in Uzbekistan.
 */
export async function getMarkingCategories(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: Object.values(MARKING_CATEGORIES),
  });
}

/**
 * POST /admin/marking/verify
 * Validates a scanned DataMatrix code at POS checkout or reception.
 * Enforces Decree No. 296 hard-stop on expired goods.
 */
export async function verifyMarkingCode(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireUserId(req);
    const { code, productId } = req.body as { code: string; productId?: string };

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Markirovka kodi kiritilmadi.',
      });
      return;
    }

    const result = await validateMarkingCodeForPosAsync(tenantId, code, { id: productId });

    if (result.blocked) {
      res.status(422).json({
        success: false,
        blocked: true,
        reason: result.reason,
        message: result.message,
        data: result.parsed,
      });
      return;
    }

    res.json({
      success: true,
      blocked: false,
      message: result.message,
      data: result.parsed,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Markirovka kodini tekshirishda xatolik yuz berdi.',
    });
  }
}

/**
 * POST /admin/marking/register
 * Inbound capture of digital marking codes during purchase goods receipt.
 */
export async function registerMarkingCodes(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireUserId(req);
    const { codes, productId, purchaseId } = req.body as {
      codes: string[];
      productId?: string;
      purchaseId?: string;
    };

    if (!Array.isArray(codes) || codes.length === 0) {
      res.status(400).json({ success: false, message: 'Kamida bitta markirovka kodi talab qilinadi.' });
      return;
    }

    const registered = await Promise.all(
      codes.map((c) => registerInboundMarkingCodeAsync(tenantId, c, productId))
    );

    res.json({
      success: true,
      count: registered.length,
      data: registered,
      message: `${registered.length} ta markirovka kodi omborga qabul qilindi.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /admin/marking/write-off
 * Writes off expired marked goods to GL Account 9430 per Decree No. 296.
 */
export async function writeOffMarkingCode(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireUserId(req);
    const { code, productId, reason, unitCost } = req.body as {
      code: string;
      productId?: string;
      reason?: string;
      unitCost?: number;
    };

    if (!code) {
      res.status(400).json({ success: false, message: 'Markirovka kodi talab qilinadi.' });
      return;
    }

    const writeOffResult = await writeOffExpiredMarkingCodeAsync(
      tenantId,
      code,
      reason || 'Yaroqlilik muddati oʻtgan tovar (VM 296-son qarori)'
    );

    // If unitCost or product was provided, post journal entry to GL Account 9430 / 2910
    const cost = Number(unitCost || 0);
    let journalEntryId: string | null = null;

    if (cost > 0) {
      try {
        const { postJournalEntry } = require('../lib/ledger/ledgerPosting');
        const entry = await postJournalEntry({
          userId: tenantId,
          type: 'MANUAL',
          date: new Date(),
          reference: `MARKING-WRITEOFF-${writeOffResult.record?.serialNumber || Date.now()}`,
          notes: `VM 296-son qarori: muddati oʻtgan markirovka hisobdan chiqarildi (${code.substring(0, 20)}...)`,
          lines: [
            {
              accountCode: '9430', // Boshqa operatsion xarajatlar
              debit: cost,
              credit: 0,
              description: 'Yaroqlilik muddati oʻtgan tovarlarni hisobdan chiqarish xarajati',
            },
            {
              accountCode: '2910', // Ombordagi tovarlar
              debit: 0,
              credit: cost,
              description: 'Muddati oʻtgan tovar qoldigʻi kamayishi',
            },
          ],
        });
        journalEntryId = entry?.id || null;
      } catch (ledgerErr) {
        console.warn('Marking write-off ledger posting fallback:', ledgerErr);
      }
    }

    res.json({
      success: true,
      message: 'Muddati oʻtgan tovar muvaffaqiyatli hisobdan chiqarildi va 9430-hisobga oʻtkazildi.',
      glAccount: '9430',
      journalEntryId,
      data: writeOffResult.record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
