# FSD — Banking & Reconciliation

**Module slug:** `banking`
**File:** `docs/fsd/banking.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Banking module manages the full bank account lifecycle and transaction reconciliation:

- **Bank Accounts** — multi-currency bank accounts with opening balance
- **Bank Transaction Import** — CSV/MT940 import of bank statement lines
- **Transaction Explanation (Auto-Explain)** — match imported transactions to invoices, expenses, supplier payments, or payroll
- **Bank Reconciliation** — reconcile bank register with GL
- **ML Learning Store** — `ExplanationHint` model learns from past explanations to suggest future matches
- **Petty Cash** — integrated (see `purchases.md`)
- **Money Flows (Transfer)** — inter-account transfers

**Regional scope:** Uzbekistan. Bank accounts hold UZS, USD, EUR, RUB. Bank statement import supports formats from Uzbekistan banks (Ipak Yo'li Bank, Anorbank, Kapitalbank, Agrobank via CSV). Direct Bank API integration is a planned roadmap item.

---

## 2. Data Model — Main Entities

### 2.1 BankDetail (Bank Account)

```prisma
model BankDetail {
  id              String   @id @default(uuid())
  userId          String   // tenant
  account_number  String?
  bank_name       String?
  bank_code       String?
  bankAddress     String?
  currency        String?  // ISO currency code
  opening_balance Decimal  @db.Decimal(18,4)
  current_balance Decimal  @db.Decimal(18,4)
  account_name    String?
  isPrimary       Boolean  @default(false)
  status          Boolean  @default(true)
  isDeleted       Boolean  @default(false)
}
```

### 2.2 BankTransaction

```prisma
model BankTransaction {
  id                String                   @id @default(uuid())
  userId            String                   // tenant
  bankDetailId      String
  transactionDate   DateTime
  description       String?
  payee             String?
  reference         String?
  amount            Decimal                  @db.Decimal(18,4)
  currencyCode      String?
  exchangeRate      Decimal?                 @db.Decimal(18,8)
  baseAmount        Decimal?                 @db.Decimal(18,4)
  transactionType   BankTransactionType      // money_in | money_out
  explainStatus     ExplainStatus            // UNEXPLAINED | FOR_APPROVAL | EXPLAINED
  categoryId        String?                  // TransactionCategory FK
  explainedById     String?
  explainedAt       DateTime?
  explainPayToId    String?                  // user FK (for payroll/reimbursement)
  movedBankBalance  Boolean                  @default(false)
  createdByType     BankTransactionCreatedByType // IMPORT | MANUAL | SYSTEM_PAYMENT
  isVoided          Boolean                  @default(false)
  voidedAt          DateTime?
  invoicePaymentId  String?                  // FK for invoice payment source
  supplierPaymentId String?                  // FK for supplier payment source
  expenseId         String?                  // FK for expense source
}
```

### 2.3 ExplanationHint (ML Learning)

```prisma
model ExplanationHint {
  id                 String   @id
  userId             String
  payeeKey           String   // normalised payee string (lowercased, trimmed)
  transactionTypeKey String   // 'money_in' | 'money_out'
  categoryId         String?
  payToUserId        String?
  hitCount           Int      @default(1)
  lastUsedAt         DateTime
  // @@unique([userId, payeeKey])
}
```

When a transaction is explained, the system upserts an `ExplanationHint` for this payee. Next time a transaction from the same payee is imported, the system suggests the same category/payTo automatically.

### 2.4 TransactionCategory

```prisma
model TransactionCategory {
  id               String            @id
  userId           String
  code             String
  name             String
  group            CategoryGroup     // ADMIN_EXPENSES | COST_OF_SALES | PAYROLL | TAXES | INCOME | ...
  appliesTo        CategoryAppliesTo // MONEY_IN | MONEY_OUT | MONEY_IN_USER | MONEY_OUT_USER
  accountId        String            // GL account FK
  defaultTaxRateId String?
  taxApplicable    Boolean
  isSystem         Boolean           @default(false)
  status           Boolean           @default(true)
}
```

### 2.5 BankReconciliation + BankReconciliationLine

```prisma
model BankReconciliation {
  id                String   @id
  userId            String
  bankDetailId      String
  reconciliationDate DateTime
  statementBalance  Decimal  @db.Decimal(18,4)
  systemBalance     Decimal  @db.Decimal(18,4)
  difference        Decimal  @db.Decimal(18,4)
  status            BankReconciliationStatus  // DRAFT | COMPLETED
  lines             BankReconciliationLine[]
}

