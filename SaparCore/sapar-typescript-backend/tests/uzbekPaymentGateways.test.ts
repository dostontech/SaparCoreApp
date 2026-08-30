import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockInvoiceFindUnique, mockPaymentTransactionFindUnique } = vi.hoisted(() => ({
  mockInvoiceFindUnique: vi.fn(),
  mockPaymentTransactionFindUnique: vi.fn(),
}));

vi.mock('../lib/prisma', () => ({
  prisma: {
    invoice: { findUnique: mockInvoiceFindUnique },
    paymentTransaction: { findUnique: mockPaymentTransactionFindUnique },
    gatewayConfig: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

import { handlePaymeWebhook, handleClickPrepare, handleClickComplete } from '../controllers/uzbekPaymentGatewaysController';

describe('Uzbekistan Native Payment Gateways (Payme & Click)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Payme Business JSON-RPC 2.0 Webhook', () => {
    it('rejects unauthorized requests missing Basic Auth', async () => {
      const req: any = {
        headers: {},
        body: { method: 'CheckPerformTransaction', params: {}, id: 1 },
      };
      let result: any = null;
      const res: any = {
        json: (data: any) => { result = data; return res; },
      };

      await handlePaymeWebhook(req, res);
      expect(result).toEqual({ error: { code: -32504, message: 'Unauthorized' }, id: 1 });
    });

    it('returns method not found for unknown RPC methods', async () => {
      const req: any = {
        headers: { authorization: 'Basic ' + Buffer.from('Paycom:test_secret_key').toString('base64') },
        body: { method: 'UnknownMethod', params: {}, id: 10 },
      };
      let result: any = null;
      const res: any = {
        json: (data: any) => { result = data; return res; },
      };

      await handlePaymeWebhook(req, res);
      expect(result).toEqual({ error: { code: -32601, message: 'Method not found' }, id: 10 });
    });
  });

  describe('Click Merchant Webhooks', () => {
    it('handleClickPrepare handles missing invoice gracefully', async () => {
      mockInvoiceFindUnique.mockResolvedValue(null);

      const req: any = {
        body: {
          click_trans_id: 12345,
          service_id: 32918,
          merchant_trans_id: 'non-existent-invoice-id',
          amount: 500000,
          action: 0,
          sign_time: '2026-08-25 12:00:00',
          sign_string: 'dummy',
        },
      };
      let result: any = null;
      const res: any = {
        json: (data: any) => { result = data; return res; },
      };

      await handleClickPrepare(req, res);
      expect(result).toHaveProperty('error', -5);
      expect(result).toHaveProperty('error_note', 'User/Invoice not found');
    });

    it('handleClickComplete rejects cancelled transactions', async () => {
      const req: any = {
        body: {
          click_trans_id: 12345,
          merchant_trans_id: 'inv-1',
          merchant_prepare_id: 'prep-1',
          amount: 500000,
          error: -1,
        },
      };
      let result: any = null;
      const res: any = {
        json: (data: any) => { result = data; return res; },
      };

      await handleClickComplete(req, res);
      expect(result).toHaveProperty('error', -1);
      expect(result).toHaveProperty('error_note', 'Transaction cancelled');
    });
  });
});
