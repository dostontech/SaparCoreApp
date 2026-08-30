# FSD — Point of Sale (POS)

**Module slug:** `pos`
**File:** `docs/fsd/pos.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The POS module provides a dedicated touch-screen retail cashier terminal for Uzbekistan brick-and-mortar operations:

- **Fast product search** by name, SKU, or barcode scan
- **Cart management** with quantity and discount controls
- **Split-tender checkout** — Naqd pul (Cash), Uzcard, Humo, Payme/Click QR, Nasiya (Credit tab)
- **Cashier shift management** — Opening float, mid-shift X-Report (intermediate check), end-of-day Z-Report (closing reconciliation)
- **Uzbekistan fiscal receipts** — structured for 58mm/80mm thermal printers, includes company TIN (STIR) and Soliq.uz QR verification code
- **Real-time inventory deduction** from the product catalogue

**Regional scope:** Uzbekistan. Payment methods are Uzbekistan-specific (Uzcard national debit card, Humo national payment system, Payme/Click QR). Receipts include `fiscal_number` and Soliq.uz QR URL for tax compliance.

---

## 2. Data Model

### 2.1 Product (Prisma — existing)

POS reads products from the `Product` Prisma model. Key fields used:
```
Product.name, Product.code (SKU), Product.barcode, Product.selling_price,
Product.openingStock (via Inventory.quantityOnHand), Product.category,
(Product as any).mxikCode   ← NOT in schema — critical gap
(Product as any).sku        ← NOT in schema (uses 'code' field)
```

### 2.2 POS Shift (in-memory, NOT persisted)

```typescript
interface PosShift {
  id: string;               // SHIFT-{timestamp}
  userId: string;           // tenant
  cashierName: string;
  openedAt: string;         // ISO timestamp
  closedAt?: string;
  openingCash: number;      // UZS
  closingCash?: number;
  totalSales: number;       // UZS, all methods combined
  cashSales: number;
  uzcardSales: number;
  humoSales: number;
  qrSales: number;          // Payme / Click QR
  creditSales: number;      // Nasiya (credit tab)
  totalTransactions: number;
  status: 'OPEN' | 'CLOSED';
}
```

### 2.3 POS Receipt (in-memory, NOT persisted)

```typescript
interface Receipt {
  receiptId: string;        // CHK-{timestamp}
  fiscalNumber: string;     // FISC-{random 8 digits}
  qrCodeUrl: string;        // https://soliq.uz/check?tin=...&fiscal=...
  company: { name, tin, address }
  customer: { name, id }
  items: Array<{ id, name, quantity, price }>
  subtotal: number;
  discountAmount: number;
  vatAmount: number;        // 12% included VAT extracted (total * 12/112)
  total: number;
  payments: { method, cash, uzcard, humo, qr, credit }
}
```

> **CRITICAL GAP:** Both `PosShift` and the receipt store use process-local in-memory maps (`shiftsStore`, `posReceiptsStore`). All shift and receipt data is lost on server restart. There is no `PosShift` or `PosReceipt` Prisma model.

---

## 3. Backend

### 3.1 API Endpoints

| Method | Path | Controller | Auth |
|--------|------|-----------|------|
| `GET` | `/admin/pos/products` | `posController.ts::getPosProducts` | JWT |
| `GET` | `/admin/pos/shift/current` | `posController.ts::getCurrentShift` | JWT |
| `POST` | `/admin/pos/shift/open` | `posController.ts::openShift` | JWT |
| `POST` | `/admin/pos/shift/close` | `posController.ts::closeShift` | JWT |
| `GET` | `/admin/pos/shift/x-report` | `posController.ts::getXReport` | JWT |
| `POST` | `/admin/pos/checkout` | `posController.ts::posCheckout` | JWT |
| `GET` | `/admin/pos/receipt/:receiptId` | `posController.ts::getPosReceipt` | JWT |

### 3.2 Business Logic

**Product search (`getPosProducts`):**
Queries `prisma.product.findMany` filtered by `userId`, optionally by `categoryId`. Filters client-side by name/SKU/barcode match against the query string. Returns product list with categories for the category filter bar.

**Shift opening (`openShift`):**
- Creates a new `PosShift` in `shiftsStore[userId]`
- Only one open shift per cashier/tenant at a time (previous shift must be closed)
- `openingCash` is the float (opening till amount)

**Checkout (`posCheckout`):**
```
subtotal = Σ(item.quantity × item.price)
total = subtotal - discountAmount
vatAmount = total × 12/112   (reverse-calculate included 12% QQS)
```
- Updates shift accumulators: `totalSales`, `cashSales`, `uzcardSales`, `humoSales`, `qrSales`, `creditSales`
- Creates receipt with `fiscalNumber` and `qrCodeUrl` referencing Soliq.uz verification
- NOTE: Does NOT create an Invoice in the database. Does NOT deduct inventory (critical gap).

**X-Report (mid-shift):**
Returns current shift state without closing it. Shows expected cash in drawer = `openingCash + cashSales`.

**Z-Report (close shift):**
```
expectedCash = openingCash + cashSales
difference = countedCash - expectedCash
differenceStatus = 'TENG' | 'KAMOMAD (-Nsom)' | 'ORTIQCHA (+Nsom)'
```
Marks shift as `CLOSED`. Returns Z-Report structure.

### 3.3 Validation Rules

- `posCheckout`: `items` array must not be empty (400 if empty)
- `openShift`: No validation on `openingCash` sign (could be improved)
- `closeShift`: Requires an active open shift; 400 if none found
- Payment amounts (cash + uzcard + humo + qr + credit) should sum to `total` — NOT validated server-side

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| POS Terminal | `pages/admin/pos/PosTerminalPage.tsx` | `/admin/pos/terminal` |
| POS Shifts | `pages/admin/pos/PosShiftsPage.tsx` | `/admin/pos/shifts` |

### 4.2 User Flows

**Open Shift & Start Selling:**
1. Cashier opens POS Terminal page
2. If no active shift → "Smenani ochish" (Open Shift) dialog: enter cashier name + opening cash float
3. System calls `POST /admin/pos/shift/open`
4. Terminal unlocked → product grid shown

**Product Search & Cart:**
1. Type in search bar (name, SKU, barcode) → products filtered in real-time
2. Click product card or scan barcode → added to cart on right panel
3. Cart shows: product name, quantity stepper, unit price, line total
4. Discount field (per-item or overall) reduces `total`
5. Category tabs at top filter product grid by category

**Checkout (Split Payment):**
1. Click "Hisob-kitob" (Checkout) button
2. Payment panel shows: total amount, payment method toggle (Cash / Uzcard / Humo / QR / Credit)
3. Cashier enters amounts per method (split tender: e.g. 80,000 cash + 20,000 Uzcard)
4. "Tasdiqlash" (Confirm) → `POST /admin/pos/checkout`
5. Receipt modal shown with: receipt ID, fiscal number, Soliq.uz QR code, itemized breakdown
6. Print button triggers browser print dialog for thermal printer

**X-Report (Mid-Shift Check):**
1. POS Terminal header → "X-Hisobot" button
2. Shows current shift totals by payment method without closing

**Z-Report (End of Day):**
1. POS Shifts page → "Smenani yopish" (Close Shift)
2. Cashier counts and enters actual cash in drawer
3. Z-Report displayed: expected vs actual cash, kamomad/ortiqcha (shortage/overage)
4. Shift marked CLOSED; new shift can be opened next day

### 4.3 Key Components

- `PosTerminalPage.tsx` (24 KB): Main touch-optimized UI. Product grid (cards with image, name, price). Right-side cart panel. Payment modal with split-tender inputs. Receipt modal with print trigger.
- `PosShiftsPage.tsx` (20 KB): Shift history table (in-memory, shows current session only). Open/Close shift actions. X-Report and Z-Report views.

---

## 5. Integrations

- **Inventory:** `posController.ts::getPosProducts` reads from `prisma.product` and references `Inventory.quantityOnHand` via `openingStock` alias. However, checkout does NOT call inventory deduction — this is a gap.
- **Soliq.uz Fiscal:** Receipt `qrCodeUrl` is structured as `https://soliq.uz/check?tin=<STIR>&fiscal=<receiptId>`. This is the standard format for Uzbekistan fiscal receipt QR codes, enabling buyers to verify authenticity on the Soliq.uz portal.
- **MXIK codes:** Referenced as `(p as any).mxikCode` in `getPosProducts` — not in schema, must be added for full E-Faktura compliance.
- **Payment Gateways (Payme/Click QR):** `qrAmount` field tracks QR payments but no actual Payme/Click API call is made at checkout. Integration is pending (see `uz-payments.md`).

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Shifts and receipts not persisted** | 🔴 Critical | `shiftsStore` and `posReceiptsStore` are process-local in-memory. All shift/receipt data lost on restart. Need `PosShift` and `PosReceipt` Prisma models and migrations. |
| 2 | **Checkout does not create an Invoice** | 🔴 Critical | Sales are not recorded in `Invoice` or `InvoicePayment` tables. Revenue is not reflected in P&L, AR, or tax reports. Each POS sale must generate a sales Invoice. |
| 3 | **Checkout does not deduct inventory** | 🔴 Critical | `posCheckout` does not call `Inventory.quantityOnHand -= qty`. Stock levels are not updated after a POS sale. |
| 4 | **`mxikCode` not in Prisma schema** | 🔴 Critical | Referenced as `(p as any).mxikCode`. Required for Uzbekistan fiscal receipt compliance (mandatory MXIK/IKPU product code on receipts). Must be added to `Product` model. |
| 5 | **Split-tender amounts not validated** | 🟡 Medium | Sum of (cash + uzcard + humo + qr + credit) is not checked to equal `total`. Cashier could submit unbalanced payment. |
| 6 | **No real Payme/Click QR API call** | 🟡 Medium | `qrAmount` tracks QR sales but no actual QR payment initiation or confirmation. See uz-payments.md. |
| 7 | **No offline resilience** | 🟡 Medium | POS terminal is fully online. If network drops, checkout fails. AGENTS.md roadmap calls for offline resilience. |
| 8 | **Fiscal receipt is mock** | 🟡 Medium | `fiscalNumber` is a random number, not generated by a certified Uzbekistan fiscal device (KKM). Full fiscal compliance requires integration with an approved KKM provider. |
| 9 | **No customer loyalty / points** | 🟢 Low | No loyalty program, points balance, or customer identification at POS. |
