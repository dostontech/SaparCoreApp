# FSD — CRM (Customer Relationship Management)

**Module slug:** `crm`
**File:** `docs/fsd/crm.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The CRM module covers two distinct sub-systems:

| Sub-system | Purpose |
|---|---|
| **Contacts** (Unified Contact Directory) | Single authoritative directory of all counterparties: customers, suppliers, partners. Replaces the legacy split `Customer` + `Supplier` tables with the unified `Contact` model. |
| **Visual Sales Pipeline** | Kanban-style deal tracker with 6 stages (LEAD → WON/LOST), probability scoring, pipeline value aggregation, and win-rate analytics. |

**Regional scope:** Uzbekistan and Central Asia. Contact records hold STIR (9-digit company TIN), PINFL (14-digit personal tax ID), and UZS-first currency default. Deal values are in UZS.

---

## 2. Data Model — Main Entities

### 2.1 Contact (Unified)

```prisma
model Contact {
  id                     String         @id @default(uuid())
  userId                 String                         // tenant scope
  firstName              String?
  lastName               String?
  organisation           String?
  showNameOnInvoice      Boolean        @default(false)
  email                  String?
  billingEmail           String?
  telephone              String?
  mobile                 String?
  addressLine1/2/3       String?
  town                   String?
  region                 String?
  postcode               String?
  countryId              String?
  defaultPaymentTermDays Int?
  invoiceSequencePrefix  String?
  defaultTaxTreatment    TaxTreatment   @default(STANDARD)
  vatRegNumber           String?        // STIR for Uzbek companies
  vatNumber              String?        // EU/UK VAT number
  gstin                  String?        // India GSTIN (legacy)
  country                String?        // ISO country code
  viesValid              Boolean?       // EU VIES VAT check result
  viesCheckedAt          DateTime?
  invoiceLanguage        String?
  currencyCode           String?
  bankDetails            Json?
  notes                  String?
  image                  String?
  status                 ContactStatus  @default(ACTIVE)  // ACTIVE | HIDDEN
  legacyCustomerId       String?        // migration bridge
  legacySupplierId       String?        // migration bridge
  isDeleted              Boolean        @default(false)
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt
}
```

**Back-relations:** Contact is referenced as the party (`contactId` + `billToContactId`) on Invoice, Quotation, CreditNote, DeliveryChallan, Purchase, PurchaseOrder, SupplierPayment, DebitNote, Expense, Vehicle, RecurringInvoiceSchedule, AccountCreditEntry, Reminder.

### 2.2 Legacy Customer / Supplier (still active, migration path)

```prisma
model Customer {
  id             String          // UUID
  name           String
  email          String
  phone          String?
  whatsapp       String?
  status         CustomerStatus  // Active | Inactive
  billingAddress Json?
  shippingAddress Json?
  bankDetails    Json?
  gstin          String?
  currencyCode   String?         // default transaction currency
  userId         String          // tenant
  isDeleted      Boolean
}

