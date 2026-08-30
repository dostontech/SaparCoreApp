# FSD — Accounting & Finance

**Module slug:** `accounting`
**File:** `docs/fsd/accounting.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Accounting module is the financial backbone of SAPAR. It provides:

- **Chart of Accounts (Hisoblar rejasi)** — full double-entry CoA supporting the Uzbekistan National Chart of Accounts (BHMS) as well as generic structures
- **General Ledger (Bosh kitob)** — all system-generated and manual journal entries
- **Financial Statements** — Balance Sheet (1-shakl), P&L (2-shakl), Trial Balance (Aylanma vedomost), Cash Flow
- **Accounting Periods** — fiscal period lock/unlock
- **Budgets** — account-level budget vs. actual comparisons
- **Fixed Assets** — acquisition, straight-line/other depreciation, disposal
- **Cost Centers / Projects** — multi-dimensional tagging on GL lines
- **Multi-currency** — per-document FX rates, exchange rate revaluation, ExchangeRate master
- **Approvals (Maker-Checker)** — optional per-tenant approval queue for invoices, expenses, purchases

**Regional scope:** Uzbekistan. BHMS chart of accounts pre-seeded. Financial statements match Uzbekistan reporting forms (Form 1-shakl Balance Sheet, Form 2-shakl P&L).

---

## 2. Data Model — Main Entities

### 2.1 Account (Chart of Accounts)

```prisma
model Account {
  id           String      @id @default(uuid())
  userId       String      // tenant
  code         String      // e.g. "1010", "9230"
  name         String
  accountType  AccountType // ASSET | LIABILITY | EQUITY | INCOME | EXPENSE
  parentId     String?     // hierarchical tree
  description  String?
  currencyCode String?
  roleProtected Boolean    @default(false) // system accounts locked
  isDeleted    Boolean     @default(false)
  // @@unique([userId, code])
}
```

### 2.2 JournalEntry + JournalLine

```prisma
model JournalEntry {
  id              String            @id @default(uuid())
  userId          String
  entryNumber     String?
  entryDate       DateTime
  postingDate     DateTime?
  description     String?
  reference       String?
  sourceType      String?           // INVOICE | PURCHASE | EXPENSE | PAYRUN | etc.
  sourceId        String?           // FK to source record
  event           String?           // e.g. "INVOICE_CREATED", "PAYRUN_FINALIZED"
  isSystemGenerated Boolean         @default(true)
  isOpeningBalance  Boolean         @default(false)
  reversedById    String?           // self-referential for reversal
  periodId        String?
  lines           JournalLine[]
  isPosted        Boolean           @default(true)
  isDeleted       Boolean           @default(false)
  // @@unique([userId, sourceType, sourceId, event])  — prevents duplicate posts
}

model JournalLine {
  id             String      @id @default(uuid())
  journalEntryId String
  accountId      String
  debit          Decimal     @default(0) @db.Decimal(18,4)
  credit         Decimal     @default(0) @db.Decimal(18,4)
  currencyCode   String?
  exchangeRate   Decimal     @default(1) @db.Decimal(18,8)
  baseDebit      Decimal     @default(0) @db.Decimal(18,4)  // in functional currency
  baseCredit     Decimal     @default(0) @db.Decimal(18,4)
  taxRoleKey     String?
  description    String?
  costCenterId   String?
  projectId      String?
}
```

### 2.3 AccountingPeriod

```prisma
model AccountingPeriod {
  id        String    @id
  userId    String
  name      String
  startDate DateTime
  endDate   DateTime
  isLocked  Boolean   @default(false)
  lockedAt  DateTime?
  lockedBy  String?
  notes     String?
}
```

### 2.4 Budget

```prisma
model Budget {
  id          String   @id
  userId      String
  accountId   String
  periodStart DateTime
  periodEnd   DateTime
  amount      Decimal  @db.Decimal(18,4)
}
```

### 2.5 FixedAsset

```prisma
model FixedAsset {
  id                      String   @id
  userId                  String
  name                    String
  cost                    Decimal  @db.Decimal(18,4)
  salvageValue            Decimal  @default(0) @db.Decimal(18,4)
  usefulLifeMonths        Int
  method                  String   @default("STRAIGHT_LINE")
  acquisitionDate         DateTime
  accumulatedDepreciation Decimal  @default(0) @db.Decimal(18,4)
  lastDepreciatedOn       DateTime?
  status                  String   @default("active") // active | disposed | fully_depreciated
  disposalDate            DateTime?
  disposalProceeds        Decimal? @db.Decimal(18,4)
  disposalJournalEntryId  String?
  isDeleted               Boolean  @default(false)
}
```

### 2.6 LedgerAccountMapping (Role → GL Account)

```prisma
model LedgerAccountMapping {
  userId    String
  roleKey   String   // e.g. "ACCOUNTS_RECEIVABLE", "VAT_OUTPUT", "BANK"
  accountId String
  // @@unique([userId, roleKey])
}
```

### 2.7 ExchangeRate

```prisma
model ExchangeRate {
  userId       String
  fromCurrency String
  toCurrency   String
  rate         Decimal  @db.Decimal(18,8)
  asOfDate     DateTime
}
```

### 2.8 CostCenter / Project (for GL tagging)

```prisma
model CostCenter {
  id       String  @id
  userId   String
  code     String
  name     String
  isActive Boolean @default(true)
}

