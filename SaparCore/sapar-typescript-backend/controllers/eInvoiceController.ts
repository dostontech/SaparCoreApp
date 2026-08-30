import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import crypto from 'crypto';

import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';
import { SaparEdiHubService, SoliqEInvoicePayload } from '../services/saparEdiHubService';

/**
 * Lists all electronic invoices in the system with status filters.
 */
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const page = Math.max(1, parseInt((req.query.page as string) ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10)));
    const where: Prisma.EInvoiceRecordWhereInput = { userId };
    const status = req.query.status as string | undefined;
    if (status) where.status = status as Prisma.EInvoiceRecordWhereInput['status'];

    const [rows, total] = await Promise.all([
      prisma.eInvoiceRecord.findMany({
        where,
        include: { invoice: { select: { id: true, invoiceNumber: true, TotalAmount: true, status: true, invoiceDate: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.eInvoiceRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        eInvoices: rows.map((r) => ({
          id: r.id,
          irn: r.irn,
          ackNo: r.ackNo,
          ackDate: r.ackDate,
          status: r.status,
          provider: r.provider || 'SAPAR_EDI_HUB',
          signedInvoice: r.signedInvoice,
          signedQRCode: r.signedQRCode,
          metadata: r.metadata,
          errorMessage: r.errorMessage,
          invoice: r.invoice
            ? {
                id: r.invoice.id,
                invoiceNumber: r.invoice.invoiceNumber,
                totalAmount: r.invoice.TotalAmount,
                invoiceDate: r.invoice.invoiceDate,
              }
            : null,
          createdAt: r.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('eInvoice list error:', err);
    res.status(500).json({ success: false, message: 'Failed to list e-invoices' });
  }
}

/**
 * Prepares an invoice for E-IMZO signing.
 * Generates the canonical Soliq JSON payload and SHA-256 hash.
 */
export async function prepareSoliqDocument(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { invoiceId } = req.params as { invoiceId: string };

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId, isDeleted: false },
      include: {
        contact: true,
      },
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });
      return;
    }

    const companySettings = await prisma.companySettings.findFirst({
      where: { userId },
    });

    const soliqPayload = SaparEdiHubService.buildSoliqPayload(invoice, companySettings);
    const canonicalString = JSON.stringify(soliqPayload);
    const documentHash = crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');

    res.json({
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        documentHash,
        canonicalString,
        soliqPayload,
        hub: 'SAPAR_EDI_HUB',
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('prepareSoliqDocument error:', err);
    res.status(500).json({ success: false, message: 'Hujjatni tayyorlashda xatolik yuz berdi' });
  }
}

/**
 * Submits the signed E-IMZO PKCS#7 signature to SAPAR EDI Hub.
 */
export async function submitSignedDocument(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { invoiceId, pkcs7Signature, soliqPayload, signerPinfl, signerTin } = req.body;

    if (!invoiceId || !pkcs7Signature) {
      res.status(400).json({ success: false, message: 'Imzo yoki hisob-faktura ID mavjud emas' });
      return;
    }

    const result = await SaparEdiHubService.signAndDispatch({
      userId,
      invoiceId,
      pkcs7Signature,
      signerPinfl,
      signerTin,
      customPayload: soliqPayload,
    });

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('submitSignedDocument error:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Hujjatni imzolashda xatolik' });
  }
}

/**
 * Checks live verification status for an e-document.
 */
export async function checkStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { docId } = req.params as { docId: string };

    const record = await prisma.eInvoiceRecord.findFirst({
      where: {
        userId,
        OR: [{ id: docId }, { invoiceId: docId }, { irn: docId }],
      },
      include: { invoice: true },
    });

    if (!record) {
      res.status(404).json({ success: false, message: 'Elektron hujjat topilmadi' });
      return;
    }

    res.json({
      success: true,
      data: {
        documentId: record.invoiceId,
        docUuid: record.irn,
        status: record.status,
        provider: record.provider,
        signedAt: record.ackDate,
        qrCodeUrl: record.signedQRCode,
        metadata: record.metadata,
      },
    });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Statusni tekshirishda xatolik' });
  }
}

/**
 * Gets incoming vendor invoices received by SAPAR EDI Hub.
 */
export async function getInbox(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const companySettings = await prisma.companySettings.findFirst({ where: { userId } });
    const userTin = companySettings?.companyTaxNumber || companySettings?.taxNumber;

    if (!userTin) {
      res.json({ success: true, data: { inbox: [] } });
      return;
    }

    // Find all e-invoice records where buyerTin matches this company's STIR
    const records = await prisma.eInvoiceRecord.findMany({
      where: {
        provider: 'SAPAR_EDI_HUB',
        NOT: { userId }, // Not sent by this user
      },
      include: { invoice: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const matchingInbox = records
      .filter((r) => {
        const meta = r.metadata as any;
        return meta?.canonicalPayload?.buyer?.tin === userTin;
      })
      .map((r) => {
        const meta = r.metadata as any;
        const payload = meta?.canonicalPayload as SoliqEInvoicePayload;
        return {
          id: r.id,
          docUuid: r.irn,
          docNumber: payload?.documentNumber || r.invoice?.invoiceNumber || 'SF',
          docDate: payload?.documentDate || r.createdAt.toISOString().split('T')[0],
          contractNumber: payload?.contractNumber,
          supplierName: payload?.seller?.name || 'Yetkazib beruvchi',
          supplierTin: payload?.seller?.tin || '',
          totalSum: payload?.totals?.totalSum || Number(r.invoice?.TotalAmount || 0),
          vatSum: payload?.totals?.vatSum || 0,
          status: r.status === 'SENT' ? 'WAITING_SIGNATURE' : r.status,
          signedBySupplierAt: r.ackDate,
          items: payload?.items || [],
          qrCodeUrl: r.signedQRCode,
        };
      });

    res.json({ success: true, data: { inbox: matchingInbox } });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Kiruvchi hisob-fakturalarni yuklashda xatolik' });
  }
}

/**
 * Exports canonical Soliq XML document.
 */
export async function exportSoliqXml(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { invoiceId } = req.params as { invoiceId: string };

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId, isDeleted: false },
      include: { contact: true },
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });
      return;
    }

    const companySettings = await prisma.companySettings.findFirst({ where: { userId } });
    const payload = SaparEdiHubService.buildSoliqPayload(invoice, companySettings);

    const record = await prisma.eInvoiceRecord.findFirst({
      where: { invoiceId, userId },
    });

    const xml = SaparEdiHubService.generateSoliqXml(payload, record?.signedInvoice || undefined);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="soliq_factura_${invoice.invoiceNumber}.xml"`);
    res.send(xml);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    console.error('exportSoliqXml error:', err);
    res.status(500).json({ success: false, message: 'XML eksport qilishda xatolik' });
  }
}

/**
 * Public real-time invoice verification endpoint for QR code scans.
 */
export async function publicVerifyInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { docUuid } = req.params as { docUuid: string };

    const record = await prisma.eInvoiceRecord.findFirst({
      where: {
        OR: [{ irn: docUuid }, { id: docUuid }],
      },
      include: {
        invoice: {
          include: { contact: true },
        },
      },
    });

    if (!record) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html lang="uz">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hujjat Topilmadi — SAPAR EDI Hub</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px 20px; background: #F8FAFC; color: #334155; text-align: center; }
            .box { max-width: 480px; margin: 60px auto; background: #FFFFFF; padding: 36px 30px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .icon-wrap { width: 56px; height: 56px; background: #FEE2E2; color: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
            h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0F172A; }
            p { margin: 0; font-size: 14px; color: #64748B; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2>Hujjat Topilmadi</h2>
            <p>Ushbu identifikator boʻyicha tizimda roʻyxatdan oʻtgan elektron hisob-faktura mavjud emas yoki u bekor qilingan.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const meta = (record.metadata || {}) as any;
    const payload = (meta.canonicalPayload || {}) as SoliqEInvoicePayload;

    const sellerName = payload?.seller?.name || 'Sotuvchi Korxona';
    const sellerTin = payload?.seller?.tin || 'STIR koʻrsatilmagan';
    const buyerName = payload?.buyer?.name || record.invoice?.contact?.companyName || 'Xaridor';
    const docNumber = payload?.documentNumber || record.invoice?.invoiceNumber || 'SF';
    const docDate = payload?.documentDate || record.createdAt.toISOString().split('T')[0];
    const totalAmount = payload?.totals?.totalSum || Number(record.invoice?.TotalAmount || 0);
    const signedAt = record.ackDate ? new Date(record.ackDate).toLocaleString('uz-UZ') : 'Tasdiqlangan';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html lang="uz">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Elektron Hisob-Faktura Sertifikati — ${docNumber}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #F0FBF8;
            color: #0B2B33;
            margin: 0;
            padding: 32px 16px;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 680px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 20px;
            box-shadow: 0 20px 40px -15px rgba(2, 128, 144, 0.12), 0 0 0 1px rgba(2, 195, 154, 0.2);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #028090 0%, #02A892 50%, #02C39A 100%);
            color: #FFFFFF;
            padding: 32px 28px;
            text-align: center;
            position: relative;
          }
          .header-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.18);
            border-radius: 14px;
            margin-bottom: 12px;
            backdrop-filter: blur(8px);
          }
          .header-title {
            margin: 0;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: -0.01em;
          }
          .header-subtitle {
            margin: 6px 0 0 0;
            opacity: 0.92;
            font-size: 13.5px;
            font-weight: 400;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #FFFFFF;
            color: #065F46;
            padding: 7px 16px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 13px;
            margin-top: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .content {
            padding: 32px 28px;
          }
          .amount-panel {
            text-align: center;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .amount-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748B;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .amount-value {
            font-size: 28px;
            font-weight: 800;
            color: #028090;
            letter-spacing: -0.02em;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          @media (max-width: 600px) {
            .grid { grid-template-columns: 1fr; }
          }
          .card {
            background: #FFFFFF;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #64748B;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .card-value {
            font-size: 14.5px;
            font-weight: 600;
            color: #0F172A;
            line-height: 1.4;
            word-break: break-all;
          }
          .status-panel {
            background: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 12px;
            padding: 18px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 24px;
          }
          .status-icon {
            color: #16A34A;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .status-text-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #15803D;
            margin-bottom: 3px;
          }
          .status-text-desc {
            font-size: 12.5px;
            color: #166534;
            line-height: 1.5;
          }
          .doc-uuid-wrap {
            background: #F8FAFC;
            border: 1px dashed #CBD5E1;
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 12px;
            color: #475569;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer {
            text-align: center;
            padding: 18px;
            background: #F8FAFC;
            border-top: 1px solid #E2E8F0;
            font-size: 12.5px;
            color: #64748B;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h1 class="header-title">Oʻzbekiston Davlat Soliq Standarti</h1>
            <p class="header-subtitle">SAPAR E-Faktura & Soliq EDI Hub — Raqamli Tekshiruv</p>
            <div class="badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#065F46" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              E-IMZO Bilan Tasdiqlangan & Yaroqli
            </div>
          </div>
          <div class="content">
            <div class="amount-panel">
              <div class="amount-label">Jami Faktura Qiymati (QQS 12% bilan)</div>
              <div class="amount-value">${totalAmount.toLocaleString()} UZS</div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="card-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Hujjat Raqami va Sanasi
                </div>
                <div class="card-value">№ ${docNumber} (${docDate})</div>
              </div>
              <div class="card">
                <div class="card-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Imzolangan Vaqti
                </div>
                <div class="card-value">${signedAt}</div>
              </div>
              <div class="card">
                <div class="card-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Sotuvchi (Yetkazib Beruvchi)
                </div>
                <div class="card-value">${sellerName}</div>
                <div style="font-size: 12.5px; color: #64748B; margin-top: 3px;">STIR: <b>${sellerTin}</b></div>
              </div>
              <div class="card">
                <div class="card-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Xaridor (Mijoz)
                </div>
                <div class="card-value">${buyerName}</div>
              </div>
            </div>

            <div class="status-panel">
              <div class="status-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <div class="status-text-title">Raqamli Imzo Holati Tasdiqlangan</div>
                <div class="status-text-desc">Ushbu elektron hisob-faktura Oʻzbekiston Respublikasi "Elektron raqamli imzo toʻgʻrisida"gi qonuniga muvofiq E-IMZO PKCS#7 kaliti bilan imzolangan boʻlib, toʻliq yuridik kuchga ega.</div>
              </div>
            </div>

            <div class="doc-uuid-wrap">
              <span>Hujjat ID (Doc UUID): <code style="font-weight:600;color:#0F172A;">${record.irn}</code></span>
              <span style="font-size:11.5px;color:#028090;font-weight:600;">SAPAR EDI HUB</span>
            </div>
          </div>
          <div class="footer">
            SAPAR Cloud ERP — Oʻzbekiston va Markaziy Osiyo Milliy Standarti
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('publicVerifyInvoice error:', err);
    res.status(500).send('Tekshirishda xatolik yuz berdi');
  }
}
