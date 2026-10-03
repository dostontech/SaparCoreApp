/**
 * 🇺🇿 Uzbekistan Open Registry Controller
 *
 * Exposes endpoints for:
 *  - Company requisites lookup by 9-digit STIR (TIN)
 *  - Bank details lookup by 5-digit MFO
 *  - All registered commercial banks in Uzbekistan
 *  - Real-time Central Bank (CBU) official exchange rates
 */

import { Request, Response } from 'express';
import { UzRegistryService } from '../services/uzRegistryService';

export const getCompanyByTin = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawTin = Array.isArray(req.params.tin) ? req.params.tin[0] : req.params.tin;
    const tin = (rawTin || '').trim();

    if (!/^\d{9}$/.test(tin)) {
      res.status(400).json({
        success: false,
        message: "STIR / ИНН 9 ta raqamdan iborat bo'lishi shart (masalan: 309124567).",
      });
      return;
    }

    const company = await UzRegistryService.getCompanyByTin(tin);
    if (!company) {
      res.status(404).json({
        success: false,
        message: "STIR bo'yicha korxona ma'lumotlari topilmadi.",
      });
      return;
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (err: any) {
    console.error('[UzRegistry] Company lookup error:', err.message);
    res.status(500).json({
      success: false,
      message: "Reyestrdan ma'lumot olishda xatolik yuz berdi.",
    });
  }
};

export const getBankByMfo = (req: Request, res: Response): void => {
  try {
    const rawMfo = Array.isArray(req.params.mfo) ? req.params.mfo[0] : req.params.mfo;
    const mfo = (rawMfo || '').trim();

    if (!/^\d{5}$/.test(mfo)) {
      res.status(400).json({
        success: false,
        message: "Bank MFO kodi 5 ta raqamdan iborat bo'lishi shart (masalan: 00401).",
      });
      return;
    }

    const bank = UzRegistryService.getBankByMfo(mfo);
    if (!bank) {
      res.status(404).json({
        success: false,
        message: `${mfo} MFO kodi bo'yicha bank topilmadi.`,
      });
      return;
    }

    res.json({
      success: true,
      data: bank,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Bank ma'lumotlarini olishda xatolik yuz berdi.",
    });
  }
};

export const listBanks = (_req: Request, res: Response): void => {
  const banks = UzRegistryService.listBanks();
  res.json({
    success: true,
    data: banks,
  });
};

export const getCbuRates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rates = await UzRegistryService.getCbuRates();
    res.json({
      success: true,
      data: rates,
    });
  } catch (err: any) {
    console.error('[UzRegistry] CBU rates error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Markaziy Bank valyuta kurslarini yuklashda xatolik.',
    });
  }
};

export const searchMxik = (req: Request, res: Response): void => {
  try {
    const q = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    const limit = parseInt(req.query.limit as string, 10) || 25;

    const result = UzRegistryService.searchMxik(q, category, limit);
    res.json({
      success: true,
      data: result.items,
      total: result.total,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "MXIK katalogidan qidirishda xatolik yuz berdi.",
    });
  }
};

export const getMxikCategories = (_req: Request, res: Response): void => {
  try {
    const categories = UzRegistryService.listMxikCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "MXIK toifalarini olishda xatolik yuz berdi.",
    });
  }
};

export const getMxikByCode = (req: Request, res: Response): void => {
  try {
    const rawCode = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
    const code = (rawCode || '').trim();

    const item = UzRegistryService.getMxikByCode(code);
    if (!item) {
      res.status(404).json({
        success: false,
        message: `${code} kodi bo'yicha MXIK topilmadi.`,
      });
      return;
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "MXIK ma'lumotlarini olishda xatolik yuz berdi.",
    });
  }
};