model Project {
  id          String   @id
  userId      String
  code        String
  name        String
  status      String   @default("active")
  billingRate Decimal? @db.Decimal(12,2)
  startDate   DateTime?
  endDate     DateTime?
  contactId   String?
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Chart of Accounts

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/accounts` | `accountController.ts::getAccounts` |
| `POST` | `/admin/accounts` | `accountController.ts::createAccount` |
| `PUT` | `/admin/accounts/:id` | `accountController.ts::updateAccount` |
| `DELETE` | `/admin/accounts/:id` | `accountController.ts::deleteAccount` |
| `GET` | `/admin/accounts/bhms` | `bhmsAccountingController.ts` — Uzbekistan BHMS CoA |
| `POST` | `/admin/accounts/ledger-mappings` | `accountController.ts::upsertLedgerMapping` |

#### Journal Entries

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/journal-entries` | `journalEntryController.ts::listJournalEntries` |
| `GET` | `/admin/journal-entries/:id` | `journalEntryController.ts::getJournalEntry` |
| `POST` | `/admin/journal-entries` | `journalEntryController.ts::createManualJournalEntry` |
| `DELETE` | `/admin/journal-entries/:id` | `journalEntryController.ts::deleteJournalEntry` |
| `POST` | `/admin/journal-entries/:id/reverse` | `journalEntryController.ts::reverseJournalEntry` |

#### Financial Statements + Reports

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/reports/balance-sheet` | `financialStatementsController.ts::getBalanceSheet` |
| `GET` | `/admin/reports/profit-loss` | `financialStatementsController.ts::getProfitLoss` |
| `GET` | `/admin/reports/trial-balance` | `financialStatementsController.ts::getTrialBalance` |
| `GET` | `/admin/reports/cash-flow` | `financialStatementsController.ts::getCashFlow` |
| `GET` | `/admin/reports/uzbekistan` | `financialStatementsController.ts::getUzbekistanReports` |
| `GET` | `/admin/reports/general-ledger` | `reportController.ts` |
| `GET` | `/admin/reports/accounts-receivable-aging` | `agingController.ts` |
| `GET` | `/admin/reports/accounts-payable-aging` | `agingController.ts` |
| `GET` | `/admin/reports/dimension` | `dimensionReportController.ts` |

#### Accounting Periods

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/accounting-periods` | `accountingPeriodController.ts` |
| `POST` | `/admin/accounting-periods` | `accountingPeriodController.ts::createPeriod` |
| `POST` | `/admin/accounting-periods/:id/lock` | `accountingPeriodController.ts::lockPeriod` |
| `POST` | `/admin/accounting-periods/:id/unlock` | `accountingPeriodController.ts::unlockPeriod` |

#### Budgets

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/budgets` | `budgetController.ts` |
| `POST` | `/admin/budgets` | `budgetController.ts::createBudget` |
| `PUT` | `/admin/budgets/:id` | `budgetController.ts::updateBudget` |

#### Fixed Assets

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/fixed-assets` | `fixedAssetController.ts` |
| `POST` | `/admin/fixed-assets` | `fixedAssetController.ts::createFixedAsset` |
| `POST` | `/admin/fixed-assets/:id/depreciate` | `fixedAssetController.ts::runDepreciation` |
| `POST` | `/admin/fixed-assets/:id/dispose` | `fixedAssetController.ts::disposeAsset` |

#### Approvals (Maker-Checker)

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/approvals/queue` | `approvalsController.ts::getQueue` |
| `POST` | `/admin/approvals/:type/:id/approve` | `approvalsController.ts::approve` |
| `POST` | `/admin/approvals/:type/:id/reject` | `approvalsController.ts::reject` |

### 3.2 Business Logic

**Auto-posting:** Every financial event (invoice creation, purchase, expense, payment, payroll finalization) triggers a system journal entry via `lib/ledger/`. The unique constraint `@@unique([userId, sourceType, sourceId, event])` prevents double-posting.

**Role key system:** `LedgerAccountMapping` maps semantic role keys (e.g. `ACCOUNTS_RECEIVABLE`, `VAT_OUTPUT`, `BANK`, `INVENTORY`, `COGS`) to the tenant's actual chart of accounts code. This allows any CoA structure while posting logic remains generic.

**Multi-currency GL:** `JournalLine.baseDebit/baseCredit` always stores amounts in the functional currency (from `CompanySettings.functionalCurrency`). `debit/credit` stores the transaction currency amount. `exchangeRate` captures the rate at transaction time.

**Straight-line depreciation:**
```
Monthly depreciation = (cost - salvageValue) / usefulLifeMonths
```
Running `POST /fixed-assets/:id/depreciate` posts:
```
Dr Depreciation Expense
  Cr Accumulated Depreciation
```

**Balance Sheet / P&L:**
Computed from `JournalLine` aggregates grouped by `Account.accountType`:
- ASSET accounts → Balance Sheet left
- LIABILITY + EQUITY accounts → Balance Sheet right
- INCOME accounts → P&L revenue
- EXPENSE accounts → P&L expenses

**Uzbekistan Reports (UzbekistanFinancialReportsPage):**
Maps GL accounts to the official Uzbekistan Form 1-shakl (Balance Sheet) and Form 2-shakl (P&L) line items per the BHMS account code structure.

### 3.3 Validation Rules

- Journal entry must balance: `SUM(debit lines) == SUM(credit lines)` (enforced in `createManualJournalEntry`)
- Cannot post to a locked accounting period
- `roleProtected` accounts cannot be renamed or deleted
- `Account.code` must be unique per tenant
- FX rate `> 0`
- Fixed asset `usefulLifeMonths > 0`, `cost > salvageValue`

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Chart of Accounts | `pages/admin/accounting/ChartOfAccountsList.tsx` | `/admin/accounts` |
| BHMS CoA (Uzbekistan) | `pages/admin/accounting/BhmsChartOfAccountsPage.tsx` | `/admin/accounts/bhms` |
| Journal Entries List | `pages/admin/accounting/JournalEntryList.tsx` | `/admin/journal-entries` |
| Create Journal Entry | `pages/admin/accounting/CreateJournalEntry.tsx` | `/admin/journal-entries/new` |
| Accounting Periods | `pages/admin/accounting/AccountingPeriods.tsx` | `/admin/accounting-periods` |
| Budgets | `pages/admin/accounting/Budgets.tsx` | `/admin/budgets` |
| Fixed Assets | `pages/admin/accounting/FixedAssets.tsx` | `/admin/fixed-assets` |
| Contras | `pages/admin/accounting/ContrasList.tsx` / `CreateContra.tsx` | `/admin/contras` |
| Uzbekistan Reports | `pages/admin/accounting/UzbekistanFinancialReportsPage.tsx` | `/admin/reports/uzbekistan` |
| All Reports Hub | `pages/admin/accounting/AllReportsHub.tsx` | `/admin/reports` |
| Approvals Queue | `pages/admin/accounting/ApprovalsQueue.tsx` | `/admin/approvals` |
| Cost Centers | `pages/admin/accounting/CostCenters.tsx` | `/admin/cost-centers` |
| E-Invoice List | `pages/admin/accounting/EInvoiceList.tsx` | `/admin/e-invoices` |
| Tax Returns | `pages/admin/accounting/TaxReturns.tsx` | `/admin/tax-returns` |
| MTD Panel | `pages/admin/accounting/MtdPanel.tsx` | `/admin/mtd` |
| Projects (Accounting) | `pages/admin/accounting/Projects.tsx` | `/admin/projects` |

### 4.2 User Flows

**Create Manual Journal Entry:**
1. Journal Entries → New Entry
2. Enter date, description, reference
3. Add lines: select account (type-ahead from CoA), enter debit or credit amount, optionally set cost center/project, currency, exchange rate
4. Running debit/credit totals shown; save disabled if not balanced
5. On save → `POST /admin/journal-entries` → GL entry created with `isSystemGenerated = false`

**Uzbekistan Financial Reports:**
1. Reports → Uzbekistan Reports
2. Select period (date range)
3. System generates Form 1-shakl (Balance Sheet) and Form 2-shakl (P&L) mapped to BHMS codes
4. Export to Excel or print

**Fixed Asset Depreciation:**
1. Fixed Assets → select asset → "Run Depreciation"
2. System calculates months since `lastDepreciatedOn`
3. Posts depreciation journal entry for each elapsed month
4. Updates `accumulatedDepreciation` and `lastDepreciatedOn`

### 4.3 Key Components

- `ChartOfAccountsList.tsx` (21 KB): Tree-view CoA with expand/collapse per account type group. Inline balance display. Import/export.
- `CreateJournalEntry.tsx` (21 KB): Multi-line journal entry form with balanced-check indicator and currency/FX fields.
- `FixedAssets.tsx` (27 KB): Asset register table + depreciation schedule chart. Disposal flow.
- `UzbekistanFinancialReportsPage.tsx` (20 KB): Tabbed view of Form 1-shakl and Form 2-shakl with BHMS line code mapping.
- `Budgets.tsx` (14 KB): Account-level budget entry grid with actual vs. budget comparison bars.

---

## 5. Integrations

- **All financial modules** post to the GL automatically via `lib/ledger/postJournalEntry` — invoices, purchases, expenses, payroll, petty cash, bank transactions.
- **Soliq QQS Declaration:** `soliqTaxReportsController.ts` reads `JournalLine` rows with `taxRoleKey` to compute output/input VAT for the QQS declaration Form 10006_29.
- **Xero / QuickBooks (`AccountingIntegration`):** Config model and controller exist (`accountingIntegrationController.ts`). Actual sync logic is stubbed.
- **HMRC MTD VAT (`MtdConfig`, `mtdController.ts`, `mtdRoutes.ts`):** UK MTD VAT filing — full OAuth2 flow with encrypted token storage. Legacy from Kanakku origin; not relevant to Uzbekistan deployment.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **MTD / HMRC code is UK-specific, not Uzbekistan** | 🟡 Medium | `MtdConfig`, `mtdController.ts`, `MtdPanel.tsx` are live UK Making Tax Digital code. Should be hidden or replaced with Soliq.uz filing integration. |
| 2 | **`gstFilingController.ts` is India GST** | 🟡 Medium | India GST filing controller still present. Should be removed or gated for Uzbekistan locale. |
| 3 | **`EInvoiceRecord` model is India IRN** | 🟡 Medium | Tracks India e-invoice IRN numbers. The Uzbekistan equivalent is the E-Faktura flow in `eDocumentController.ts` which uses a different (in-memory) approach. |
| 4 | **No FX revaluation routine** | 🟡 Medium | Multi-currency balances are recorded but no end-of-period FX revaluation journal entry generator exists for monetary assets/liabilities. |
| 5 | **Budget variance report missing** | 🟢 Low | `Budgets.tsx` shows budget entry but no drill-down variance report comparing budget vs actual by period. |
| 6 | **Depreciation not automated** | 🟢 Low | `runDepreciation` is triggered manually per asset. No scheduled batch job to auto-depreciate all active assets monthly. |
| 7 | **Accounting periods not enforced for all transactions** | 🟡 Medium | Period lock check exists in `journalEntryController` for manual entries but may not be checked in all auto-posting paths (invoices, purchases). |
| 8 | **Contra entries UI only** | 🟢 Low | `ContrasList.tsx` / `CreateContra.tsx` exist but the contra model and backend are not visible in the schema. Likely uses a journal entry pattern. |
