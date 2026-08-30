# Invoicing & Sales (Hisob-faktura va Savdo) — QA Test Suite Specification

**Target Module:** `invoicing`  
**FSD Reference:** `docs/fsd/invoicing.md`  
**Target Market:** Uzbekistan & Central Asia (UZS, 12% QQS/VAT, MXIK/IKPU, E-Faktura, Public Share Links)  

---

## 📋 Test Matrix Overview

| Suite | Category | Scope / Area Covered | Case Count |
| :--- | :--- | :--- | :---: |
| **Suite 01** | Invoice Creation & QQS | Line items, 12% QQS, Tax Treatments (STANDARD, EXEMPT, ZERO_RATED), Discounts | `TC-INV-001` – `TC-INV-005` |
| **Suite 02** | Multi-Currency Invoices | USD/EUR invoices, per-document exchange rates, base UZS conversion | `TC-INV-006` – `TC-INV-009` |
| **Suite 03** | Payments & AR Settle | Partial payment, Full payment, Voiding payment, Overpayment guard | `TC-INV-010` – `TC-INV-014` |
| **Suite 04** | Account Credits | Customer goodwill credit balance issuance, checkout redemption offset | `TC-INV-015` – `TC-INV-018` |
| **Suite 05** | Quotations (Tijorat Taklifi) | Commercial proposal creation, client approval, conversion to Invoice | `TC-INV-019` – `TC-INV-022` |
| **Suite 06** | Credit Notes (Qaytarish) | Customer returns, invoice balance reduction, AR offset | `TC-INV-023` – `TC-INV-026` |
| **Suite 07** | Delivery Challans (Yukxat) | Transport waybills (TTN), goods delivery status transitions (Pending $\to$ Delivered) | `TC-INV-027` – `TC-INV-030` |
| **Suite 08** | Recurring Invoices | Recurring schedules (monthly/weekly), auto-generation cron runner | `TC-INV-031` – `TC-INV-034` |
| **Suite 09** | Public Links & Pay-Now | Token-based public view link (no auth required), payment gateway buttons | `TC-INV-035` – `TC-INV-038` |
| **Suite 10** | Digital Signatures & EDI | E-IMZO signature attachment, MXIK codes, E-Faktura readiness | `TC-INV-039` – `TC-INV-042` |

---

## 🧾 Suite 01: Invoice Creation, QQS 12% & Tax Treatments

### `TC-INV-001` — Standard Invoice Creation with 12% QQS
- **Preconditions**: In-stock products with active pricing.
- **Steps**:
  1. Send `POST /api/admin/invoices` with items totaling 1,000,000 UZS (`taxTreatment: "STANDARD"`).
- **Expected Result**:
  - `taxableAmount: 892,857.14 UZS`, `vat: 107,142.86 UZS`, `TotalAmount: 1,000,000.00 UZS`.
  - Status is `UNPAID` (or `DRAFT`).
  - GL auto-posts: `Dr 1100 AR 1,000,000 / Cr 4001 Sales Revenue 892,857.14 & Cr 2100 VAT Output 107,142.86`.

### `TC-INV-002` — Tax-Exempt & Zero-Rated Invoices
- **Preconditions**: IT Park or export client.
- **Steps**:
  1. Create invoice with `taxTreatment: "EXEMPT"` or `"ZERO_RATED"`.
- **Expected Result**: `vat: 0.00 UZS`, `taxableAmount === TotalAmount`, no credit to `2100 VAT Output`.

### `TC-INV-003` — Empty Cart Rejection Guard
- **Preconditions**: Authenticated tenant.
- **Steps**:
  1. Send `POST /api/admin/invoices` with `items: []`.
- **Expected Result**: Rejected with `400 Bad Request` ("Invoice must contain at least one item").

### `TC-INV-004` — Due Date Validation Guard (`dueDate >= invoiceDate`)
- **Preconditions**: Authenticated tenant.
- **Steps**:
  1. Send `POST /api/admin/invoices` with `invoiceDate: "2026-08-20"`, `dueDate: "2026-08-10"`.
- **Expected Result**: Rejected or normalized so due date cannot precede invoice creation date.

### `TC-INV-005` — Item-Level and Document-Level Discount Application
- **Preconditions**: Product with rate 100,000 UZS.
- **Steps**:
  1. Add item with 10% discount (`discount: 10, discountType: "Percentage"`).
  2. Add document round-off / fixed discount of 5,000 UZS.
- **Expected Result**: Total correctly calculates `(100,000 - 10,000) - 5,000 = 85,000 UZS`.

---

## 💱 Suite 02: Multi-Currency Invoicing (USD, EUR, RUB)

### `TC-INV-006` — Foreign Currency Invoice ($100 USD @ 12,800 UZS)
- **Preconditions**: USD currency configured.
- **Steps**:
  1. Create invoice with `currencyCode: "USD"`, `exchangeRate: 12800`, Total: $100.
- **Expected Result**: Document stores $100; General Ledger posts base AR `1,280,000 UZS`.

