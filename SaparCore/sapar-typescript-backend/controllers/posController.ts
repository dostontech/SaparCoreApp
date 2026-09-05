/**
 * controllers/posController.ts
 *
 * 🇺🇿 Point of Sale (POS) & Retail Touch Terminal Controller
 *
 * Features:
 *   - Database-persisted cashier shift management (PosShift model)
 *   - Transactional checkout ($transaction) with PosReceipt + Invoice + Stock Deduction + GL Auto-Posting
 *   - Client-generated idempotency key support to prevent duplicate checkouts
 *   - Fast barcode/SKU & category product search
 *   - Split tender checkout: Naqd pul (Cash), Uzcard, Humo, Payme/Click QR, Nasiya (Credit)
 *   - Real-time inventory deduction via applyStockAdjustment
 *   - 58mm / 80mm Soliq fiscal thermal receipt generation
 */

import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireUserId, UnauthorizedError } from '../lib/tenantScope';
import { applyStockAdjustment } from '../lib/inventory/stockAdjust';
import { postInvoiceIssued, postInvoicePayment, postSaleCogs } from '../lib/ledger/ledgerPosting';
import { applyWacIssue, applyFifoIssue } from '../lib/ledger/inventoryValuation';
import { TelegramNotificationService } from '../services/telegramNotificationService';
import { validateMarkingCodeForPos, recordMarkingCodeSold } from '../lib/marking/aslBelgisiService';

function handleUnauthorized(res: Response, err: unknown): boolean {
  if (err instanceof UnauthorizedError) {
    res.status(err.status).json({ success: false, message: err.message });
    return true;
  }
  return false;
}

function formatReceiptResponse(receipt: any, company?: any) {
  return {
    receiptId: receipt.receiptNumber,
    fiscalNumber: receipt.fiscalNumber,
    qrCodeUrl: receipt.qrCodeUrl,
    createdAt: receipt.createdAt instanceof Date ? receipt.createdAt.toISOString() : receipt.createdAt,
    company: {
      name: company?.companyName || 'SAPAR RETAIL MCHJ',
      tin: company?.companyTaxNumber || '308765432',
      address: company?.address || 'Toshkent shahri',
    },
    customer: {
      name: receipt.customerName || 'Chakana Xaridor',
      id: receipt.customerId || null,
    },
    items: receipt.items,
    subtotal: Number(receipt.subtotal),
    discountAmount: Number(receipt.discountAmount),
    vatAmount: Number(receipt.vatAmount),
    total: Number(receipt.total),
    payments: {
      method: receipt.paymentMethod,
      cash: Number(receipt.cashAmount || 0),
      uzcard: Number(receipt.uzcardAmount || 0),
      humo: Number(receipt.humoAmount || 0),
      qr: Number(receipt.qrAmount || 0),
      credit: Number(receipt.creditAmount || 0),
    },
  };
}

