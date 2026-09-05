# FSD — Uzbekistan Payment Gateways

**Module slug:** `uz-payments`
**File:** `docs/fsd/uz-payments.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Uzbekistan Payment Gateways module provides configuration and integration stubs for the national and regional payment processors:

| Gateway | Type | Coverage |
|---|---|---|
| **UzQR** | Unified National QR | Mandatory from 1 July 2026 (All Banks & PSPs in Uzbekistan) |
| **Payme Business** | QR / Online | Uzbekistan-wide consumer and B2B |
| **Click Merchant** | QR / Online | Uzbekistan-wide consumer |
| **Uzum Pay** (formerly Apelsin) | QR / Wallet | Uzbekistan-wide |
| **Uzcard / Humo** | Card (split-tender) | Recorded at POS checkout only |
| **Direct Bank API** | Statement import | Ipak Yo'li, Anorbank, Kapitalbank, Agrobank |

**Scope:** Gateway settings UI, credential storage, UzQR national unified QR generator, POS terminal QR checkout, public invoice QR viewer, and webhook/status polling endpoints.

**Regional scope:** Pure Uzbekistan module. All gateways and UzQR transactions are UZS-only (currency code 860).

---

## 2. Data Model

### 2.1 UzbekPaymentGateway (in settings)

No dedicated Prisma model exists. Gateway credentials are stored within `CompanySettings` as JSON fields or in separate config models (not visible in the schema). `uzbekPaymentGatewaysController.ts` manages config through a settings pattern.

Likely structure (inferred from controller):
```typescript
interface UzPayGatewayConfig {
  gateway: 'PAYME' | 'CLICK' | 'UZUM';
  merchantId: string;
  secretKey: string;       // encrypted at rest (not visible in schema)
  isActive: boolean;
  testMode: boolean;
  webhookUrl: string;      // auto-generated: /webhooks/payme | /webhooks/click | /webhooks/uzum
}
```

### 2.2 PosShift.qrSales (in-memory)

QR payment totals per shift are tracked in `PosShift.qrSales` (see `pos.md`). No breakdown by gateway (Payme vs Click vs Uzum).

---

## 3. Backend

### 3.1 API Endpoints

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/settings/uz-payments` | `uzbekPaymentGatewaysController.ts::getGatewayConfigs` |
| `POST` | `/admin/settings/uz-payments` | `uzbekPaymentGatewaysController.ts::upsertGatewayConfig` |
| `DELETE` | `/admin/settings/uz-payments/:gateway` | `uzbekPaymentGatewaysController.ts::deleteGatewayConfig` |
| `POST` | `/admin/settings/uz-payments/:gateway/test` | `uzbekPaymentGatewaysController.ts::testGatewayConnection` |
| `POST` | `/webhooks/payme` | Payme webhook handler (stub) |
| `POST` | `/webhooks/click` | Click webhook handler (stub) |
| `POST` | `/webhooks/uzum` | Uzum webhook handler (stub) |

### 3.2 Business Logic

**Payme Business integration design (planned):**
1. Invoice payment → generate Payme payment URL: `https://checkout.paycom.uz/{base64(m=MERCHANT_ID;ac.order_id=INV-ID;a=AMOUNT;l=uz)}`
2. Customer pays → Payme sends webhook to `/webhooks/payme`
3. Webhook handler verifies HMAC signature using `secretKey`
4. If payment confirmed → `POST /admin/invoices/:id/payments` with `paymentModeId = payme`

**Click Merchant integration design (planned):**
1. Invoice payment → generate Click payment URL: `https://my.click.uz/services/pay?service_id=XXXXX&merchant_id=XXXXXX&amount=AMOUNT&transaction_param=INV-ID`
2. Click sends `prepare` + `complete` webhook sequence
3. HMAC verification → invoice payment recorded

**Uzum Pay integration design (planned):**
Similar pattern to Payme with Uzum's API endpoints.

**Current implementation:** `testGatewayConnection` returns a mock success response. No actual API call to Payme/Click/Uzum servers is made.

### 3.3 Public Invoice Payment Flow

`publicRoutes.ts` exposes:
```
GET  /public/invoice/:token         — public invoice view
POST /public/invoice/:token/pay     — initiate payment
```

`POST /public/invoice/:token/pay` accepts `{gateway: 'PAYME' | 'CLICK' | 'UZUM', ...}` and is intended to redirect to the gateway checkout URL. Currently returns a stub URL.

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Payment Gateway Settings | `pages/admin/settings/UzPaymentGatewaysPage.tsx` | `/admin/settings/uz-payments` |

### 4.2 User Flow

**Configure Payme:**
1. Settings → Payment Gateways → Payme Business section
2. Enter Merchant ID + Secret Key
3. Toggle Test Mode on/off
4. "Saqlash" (Save) → credentials stored
5. "Test ulanishi" (Test Connection) → stub response confirms config

**Invoice Payment via Payme (planned UX):**
1. Customer opens public invoice URL
2. Clicks "Payme orqali to'lash" button
3. Redirected to Payme checkout with pre-filled amount in UZS
4. Payment confirmed → webhook fires → invoice marked paid automatically

### 4.3 Key Components

- `UzPaymentGatewaysPage.tsx` (8 KB): Card-based UI with one card per gateway. Credential input fields, test mode toggle, status badge (Active/Inactive), test connection button.

---

## 5. Integrations

- **POS checkout:** `posController.ts::posCheckout` accepts `qrAmount` field for QR payments. No actual gateway call at checkout time.
- **Public invoice view:** Payment buttons on the public invoice link to gateway checkout URLs (currently stub).
- **Banking:** Successful gateway payments should create `BankTransaction` rows in the gateway's designated bank account. Not implemented.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **All gateway integrations are stubs** | 🔴 Critical | No real Payme/Click/Uzum API calls. Payment initiation URLs are not generated. Webhook handlers are empty stubs. |
| 2 | **Webhook HMAC verification not implemented** | 🔴 Critical | Incoming gateway webhooks have no signature verification. Any POST to `/webhooks/payme` would be accepted as valid. Security risk. |
| 3 | **No gateway credentials encryption** | 🔴 Critical | If credentials are stored in the database, they must be encrypted at rest. No encryption visible in the codebase. |
| 4 | **No per-gateway bank account mapping** | 🟡 Medium | Payme settlements should credit a specific bank account. No mapping between gateway and `BankDetail` exists. |
| 5 | **POS QR payment amounts not split by gateway** | 🟡 Medium | `PosShift.qrSales` is an aggregate of all QR methods. No breakdown by Payme vs Click vs Uzum. |
| 6 | **Direct bank API (Ipak Yo'li, Anorbank) not implemented** | 🟡 Medium | AGENTS.md lists these. Controller stubs exist in `uzbekPaymentGatewaysController.ts` but no actual bank OAuth2 or API calls. |
