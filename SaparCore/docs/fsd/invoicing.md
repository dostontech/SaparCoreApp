# FSD — Invoicing & Sales

**Module slug:** `invoicing`
**File:** `docs/fsd/invoicing.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Invoicing & Sales module covers the complete customer-facing revenue cycle:

- **Invoices** — standard and proforma, with multi-currency, digital signatures, and public payment links
- **Quotations (Tijorat takliflari)** — commercial proposals that convert to invoices
- **Credit Notes (Qaytarish aktlari)** — customer returns and overcharge corrections
- **Delivery Challans (Yukxatlar / TTN)** — transport waybills for goods delivery
- **Recurring Invoices** — schedule-driven auto-generation of repeating invoices
- **Payment Collection** — invoice payment recording, partial payments, void
- **Account Credits** — per-customer credit balance (goodwill/promo) redeemable against invoices
- **Reminders** — automatic and manual payment reminders via email/WhatsApp

**Regional scope:** Uzbekistan. Invoices carry 12% QQS (VAT). `TaxTreatment` enum covers STANDARD, ZERO_RATED, EXEMPT, REVERSE_CHARGE, OUT_OF_SCOPE. UZS is the primary currency; multi-currency (USD, EUR, RUB) supported with per-document exchange rates.

---

## 2. Data Model — Main Entities

### 2.1 Invoice

```prisma
model Invoice {
  id                String         @id @default(uuid())
  invoiceNumber     String?        @unique   // INV-NNNNNN
  customerId        String?        // legacy FK
  contactId         String?        // unified contact FK
  billToContactId   String?
  invoiceDate       DateTime
  dueDate           DateTime?
  referenceNo       String?
  items             Json?          // line items array
  status            InvoiceStatus  // DRAFT|UNPAID|SENT|PAID|OVERDUE|CANCELLED|PARTIALLY_PAID
  taxableAmount     Decimal        @db.Decimal(18,4)
  TotalAmount       Decimal        @db.Decimal(18,4)
  vat               Decimal?       @db.Decimal(18,4)
  totalDiscount     Decimal?       @db.Decimal(18,4)
  taxTreatment      TaxTreatment?
  reverseCharge     Boolean?       @default(false)
  roundOff          Boolean        @default(false)
  bankId            String?
  isRecurring       Boolean        @default(false)
  recurringScheduleId String?
  sign_type         SignType        // none | digitalSignature | eSignature
  signatureId       String?
  invoiceType       InvoiceType    // INVOICE | PROFORMA
  publicViewToken   String?        @unique
  publicViewEnabled Boolean        @default(false)
  paymentOptions    Json?          // [{name, url}] payment link buttons
  approvalStatus    ApprovalStatus // NOT_REQUIRED|PENDING|APPROVED|REJECTED
  currencyCode      String?
  exchangeRate      Decimal?       @db.Decimal(18,8)
  costCenterId      String?
  projectId         String?
  vehicleId         String?
}
```

**Line items** (`items` JSON field) structure:
```json
[{
  "productId": "uuid",
  "name": "Product Name",
  "description": "...",
  "quantity": 10,
  "rate": 150000,
  "discount": 0,
  "discountType": "Fixed",
  "taxRateId": "uuid",
  "taxPercent": 12,
  "taxAmount": 180000,
  "amount": 1500000
}]
```

### 2.2 InvoicePayment

```prisma
model InvoicePayment {
  id               String      @id @default(uuid())
  invoiceId        String
  amount           Decimal     @db.Decimal(18,4)
  paymentModeId    String
  bankId           String?
  received_on      DateTime
  notes            String?
  received_by      String      // user FK
  currencyCode     String?
  exchangeRate     Decimal?    @db.Decimal(18,8)
  reference        String?
  movedBankBalance Boolean     @default(false)
  isVoided         Boolean     @default(false)
  voidedById       String?
  voidedAt         DateTime?
  voidReason       String?
}
```

### 2.3 RecurringInvoiceSchedule

```prisma
model RecurringInvoiceSchedule {
  id               String                  @id
  userId           String
  contactId        String?
  currencyCode     String?
  taxTreatment     TaxTreatment?
  items            Json
  taxableAmount    Decimal                 @db.Decimal(18,4)
  TotalAmount      Decimal                 @db.Decimal(18,4)
  repeatEvery      RecurrenceFrequency     // day|week|month|year|custom
  customIntervalNumber Int?
  customIntervalType   RecurrenceCustomIntervalType?
  startOn          DateTime
  endsOn           DateTime?
  neverExpire      Boolean                 @default(false)
  maxOccurrences   Int?
  status           RecurringScheduleStatus // DRAFT|ACTIVE|PAUSED|ENDED|COMPLETED
  nextRunDate      DateTime?
  lastRunDate      DateTime?
  occurrencesCount Int                     @default(0)
}
```

### 2.4 Quotation / CreditNote / DeliveryChallan

Similar structure to Invoice — `items` JSON, party FKs, status enum, signature, public token. See `schema.prisma` lines 1421–1182.

### 2.5 Reminder

```prisma
model Reminder {
  id           String         @id
  name         String
  type         ReminderType   // automatic|manual|automatic_Purchase|...
  remindDays   Int?
  remindTiming ReminderTiming // before|after|duedate
  remindEvent  ReminderEvent  // due_date|invoice_date|payment_date|...
  isEnabled    Boolean        @default(true)
  emailConfig  Json           // {to, cc, subject, body template}
  targetInvoice   String?
  targetQuotation String?
  targetCustomer  String?
  status          ReminderStatus // active|inactive|archived
  lastSent        DateTime?
  nextSend        DateTime?
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Invoices

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/invoices` | `transactionReportController.ts` + customer controller |
| `POST` | `/admin/invoices` | (in `adminRoutes.js`) |
| `GET` | `/admin/invoices/:id` | |
| `PUT` | `/admin/invoices/:id` | |
| `DELETE` | `/admin/invoices/:id` | |
| `POST` | `/admin/invoices/:id/send` | email send |
| `POST` | `/admin/invoices/:id/payments` | record payment |
| `DELETE` | `/admin/invoices/:id/payments/:paymentId` | void payment |
| `POST` | `/admin/invoices/:id/clone` | |
| `GET` | `/public/invoice/:token` | `publicRoutes.ts` — public view |
| `POST` | `/public/invoice/:token/pay` | online payment initiation |

#### Quotations

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/quotations` | |
| `PUT/DELETE` | `/admin/quotations/:id` | |
| `POST` | `/admin/quotations/:id/convert` | convert to Invoice/PO |
| `GET` | `/public/quotation/:token` | public view |

#### Credit Notes

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/credit-notes` | |
| `PUT/DELETE` | `/admin/credit-notes/:id` | |
| `POST` | `/admin/credit-notes/:id/apply` | apply to invoice |

#### Delivery Challans

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/delivery-challans` | |
| `PUT` | `/admin/delivery-challans/:id/status` | PENDING→DELIVERED |

#### Recurring Schedules

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/recurring-invoices` | `recurringScheduleController.ts` |
| `PUT/DELETE` | `/admin/recurring-invoices/:id` | |
| `POST` | `/admin/recurring-invoices/:id/pause` | |
| `POST` | `/admin/recurring-invoices/:id/resume` | |

#### Reminders

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/reminders` | `reminderController.ts` |
| `PUT/DELETE` | `/admin/reminders/:id` | |
| `POST` | `/admin/reminders/:id/send-now` | manual trigger |

### 3.2 Business Logic

**Invoice status machine:**
```
DRAFT → UNPAID (on send)
UNPAID → PARTIALLY_PAID (partial payment recorded)
UNPAID / PARTIALLY_PAID → PAID (full payment)
UNPAID / PARTIALLY_PAID → OVERDUE (cron: dueDate passed)
Any → CANCELLED
```

**GL posting on invoice creation:**
```
Dr ACCOUNTS_RECEIVABLE   = TotalAmount (incl. VAT)
  Cr INCOME/SALES account  = taxableAmount
  Cr VAT_OUTPUT account    = vat
```

**GL on payment received:**
```
Dr BANK / CASH           = payment amount
  Cr ACCOUNTS_RECEIVABLE   = payment amount
```

**Recurring invoice cron** (`recurringInvoicesCron.ts`): Runs on schedule, queries `RecurringInvoiceSchedule` where `status = ACTIVE AND nextRunDate <= NOW`. Generates child `Invoice` records, updates `occurrencesCount`, sets `nextRunDate`.

**Public invoice view:** `publicRoutes.ts` serves invoice data by `publicViewToken` without authentication. Enables "Pay Now" button linked to Stripe/Razorpay/offline payment gateways.

**Account credit redemption:** During payment recording, if `contactId` has an `AccountCreditEntry` balance, the payment modal allows applying credit. On redemption, creates `AccountCreditEntry{type: REDEMPTION}` and offsets the payment amount.

**Quotation conversion:** `convert_type` field drives the target: `quotation → invoice`, `quotation → purchase`, `purchase_order → purchase`.

### 3.3 Validation Rules

- Invoice `items` must have at least one line
- `dueDate >= invoiceDate`
- Payment amount must be `> 0` and `<= remainingBalance`
- Cannot void a payment on a PAID or CANCELLED invoice without reversing status
- Credit note must reference a valid invoice in the same tenant
- Recurring schedule `startOn` must be a future date when creating
- `publicViewEnabled = true` requires `publicViewToken` to be set (auto-generated)

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Invoice List | `pages/admin/invoices/InvoiceList.tsx` | `/admin/invoices` |
| Create Invoice | `pages/admin/invoices/CreateInvoice.tsx` | `/admin/invoices/new` |
| Edit Invoice | `pages/admin/invoices/EditInvoice.tsx` | `/admin/invoices/:id/edit` |
| View Invoice | `pages/admin/invoices/ViewInvoice.tsx` | `/admin/invoices/:id` |
| Email Invoice | `pages/admin/invoices/EmailInvoice.tsx` | `/admin/invoices/:id/email` |
| Invoice Payment Modal | `pages/admin/invoices/InvoicePaymentModal.tsx` | Modal |
| Invoice Template List | `pages/admin/invoices/InvoiceTemplateList.tsx` | `/admin/invoice-templates` |
| Template A / A5 / B | `InvoiceTemplateA.tsx` / `A5Landscape` / `TemplateB.tsx` | Print views |
| Quotation List | `pages/admin/quotations/` | `/admin/quotations` |
| Credit Notes | `pages/admin/credit-notes/` | `/admin/credit-notes` |
| Delivery Challans | `pages/admin/delivery-challan/` | `/admin/delivery-challans` |
| Recurring Invoices | `pages/admin/recurring-invoices/` | `/admin/recurring-invoices` |

### 4.2 User Flows

**Create Invoice:**
1. Invoices → New Invoice
2. Select contact (type-ahead), set invoice date, due date
3. Add line items: product picker (with stock/rate/image toggles per CompanySettings)
4. Tax treatment selector (STANDARD 12% QQS / ZERO_RATED / EXEMPT / REVERSE_CHARGE)
5. Discount (Fixed or %) per line or document-level round-off
6. Set currency + exchange rate if not UZS
7. Attach signature (drawn or uploaded), add bank details, notes, T&C
8. Toggle "Public View" → system generates `publicViewToken`
9. Save as DRAFT or "Send" → status → UNPAID + email sent

**Record Payment:**
1. Invoice view → "To'lov qabul qilish" (Record Payment)
2. Enter amount, payment mode (Cash/Bank/Uzcard/Humo), bank account, reference
3. If contact has account credit balance → "Apply Credit" toggle shown
4. Save → GL journal posted, invoice status updated

### 4.3 Key Components

- `CreateInvoice.tsx` (86 KB): Largest frontend file. Full invoice creation with product picker, tax computation, multi-currency, signature panel, payment options.
- `EditInvoice.tsx` (118 KB): Edit version of same — adds version history diff.
- `InvoiceTemplateA.tsx` (17 KB): Print-ready A4 invoice layout with company logo, QR code, Uzbek/Russian/English translation support.
- `InvoicePaymentModal.tsx` (18 KB): Payment recording modal with account credit redemption support.

---

## 5. Integrations

- **E-IMZO:** Invoice can be converted to an E-Faktura (signed electronic invoice) via `eDocumentController.ts`. The PKCS#7 signature is attached and the document submitted to the counterparty.
- **E-Faktura / Didox:** `eDocumentController.ts` generates Uzbekistan-standard E-Faktura structure with MXIK codes, QQS amounts, seller/buyer TINs (STIR).
- **WhatsApp:** `reminderController.ts` + `whatsappController.ts` send payment reminders via WhatsApp Business API to contact mobile number.
- **Stripe / Razorpay:** `stripeController.ts` / `razorpayController.ts` handle online payment via public invoice token. Uzbekistan-specific gateways (Payme/Click) handled separately.
- **Accounting GL:** All invoice and payment events auto-post to GL.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **`items` is JSON, not normalized rows** | 🟡 Medium | Line items are stored as a JSON blob. Not queryable for analytics (e.g. "top selling products by revenue"). Needs normalized `InvoiceLineItem` table. |
| 2 | **`invoiceNumber` is nullable** | 🟡 Medium | Schema comment says "TODO 0.1c: app-generated INV-NNNNNN". Number generation is partially implemented via `Counter` model but may be inconsistent. |
| 3 | **OVERDUE status not auto-set** | 🟡 Medium | `invoiceReminderCron.ts` sends reminders but does not update `Invoice.status` to OVERDUE. Frontend may compute this client-side. |
| 4 | **Quotation → Invoice conversion loses line edits** | 🟢 Low | `convert_type` drives the flow but edits to the converted document may not propagate back to the quotation. |
| 5 | **No Uzbekistan-specific invoice number format** | 🟢 Low | Official Uzbekistan tax invoices require a specific numbering format. Current `INV-NNNNNN` format may not comply. |
| 6 | **Delivery Challan not linked to E-Faktura** | 🟡 Medium | Yukxat (waybill) should be electronically attached to the E-Faktura per Uzbekistan tax regulations but the two flows are separate. |