export async function getPosProducts(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const query = String(req.query.query || '').trim().toLowerCase();
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;

    const products = await prisma.product.findMany({
      where: {
        status: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: { select: { id: true, category_name: true } },
        unit: { select: { short_name: true } },
        inventories: {
          where: { userId, isDeleted: false },
          select: { quantity: true, quantityOnHand: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const categories = await prisma.category.findMany({
      where: { status: true },
      select: { id: true, category_name: true },
      orderBy: { category_name: 'asc' },
    });

    const filtered = query
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.code && p.code.toLowerCase().includes(query)) ||
            (p.barcode && p.barcode.toLowerCase().includes(query))
        )
      : products;

    res.json({
      success: true,
      data: {
        products: filtered.map((p) => {
          const inv = p.inventories && p.inventories.length > 0 ? p.inventories[0] : null;
          const liveStock = inv ? Number(inv.quantityOnHand ?? inv.quantity) : Number(p.stock || 0);

          return {
            id: p.id,
            name: p.name,
            sku: p.code || 'SKU-001',
            barcode: p.barcode || '4780001234567',
            mxikCode: (p as any).mxikCode || '01111001001000000',
            price: Number(p.selling_price || 0),
            purchasePrice: Number(p.purchase_price || 0),
            stock: liveStock,
            category: p.category?.category_name || 'Umumiy',
            unit: p.unit?.short_name || (p as any).unit || 'dona',
            taxPercent: 12,
            isMarked: Boolean((p as any).isMarked),
            markingCategory: (p as any).markingCategory || 'NONE',
          };
        }),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.category_name,
        })),
      },
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getPosProducts error:', err);
    res.status(500).json({ success: false, message: 'Mahsulotlarni yuklashda xatolik' });
  }
}

export async function getCurrentShift(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const shift = await prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    if (!shift) {
      res.json({ success: true, data: { hasOpenShift: false } });
      return;
    }

    res.json({
      success: true,
      data: {
        hasOpenShift: true,
        shift: {
          id: shift.id,
          cashierName: shift.cashierName,
          openedAt: shift.openedAt.toISOString(),
          openingCash: Number(shift.openingCash),
          totalSales: Number(shift.totalSales),
          cashSales: Number(shift.cashSales),
          uzcardSales: Number(shift.uzcardSales),
          humoSales: Number(shift.humoSales),
          qrSales: Number(shift.qrSales),
          creditSales: Number(shift.creditSales),
          totalTransactions: shift.totalTransactions,
          status: shift.status,
        },
      },
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getCurrentShift error:', err);
    res.status(500).json({ success: false, message: 'Smena maʼlumotini olishda xatolik' });
  }
}

export async function openShift(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { cashierName, openingCash } = req.body as {
      cashierName?: string;
      openingCash?: number;
    };

    // Check if an OPEN shift already exists for this tenant
    let shift = await prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    if (!shift) {
      shift = await prisma.posShift.create({
        data: {
          userId,
          cashierName: cashierName || 'Kassir',
          openingCash: new Prisma.Decimal(Number(openingCash || 0)),
          status: 'OPEN',
        },
      });
    }

    res.json({
      success: true,
      message: 'Kassa smenasi muvaffaqiyatli ochildi',
      data: {
        id: shift.id,
        cashierName: shift.cashierName,
        openedAt: shift.openedAt.toISOString(),
        openingCash: Number(shift.openingCash),
        totalSales: Number(shift.totalSales),
        cashSales: Number(shift.cashSales),
        uzcardSales: Number(shift.uzcardSales),
        humoSales: Number(shift.humoSales),
        qrSales: Number(shift.qrSales),
        creditSales: Number(shift.creditSales),
        totalTransactions: shift.totalTransactions,
        status: shift.status,
      },
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('openShift error:', err);
    res.status(500).json({ success: false, message: 'Smenani ochishda xatolik' });
  }
}

export async function closeShift(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { countedCash } = req.body as { countedCash?: number };

    const shift = await prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    if (!shift) {
      res.status(400).json({ success: false, message: 'Aktiv ochiq smena topilmadi' });
      return;
    }

    const expectedCash = Number(shift.openingCash) + Number(shift.cashSales);
    const actualCash = Number(countedCash || 0);
    const difference = actualCash - expectedCash;
    const closedAt = new Date();

    await prisma.posShift.update({
      where: { id: shift.id },
      data: {
        closingCash: new Prisma.Decimal(actualCash),
        status: 'CLOSED',
        closedAt,
      },
    });

    const zReport = {
      shiftId: shift.id,
      cashierName: shift.cashierName,
      openedAt: shift.openedAt.toISOString(),
      closedAt: closedAt.toISOString(),
      openingCash: Number(shift.openingCash),
      cashSales: Number(shift.cashSales),
      uzcardSales: Number(shift.uzcardSales),
      humoSales: Number(shift.humoSales),
      qrSales: Number(shift.qrSales),
      creditSales: Number(shift.creditSales),
      totalSales: Number(shift.totalSales),
      totalTransactions: shift.totalTransactions,
      expectedCash,
      actualCash,
      difference,
      differenceStatus:
        difference === 0 ? 'TENG (Toʻgʻri)' : difference < 0 ? `KAMOMAD (${difference} soʻm)` : `ORTIQCHA (+${difference} soʻm)`,
    };

    // Auto-push Z-Report to Telegram in background
    TelegramNotificationService.sendShiftZReport({
      shiftId: shift.id,
      cashierName: shift.cashierName,
      openedAt: shift.openedAt,
      closedAt,
      startingCash: Number(shift.openingCash),
      cashSales: Number(shift.cashSales),
      cardSales: Number(shift.uzcardSales) + Number(shift.humoSales) + Number(shift.qrSales),
      creditSales: Number(shift.creditSales),
      totalSales: Number(shift.totalSales),
      receiptsCount: shift.totalTransactions,
      expectedCash,
      actualCash,
      variance: difference,
      userId,
    }).catch((e) => console.error('Background Telegram Z-Report error:', e));

    res.json({
      success: true,
      message: 'Smena yopildi va Z-Hisobot shakllantirildi',
      data: zReport,
    });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('closeShift error:', err);
    res.status(500).json({ success: false, message: 'Smenani yopishda xatolik' });
  }
}

export async function getXReport(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const shift = await prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    if (!shift) {
      res.status(400).json({ success: false, message: 'Aktiv smena mavjud emas' });
      return;
    }

    const expectedCash = Number(shift.openingCash) + Number(shift.cashSales);

    const xReport = {
      reportType: 'X-HISOBOT (Oraliq Kassa Tekshiruvi)',
      shiftId: shift.id,
      cashierName: shift.cashierName,
      openedAt: shift.openedAt.toISOString(),
      currentTime: new Date().toISOString(),
      openingCash: Number(shift.openingCash),
      cashSales: Number(shift.cashSales),
      uzcardSales: Number(shift.uzcardSales),
      humoSales: Number(shift.humoSales),
      qrSales: Number(shift.qrSales),
      creditSales: Number(shift.creditSales),
      totalSales: Number(shift.totalSales),
      totalTransactions: shift.totalTransactions,
      expectedCashInDrawer: expectedCash,
    };

    res.json({ success: true, data: xReport });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getXReport error:', err);
    res.status(500).json({ success: false, message: 'X-Hisobotni shakllantirishda xatolik' });
  }
}

export async function posCheckout(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const {
      items,
      paymentMethod,
      cashAmount = 0,
      uzcardAmount = 0,
      humoAmount = 0,
      qrAmount = 0,
      creditAmount = 0,
      customerId,
      customerName = 'Chakana Xaridor',
      discountAmount = 0,
      idempotencyKey,
    } = req.body as {
      items: Array<{ id: string; name: string; quantity: number; price: number; sku?: string; barcode?: string }>;
      paymentMethod: string;
      cashAmount?: number;
      uzcardAmount?: number;
      humoAmount?: number;
      qrAmount?: number;
      creditAmount?: number;
      customerId?: string;
      customerName?: string;
      discountAmount?: number;
      idempotencyKey?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Savatda mahsulotlar mavjud emas' });
      return;
    }

    // 0. Asl Belgisi & Decree No. 296 Digital Marking Hard-Block Check
    for (const item of items) {
      const anyItem = item as any;
      const markingCodesToCheck: string[] = [];
      if (anyItem.markingCode) markingCodesToCheck.push(anyItem.markingCode);
      if (Array.isArray(anyItem.markingCodes)) markingCodesToCheck.push(...anyItem.markingCodes);

      for (const code of markingCodesToCheck) {
        const val = validateMarkingCodeForPos(userId, code, { id: item.id, name: item.name });
        if (val.blocked) {
          res.status(422).json({
            success: false,
            blocked: true,
            reason: val.reason,
            message: val.message,
            item: item.name,
            code,
          });
          return;
        }
      }
    }

    // 1. Idempotency Check: if this idempotency key was already committed for this tenant, return it safely.
    if (idempotencyKey) {
      const existingReceipt = await prisma.posReceipt.findFirst({
        where: { userId, idempotencyKey },
      });
      if (existingReceipt) {
        const company = await prisma.companySettings.findFirst({ where: { userId } });
        res.status(200).json({
          success: true,
          message: 'Savdo avval amalga oshirilgan (idempotent javob)',
          data: formatReceiptResponse(existingReceipt, company),
        });
        return;
      }
    }

    const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0);
    const discount = Math.max(0, Number(discountAmount || 0));
    const total = Math.max(0, subtotal - discount);
    const vatAmount = Math.round((total * 12) / 112); // Included 12% QQS
    const taxableAmount = total - vatAmount;

    // Check active shift
    let activeShift = await prisma.posShift.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });

    // 2. Perform checkout inside a single atomic Prisma $transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Stock sufficiency check with pessimistic row-level lock (SELECT ... FOR UPDATE)
      for (const item of items) {
        if (!item.id) continue;
        const requestedQty = Number(item.quantity) || 1;

        const lockedInvs: Array<{ id: string; quantity: number; quantityOnHand: Prisma.Decimal }> =
          await tx.$queryRaw`
            SELECT id, quantity, "quantityOnHand"
            FROM "Inventory"
            WHERE "productId" = ${item.id}
              AND "userId" = ${userId}
              AND "isDeleted" = false
            FOR UPDATE
          `;

        let available = 0;
        if (!lockedInvs || lockedInvs.length === 0) {
          const productRec = await tx.product.findFirst({
            where: { id: item.id },
          });
          if (productRec) {
            const initialQty = Math.max(Number(productRec.stock || 0), requestedQty);
            await tx.inventory.create({
              data: {
                productId: item.id,
                userId,
                quantity: initialQty,
                quantityOnHand: new Prisma.Decimal(initialQty),
                avgCost: productRec.purchase_price || new Prisma.Decimal(0),
              },
            });
            available = initialQty;
          } else {
            const err = new Error(`Mahsulot '${item.name}' omborda topilmadi`);
            (err as any).statusCode = 400;
            throw err;
          }
        } else {
          available = Number(lockedInvs[0].quantityOnHand ?? lockedInvs[0].quantity ?? 0);
        }

        if (available < requestedQty) {
          const err = new Error(
            `Mahsulot '${item.name}' uchun omborda yetarli qoldiq mavjud emas (Mavjud: ${available} ta, Soʻralgan: ${requestedQty} ta)`
          );
          (err as any).statusCode = 400;
          throw err;
        }
      }

      // Auto-create shift if none is active
      if (!activeShift) {
        activeShift = await tx.posShift.create({
          data: {
            userId,
            cashierName: 'Kassir',
            openingCash: new Prisma.Decimal(0),
            status: 'OPEN',
          },
        });
      }

      const receiptNumber = `CHK-${Date.now().toString().slice(-8)}`;
      const fiscalNumber = `FISC-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const company = await tx.companySettings.findFirst({ where: { userId } });

      // Create Sales Invoice record
      const invoiceNumber = `INV-POS-${Date.now().toString().slice(-8)}`;
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          userId,
          billFrom: userId,
          invoiceDate: new Date(),
          dueDate: new Date(),
          items: items as unknown as Prisma.InputJsonValue,
          status: 'PAID',
          payment_method: paymentMethod || 'POS',
          taxableAmount: new Prisma.Decimal(taxableAmount),
          TotalAmount: new Prisma.Decimal(total),
          vat: new Prisma.Decimal(vatAmount),
          totalDiscount: new Prisma.Decimal(discount),
          taxTreatment: 'STANDARD',
          currencyCode: 'UZS',
          exchangeRate: new Prisma.Decimal(1),
          invoiceType: 'INVOICE',
        },
      });

      // Resolve payment mode slug
      let paymentModeSlug = 'cash';
      if (Number(uzcardAmount) > 0 || Number(humoAmount) > 0) paymentModeSlug = 'card';
      else if (Number(qrAmount) > 0) paymentModeSlug = 'online-payment';
      else if (Number(creditAmount) > 0) paymentModeSlug = 'account-credit';

      let paymentMode = await tx.paymentMode.findFirst({ where: { slug: paymentModeSlug } });
      if (!paymentMode) {
        paymentMode = await tx.paymentMode.findFirst();
      }

      // Create PosReceipt
      const qrCodeUrl = `https://soliq.uz/check?tin=${company?.companyTaxNumber || '308765432'}&fiscal=${receiptNumber}`;
      const createdReceipt = await tx.posReceipt.create({
        data: {
          receiptNumber,
          fiscalNumber,
          userId,
          posShiftId: activeShift.id,
          invoiceId: createdInvoice.id,
          customerName: customerName || 'Chakana Xaridor',
          customerId: customerId || null,
          subtotal: new Prisma.Decimal(subtotal),
          discountAmount: new Prisma.Decimal(discount),
          vatAmount: new Prisma.Decimal(vatAmount),
          total: new Prisma.Decimal(total),
          paymentMethod: paymentMethod || 'Naqd Pul',
          cashAmount: new Prisma.Decimal(cashAmount || 0),
          uzcardAmount: new Prisma.Decimal(uzcardAmount || 0),
          humoAmount: new Prisma.Decimal(humoAmount || 0),
          qrAmount: new Prisma.Decimal(qrAmount || 0),
          creditAmount: new Prisma.Decimal(creditAmount || 0),
          qrCodeUrl,
          items: items as unknown as Prisma.InputJsonValue,
          idempotencyKey: idempotencyKey || null,
        },
      });

      // Compute COGS and Decrement Inventory for each item sold
      let totalCogs = new Prisma.Decimal(0);
      for (const item of items) {
        if (item.id) {
          const product = await tx.product.findUnique({
            where: { id: item.id },
            select: { item_type: true, valuationMethod: true },
          });

          const requestedQty = Math.abs(Number(item.quantity) || 1);

          if (product?.item_type !== 'Service') {
            const invForCogs = await tx.inventory.findFirst({
              where: { productId: item.id, userId, isDeleted: false },
            });
            const qoh = invForCogs?.quantityOnHand
              ? new Prisma.Decimal(invForCogs.quantityOnHand.toString())
              : new Prisma.Decimal(invForCogs?.quantity || requestedQty);

            if (product?.valuationMethod === 'FIFO') {
              const fifoResult = await applyFifoIssue(tx as any, {
                productId: item.id,
                userId,
                qty: requestedQty,
                currentQtyOnHand: qoh,
              });
              totalCogs = totalCogs.plus(fifoResult.cogs);
            } else {
              if (invForCogs) {
                const issue = applyWacIssue(
                  { quantityOnHand: qoh, avgCost: invForCogs.avgCost ?? new Prisma.Decimal(0) },
                  requestedQty,
                );
                totalCogs = totalCogs.plus(issue.cogs);
              }
            }
          }

          await applyStockAdjustment(tx as any, {
            productId: item.id,
            userId,
            qtyDelta: -requestedQty,
            type: 'stock_out',
            referenceType: 'invoice',
            referenceId: createdInvoice.id,
            extra: {
              notes: `POS savdosi ${receiptNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      // Update PosShift accumulators
      await tx.posShift.update({
        where: { id: activeShift.id },
        data: {
          totalSales: { increment: new Prisma.Decimal(total) },
          totalTransactions: { increment: 1 },
          cashSales: { increment: new Prisma.Decimal(cashAmount || 0) },
          uzcardSales: { increment: new Prisma.Decimal(uzcardAmount || 0) },
          humoSales: { increment: new Prisma.Decimal(humoAmount || 0) },
          qrSales: { increment: new Prisma.Decimal(qrAmount || 0) },
          creditSales: { increment: new Prisma.Decimal(creditAmount || 0) },
        },
      });

      // General Ledger Auto-Posting (Atomic within same $transaction)
      // 1. Post Invoice Issued (Dr AR / Cr SALES_REVENUE & Cr OUTPUT_TAX)
      await postInvoiceIssued(tx as any, {
        userId,
        invoiceId: createdInvoice.id,
        date: new Date(),
        total: total.toString(),
        tax: vatAmount.toString(),
        currencyCode: 'UZS',
        exchangeRate: 1,
      });

      // 2. Post Split Payments (Dr Cash/Card/Online/Credit / Cr AR)
      const tenders = [
        { amount: Number(cashAmount || 0), mode: 'cash' },
        { amount: Number(uzcardAmount || 0) + Number(humoAmount || 0), mode: 'card' },
        { amount: Number(qrAmount || 0), mode: 'online-payment' },
        { amount: Number(creditAmount || 0), mode: 'account-credit' },
      ];

      let anyTenderPosted = false;
      for (const tender of tenders) {
        if (tender.amount > 0) {
          anyTenderPosted = true;
          const pm = (await tx.paymentMode.findFirst({ where: { slug: tender.mode } })) || (await tx.paymentMode.findFirst());
          if (pm) {
            const payRow = await tx.invoicePayment.create({
              data: {
                invoiceId: createdInvoice.id,
                amount: new Prisma.Decimal(tender.amount),
                paymentModeId: pm.id,
                received_on: new Date(),
                notes: `POS Checkout ${receiptNumber} (${tender.mode})`,
                received_by: userId,
                currencyCode: 'UZS',
                exchangeRate: new Prisma.Decimal(1),
              },
            });

            await postInvoicePayment(tx as any, {
              userId,
              invoiceId: createdInvoice.id,
              paymentId: payRow.id,
              date: new Date(),
              amount: tender.amount.toString(),
              paymentModeSlug: tender.mode,
            });
          }
        }
      }

      // Fallback single-payment path when specific tender splits are not passed
      if (!anyTenderPosted && total > 0 && paymentMode) {
        const payRow = await tx.invoicePayment.create({
          data: {
            invoiceId: createdInvoice.id,
            amount: new Prisma.Decimal(total),
            paymentModeId: paymentMode.id,
            received_on: new Date(),
            notes: `POS Checkout ${receiptNumber} (${paymentMethod})`,
            received_by: userId,
            currencyCode: 'UZS',
            exchangeRate: new Prisma.Decimal(1),
          },
        });

        await postInvoicePayment(tx as any, {
          userId,
          invoiceId: createdInvoice.id,
          paymentId: payRow.id,
          date: new Date(),
          amount: total.toString(),
          paymentModeSlug,
        });
      }

      // 3. Post COGS (Dr COGS / Cr INVENTORY)
      if (totalCogs.greaterThan(0)) {
        await postSaleCogs(tx as any, {
          userId,
          invoiceId: createdInvoice.id,
          date: new Date(),
          cost: totalCogs.toString(),
        });
      }

      return formatReceiptResponse(createdReceipt, company);

    });

    // Record used marking codes as SOLD
    for (const item of items) {
      const anyItem = item as any;
      const markingCodesToCheck: string[] = [];
      if (anyItem.markingCode) markingCodesToCheck.push(anyItem.markingCode);
      if (Array.isArray(anyItem.markingCodes)) markingCodesToCheck.push(...anyItem.markingCodes);
      for (const code of markingCodesToCheck) {
        recordMarkingCodeSold(userId, code, (result as any)?.receiptId, item.id);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Savdo muvaffaqiyatli amalga oshirildi!',
      data: result,
    });
  } catch (err: any) {
    if (handleUnauthorized(res, err)) return;
    console.error('posCheckout error:', err);
    const statusCode = err?.statusCode || (err?.message?.includes('yetarli qoldiq mavjud emas') || err?.message?.includes('topilmadi') ? 400 : 500);
    res.status(statusCode).json({
      success: false,
      message: err?.message || 'Savdoni yakunlashda xatolik yuz berdi. Tranzaksiya bekor qilindi.',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function getPosReceipt(req: Request, res: Response): Promise<void> {
  try {
    const userId = requireUserId(req);
    const { receiptId } = req.params;

    const receipt = await prisma.posReceipt.findFirst({
      where: {
        userId,
        OR: [{ id: receiptId }, { receiptNumber: receiptId }],
      },
    });

    if (!receipt) {
      res.status(404).json({ success: false, message: 'Chek topilmadi' });
      return;
    }

    const company = await prisma.companySettings.findFirst({ where: { userId } });
    res.json({ success: true, data: formatReceiptResponse(receipt, company) });
  } catch (err) {
    if (handleUnauthorized(res, err)) return;
    console.error('getPosReceipt error:', err);
    res.status(500).json({ success: false, message: 'Chekni yuklashda xatolik' });
  }
}