### `TC-INV-007` — Invalid / Non-Positive Exchange Rate Rejection
- **Preconditions**: Foreign currency invoice.
- **Steps**:
  1. Send `POST /api/admin/invoices` with `currencyCode: "USD"`, `exchangeRate: -12800` or `0`.
- **Expected Result**: Rejected with `400 Bad Request` or defaulted safely to positive rate.

---

## 💳 Suite 03: Payment Collection & AR Settlement Lifecycle

### `TC-INV-008` — Partial Payment Collection (`UNPAID` $\to$ `PARTIALLY_PAID`)
- **Preconditions**: Invoice for 1,000,000 UZS in `UNPAID` status.
- **Steps**:
  1. Send `POST /api/admin/invoices/:id/payments` with `amount: 400000` (400,000 UZS).
- **Expected Result**:
  - `InvoicePayment` row created for 400,000 UZS.
  - `Invoice.status` changes to `PARTIALLY_PAID`.
  - GL auto-posts: `Dr 1001 Cash / Cr 1100 AR 400,000 UZS`.

### `TC-INV-009` — Final Balance Settlement (`PARTIALLY_PAID` $\to$ `PAID`)
- **Preconditions**: Invoice with 600,000 UZS remaining balance.
- **Steps**:
  1. Send `POST /api/admin/invoices/:id/payments` with `amount: 600000`.
- **Expected Result**:
  - `Invoice.status` transitions to `PAID`.
  - Remaining unpaid balance is exactly 0.

### `TC-INV-010` — Overpayment Hard Guard
- **Preconditions**: Invoice with 600,000 UZS remaining balance.
- **Steps**:
  1. Attempt to record payment for 700,000 UZS.
- **Expected Result**: Rejected with `400 Bad Request` ("Payment amount exceeds remaining unpaid balance").

### `TC-INV-011` — Void Payment & Status Reversion
- **Preconditions**: Paid invoice.
- **Steps**:
  1. Send `DELETE /api/admin/invoices/:id/payments/:paymentId`.
- **Expected Result**:
  - `InvoicePayment` marked `isVoided = true`.
  - `Invoice.status` reverts from `PAID` back to `PARTIALLY_PAID` or `UNPAID`.
  - Reversal GL entry posted.

---

## 🎁 Suite 04: Customer Account Credits

### `TC-INV-012` — Issue Customer Goodwill Credit Balance
- **Preconditions**: Existing customer contact.
- **Steps**:
  1. Issue customer credit entry for 150,000 UZS.
- **Expected Result**: Customer credit ledger shows available balance = 150,000 UZS.

### `TC-INV-013` — Redeem Account Credit Against Invoice Payment
- **Preconditions**: Customer with 150,000 UZS credit; Invoice for 200,000 UZS.
- **Steps**:
  1. Record payment with `paymentModeSlug: "account-credit"` for 150,000 UZS.
- **Expected Result**:
  - Customer available credit balance drops to 0.
  - Invoice balance decreases by 150,000 UZS.
  - GL posts: `Dr 2200 Customer Credit (Liability) / Cr 1100 AR 150,000 UZS`.

---

## 📄 Suite 05: Quotations (Tijorat Takliflari) & Conversion

### `TC-INV-014` — Quotation Creation & Line Item Persistence
- **Preconditions**: Authenticated user.
- **Steps**:
  1. Send `POST /api/admin/quotations` with 3 products.
- **Expected Result**: Quotation created with status `DRAFT`/`SENT` and unique quotation number (`QT-NNNNNN`).

### `TC-INV-015` — Convert Quotation to Official Invoice
- **Preconditions**: Active quotation.
- **Steps**:
  1. Send `POST /api/admin/quotations/:id/convert` with `convert_type: "invoice"`.
- **Expected Result**:
  - New `Invoice` created with matching line items, prices, and customer.
  - Quotation status transitions to `ACCEPTED` / `CONVERTED`.

---

## 🔄 Suite 06: Recurring Invoices Automation

### `TC-INV-016` — Create Recurring Invoice Schedule
- **Preconditions**: Recurring client service (e.g. Monthly Retainer).
- **Steps**:
  1. Send `POST /api/admin/recurring-invoices` with `repeatEvery: "month"`, `startOn: "2026-09-01"`.
- **Expected Result**: Schedule created with `status: "ACTIVE"`, `occurrencesCount: 0`.

### `TC-INV-017` — Recurring Schedule Execution (Cron Generation)
- **Preconditions**: Active schedule where `nextRunDate <= NOW`.
- **Steps**:
  1. Trigger recurring invoice processing engine.
- **Expected Result**:
  - Automatically generates child `Invoice` record.
  - Increments `occurrencesCount` by 1.
  - Calculates and updates `nextRunDate` for the following month.

---

## 🌐 Suite 07: Public Invoice Link Sharing

### `TC-INV-018` — Public View Token Resolution (No Auth Required)
- **Preconditions**: Invoice with `publicViewEnabled = true`.
- **Steps**:
  1. Send unauthenticated `GET /api/public/invoice/:token`.
- **Expected Result**: Returns invoice details, items, company branding, and payment options without requiring JWT header.