model BankReconciliationLine {
  reconciliationId String
  transactionId    String?
  description      String
  amount           Decimal  @db.Decimal(18,4)
  isCleared        Boolean  @default(false)
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Bank Accounts

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/banks` | `bankController.ts::getBanks` |
| `POST` | `/admin/banks` | `bankController.ts::createBank` |
| `PUT` | `/admin/banks/:id` | `bankController.ts::updateBank` |
| `DELETE` | `/admin/banks/:id` | `bankController.ts::deleteBank` |
| `GET` | `/admin/banks/:id/statement` | `bankController.ts::getBankStatement` |

#### Bank Transactions

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/bank-transactions` | `bankTransactionController.ts::getTransactions` |
| `POST` | `/admin/bank-transactions` | `bankTransactionController.ts::createManualTransaction` |
| `POST` | `/admin/bank-transactions/import` | `bankTransactionController.ts::importTransactions` |
| `POST` | `/admin/bank-transactions/:id/explain` | `bankTransactionController.ts::explainTransaction` |
| `POST` | `/admin/bank-transactions/:id/explain-as-payment` | `bankTransactionController.ts::explainAsPayment` |
| `POST` | `/admin/bank-transactions/:id/void` | `bankTransactionController.ts::voidTransaction` |
| `GET` | `/admin/bank-transactions/unexplained-count` | quick KPI badge |

#### Categories

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/transaction-categories` | `transactionCategoryController.ts` |
| `POST` | `/admin/transaction-categories` | |
| `PUT/DELETE` | `/admin/transaction-categories/:id` | |

#### Reconciliation

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/bank-reconciliations` | `bankReconciliationController.ts` |
| `POST` | `/admin/bank-reconciliations` | `bankReconciliationController.ts::createReconciliation` |
| `PUT` | `/admin/bank-reconciliations/:id/complete` | |

#### Money Flows (Transfers)

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/money-flows` | `moneyFlowController.ts` |
| `POST` | `/admin/money-flows` | `moneyFlowController.ts::createTransfer` |

### 3.2 Business Logic

**Transaction import:**
- Accepts CSV rows (date, description, debit, credit, reference)
- Creates `BankTransaction` rows with `createdByType = IMPORT`, `explainStatus = UNEXPLAINED`
- Runs `ExplanationHint` lookup for each transaction: if a hint matches `payeeKey`, auto-suggests category + sets `explainStatus = FOR_APPROVAL`

**Explain transaction:**
- Agent selects a category from `TransactionCategory` list
- On explain: sets `explainStatus = EXPLAINED`, records `explainedById`, `explainedAt`
- Posts GL journal entry: `Dr/Cr GL account mapped to category` vs. `Dr/Cr BANK`
- Upserts `ExplanationHint` with this payee → category mapping

**Explain as payment:**
- Agent links the bank transaction to an existing unpaid Invoice or Purchase
- System marks `InvoicePayment.movedBankBalance = true` (payment came from bank import, not manual entry)
- Updates invoice/purchase payment status
- GL entry posted: BANK to AR/AP offset

**Money flow (inter-account transfer):**
```
Dr Destination Bank Account
  Cr Source Bank Account
```
Creates two `BankTransaction` rows (one money_out, one money_in) and a GL journal entry.

**`movedBankBalance` flag:** Determines whether voiding a payment should also reverse the bank register. If `true` → bank transaction void posts reversing GL entry.

### 3.3 Validation Rules

- `BankDetail.currency` required
- `BankTransaction.amount > 0`
- Cannot explain an already EXPLAINED transaction (status guard)
- Cannot void an EXPLAINED transaction without un-explaining first
- Reconciliation `statementBalance` required; `difference = statementBalance - systemBalance`
- Transfer: source ≠ destination bank account

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Bank Account List | `pages/admin/banking/BankAccountList.tsx` | `/admin/banks` |
| Bank Account Detail | `pages/admin/banking/BankAccountDetail.tsx` | `/admin/banks/:id` |
| Create/Edit Bank | `pages/admin/banking/CreateBank.tsx` | `/admin/banks/new` |
| Bank Transactions | `pages/admin/banking/BankTransactions.tsx` | `/admin/bank-transactions` |
| Import Transactions | `pages/admin/banking/ImportTransactions.tsx` | `/admin/bank-transactions/import` |
| Explain Transaction Modal | `pages/admin/banking/ExplainTransactionModal.tsx` | Modal |
| Transaction Categories | `pages/admin/banking/TransactionCategories.tsx` | `/admin/transaction-categories` |
| Bank Reconciliation | `pages/admin/banking/BankReconciliation.tsx` | `/admin/bank-reconciliations` |
| Money Flow (Transfer) | `pages/admin/banking/MoneyFlow.tsx` | `/admin/money-flows` |

### 4.2 User Flows

**Import Bank Statement:**
1. Banking → Import Transactions
2. Upload CSV file from bank (Ipak Yo'li Bank, Anorbank, etc.)
3. Preview mapping: column → date/description/debit/credit
4. Confirm import → transactions appear in "Unexplained" filter
5. AI/ML suggestions shown where `ExplanationHint` matches exist

**Explain Transaction:**
1. Banking → Transactions → filter "Unexplained"
2. Click transaction → Explain modal
3. Select category (income/expense type) OR link to specific Invoice/Purchase
4. Save → transaction explained, GL posted, hint saved for future

**Bank Reconciliation:**
1. Banking → Reconciliation → New
2. Select bank account, enter statement end date + closing balance
3. Check/tick off cleared transactions
4. System shows difference between statement and GL
5. Complete → reconciliation locked, difference posted if needed

### 4.3 Key Components

- `BankTransactions.tsx` (37 KB): Filterable transaction list with status badges (UNEXPLAINED/FOR_APPROVAL/EXPLAINED). Bulk explain action. AI suggestion highlights.
- `ExplainTransactionModal.tsx` (18 KB): Two-mode explain: by category or by matching to existing document (invoice/purchase).
- `ImportTransactions.tsx` (14 KB): CSV upload with column mapping wizard.
- `BankReconciliation.tsx` (24 KB): Check-off grid reconciliation interface.

---

## 5. Integrations

- **Invoice payments:** `InvoicePayment.bankId` links payments to bank accounts. `movedBankBalance = true` when sourced from bank import.
- **Supplier payments:** Same pattern.
- **Petty cash:** `PettyCashTransaction` links to `BankTransaction` when funds are moved between petty cash and bank.
- **Accounting GL:** Every explained transaction posts a GL entry via `lib/ledger/`.
- **Uzbekistan Bank API (planned):** `uzbekPaymentGatewaysController.ts` includes stubs for Ipak Yo'li Bank, Anorbank, Kapitalbank, Agrobank direct statement import APIs. Currently only CSV import is functional.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Direct Bank API not implemented** | 🟡 Medium | AGENTS.md lists "Direct Bank Statement API: Ipak Yo'li Bank, Anorbank, Kapitalbank, Agrobank." The controller stubs exist but no actual OAuth2/API call is made. Only CSV import works. |
| 2 | **No MT940/SWIFT statement parser** | 🟡 Medium | Only CSV import is implemented. Uzbekistan banks commonly provide MT940 (SWIFT) format. |
| 3 | **ExplanationHint key normalisation is basic** | 🟢 Low | `payeeKey` is lowercased+trimmed but no fuzzy matching. If payee varies by suffix (spaces, account numbers), hints won't match. |
| 4 | **Reconciliation lines not auto-matched** | 🟡 Medium | Reconciliation requires manual check-off. No auto-matching of imported transactions to existing GL entries by date/amount. |
| 5 | **Multi-currency reconciliation** | 🟡 Medium | FX transactions and base-currency equivalents may cause reconciliation differences that are hard to explain in the current UI. |