model Supplier {
  id             String
  supplier_name  String
  supplier_email String   @unique
  supplier_phone String
  balance        Decimal  @db.Decimal(18,4)
  balance_type   SupplierBalanceType?  // credit | debit
  currencyCode   String?
  userId         String
  isDeleted      Boolean
}
```

> **Migration status:** `Contact.legacyCustomerId` / `legacySupplierId` bridge columns are present. `prisma/migrateContacts.ts` performs the one-way migration. Controllers use `contactId` as the primary FK; `customerId` / `supplierId` remain as fallbacks.

### 2.3 CRM Deal (in-memory, NOT persisted)

```typescript
interface Deal {
  id: string;            // DEAL-{timestamp}
  userId: string;        // tenant
  title: string;
  customerName: string;
  value: number;         // UZS
  currency: string;      // always 'UZS'
  stage: 'LEAD' | 'CONTACTED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  probability: number;   // 0..100
  expectedCloseDate: string;
  assignedToName: string;
  phone?: string;
  email?: string;
  notes?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

> **CRITICAL GAP:** Deals live in `controllers/crmDealsController.ts::dealsStore` — a process-local `Record<userId, Deal[]>`. All deals are lost on server restart. See §7 Known Gaps.

---

## 3. Backend

### 3.1 API Endpoints

#### Contacts (Prisma-backed)

| Method | Path | Controller | Auth |
|--------|------|-----------|------|
| `GET` | `/admin/contacts` | `contactController.ts::getContacts` | JWT |
| `GET` | `/admin/contacts/:id` | `contactController.ts::getContactById` | JWT |
| `POST` | `/admin/contacts` | `contactController.ts::createContact` | JWT |
| `PUT` | `/admin/contacts/:id` | `contactController.ts::updateContact` | JWT |
| `DELETE` | `/admin/contacts/:id` | `contactController.ts::deleteContact` | JWT |
| `GET` | `/admin/contacts/:id/statement` | `contactController.ts::getContactStatement` | JWT |
| `GET` | `/admin/contacts/:id/aging` | `agingController.ts` | JWT |
| `POST` | `/admin/contacts/:id/credit` | `accountCreditController.ts::grantCredit` | JWT |
| `GET` | `/admin/contacts/:id/credit-balance` | `accountCreditController.ts::getCreditBalance` | JWT |

#### Legacy Customers

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/customers` | `customerController.ts` |
| `POST` | `/admin/customers` | `customerController.ts` |
| `PUT` | `/admin/customers/:id` | `customerController.ts` |
| `DELETE` | `/admin/customers/:id` | `customerController.ts` |
| `GET` | `/admin/customers/:id/statement` | `customerController.ts::getCustomerStatement` |

#### CRM Sales Pipeline (in-memory)

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/crm/pipeline` | `crmDealsController.ts::getDealsPipeline` |
| `POST` | `/admin/crm/deals` | `crmDealsController.ts::createDeal` |
| `PATCH` | `/admin/crm/deals/:id/stage` | `crmDealsController.ts::updateDealStage` |
| `DELETE` | `/admin/crm/deals/:id` | `crmDealsController.ts::deleteDeal` |

### 3.2 Business Logic

**Contact statement (`getContactStatement`):** Aggregates all invoices (AR), purchases (AP), and payments for a contact. Computes running balance in the contact's default currency. Equivalent to the Uzbek "Akt sverki" (reconciliation act).

**Account Credit (`accountCreditController.ts`):**
- `grantCredit`: creates `AccountCreditEntry{type: GRANT}`, posts GL entry `Dr CUSTOMER_CREDIT_EXPENSE / Cr ACCOUNT_CREDIT`.
- `getCreditBalance`: computes balance on-the-fly from `AccountCreditEntry` rows — never stored denormalized.
- Redemption is handled during invoice payment flow.

**Pipeline metrics (computed in-memory):**
- `totalPipelineValue` = sum of all non-LOST deal values
- `winRate` = WON / (WON + LOST) × 100%
- `stageSummary` = count + totalValue per stage

### 3.3 Validation Rules

**Contact creation:**
- `email` must be unique per tenant (enforced by `@@unique([userId, email])` — but only on `Customer`; `Contact` model has no unique constraint on email, only an index)
- `defaultTaxTreatment` defaults to `STANDARD` (maps to Uzbek standard 12% QQS)
- `currencyCode` defaults to company functional currency if null

**Deal creation (in-memory):**
- `title` and `customerName` are required (400 if missing)
- `stage` defaults to `LEAD`
- `probability` defaults by stage: LEAD=20, WON=100, LOST=0, others=50

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Contact List | `pages/admin/contacts/ContactList.tsx` | `/admin/contacts` |
| Contact Form (Create/Edit) | `pages/admin/contacts/ContactForm.tsx` | `/admin/contacts/new`, `/admin/contacts/:id/edit` |
| Contact Card (Detail View) | `pages/admin/contacts/ContactCard.tsx` | `/admin/contacts/:id` |
| Grant Credit Modal | `pages/admin/contacts/GrantCreditModal.tsx` | Modal on Contact Card |
| CRM Sales Pipeline | `pages/admin/crm/CrmPipelinePage.tsx` | `/admin/crm/pipeline` |

### 4.2 User Flows

**Create Contact:**
1. Navigate to Contacts → New Contact
2. Fill: name/organisation, email, phone, mobile, address, tax treatment, currency, bank details, notes
3. STIR field maps to `vatRegNumber`; displayed as "STIR / INN" in Uzbek locale
4. On save → `POST /admin/contacts` → redirects to Contact Card

**Contact Statement (Akt Sverki):**
1. Open Contact Card → click "Hisobot" / Statement tab
2. System fetches AR invoices + payments, AP purchases + payments for this contact
3. Displays running balance table with date-sorted transactions
4. "Export Akt Sverki" generates PDF reconciliation act

**CRM Pipeline (Kanban):**
1. Navigate to CRM → Sales Pipeline
2. 6 columns rendered left-to-right: LEAD, CONTACTED, PROPOSAL, NEGOTIATION, WON, LOST
3. Each deal card shows: company name, value (formatted as UZS), probability badge, expected close date, assigned agent
4. Drag-and-drop (or "Move" button) calls `PATCH /admin/crm/deals/:id/stage`
5. Header shows KPI bar: Total Pipeline Value, Won Value, Win Rate %, Active Deals
6. "New Deal" button opens inline form → `POST /admin/crm/deals`

### 4.3 Key Components

- `ContactList.tsx` (30 KB): Searchable/filterable table with status badges, balance column, quick-action menu (Edit, Statement, Delete). Supports multi-currency balance display.
- `ContactForm.tsx` (35 KB): Tabbed form — General, Address, Financial, Bank Details, Notes. Includes VIES VAT validation toggle (disabled for Uzbekistan locale).
- `ContactCard.tsx` (24 KB): Detail view with tabs: Overview, Transactions, Invoices, Purchases, Statement, Account Credit.
- `CrmPipelinePage.tsx` (19 KB): Kanban board with drag-and-drop deal cards. In-memory data sourced from `/admin/crm/pipeline`. Includes metrics bar and New Deal modal.

---

## 5. Integrations

- **E-IMZO**: Contact TIN (`vatRegNumber` / STIR) is used when signing E-Faktura documents — the buyer's STIR is embedded in PKCS#7 signed payload.
- **E-Faktura / Didox**: Buyer TIN (`buyerTin`) on e-documents is sourced from the contact's `vatRegNumber`.
- **Act of Reconciliation (Akt Sverki)**: Auto-generated from contact statement data in `eDocumentController.ts`. Signed with E-IMZO.
- **WhatsApp notifications** (`whatsappController.ts`): Can send payment reminders to contact's `mobile` number via configured WhatsApp provider.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **CRM Deals not persisted** | 🔴 Critical | `dealsStore` is a process-local in-memory map. All pipeline data is lost on restart. Needs `Deal` model in Prisma and migration. |
| 2 | **No Prisma DB model for Deal** | 🔴 Critical | The `Deal` interface exists only in TypeScript. No migration, no schema model. |
| 3 | **Dual contact system** | 🟡 Medium | `Customer`, `Supplier`, and `Contact` models all exist. Code mixes `customerId` and `contactId` FKs across documents. Full migration to unified `Contact` is incomplete. |
| 4 | **No duplicate email guard on Contact** | 🟡 Medium | `Contact` has only an index on `email`, not `@@unique([userId, email])`. Duplicates are possible. |
| 5 | **Pipeline analytics not tracked** | 🟡 Medium | Win/loss conversion rates are computed from current in-memory state only. No historical analytics. |
| 6 | **VIES validation irrelevant for UZ** | 🟢 Low | `viesValidationEnabled` and `viesValid` fields are EU-specific. For Uzbekistan, STIR validation against the Soliq.uz business registry API is not implemented. |
| 7 | **No CRM-to-Invoice conversion flow** | 🟡 Medium | Won deals do not auto-generate quotations or invoices. Manual workflow required. |
| 8 | **No email/activity history on Contact** | 🟡 Medium | No email thread or call log linked to contacts beyond `AuditLog`. |
