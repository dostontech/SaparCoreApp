# Accounting & General Ledger — Manual & Automated QA Test Cases

**Document:** `docs/fsd/accounting-test-cases.md`  
**Reference FSD:** [`docs/fsd/accounting.md`](./accounting.md)  
**Target Market:** Uzbekistan & Central Asia (BHMS Chart of Accounts, Form 1-shakl Balance Sheet, Form 2-shakl P&L, `UZS`, 12% VAT/QQS)  
**Total Test Cases:** 40

---

## 📊 Summary Checklist

| Suite | Category | Scope | Test Cases |
|:---:|---|---|:---:|
| **01** | Chart of Accounts | Account CRUD, hierarchy, BHMS codes, role-protection | `TC-ACC-001` – `TC-ACC-006` |
| **02** | Journal Entries | Double-entry parity, 2-line minimum, unbalance rejection, reversal | `TC-ACC-007` – `TC-ACC-012` |
| **03** | Multi-Currency GL | Base currency conversion (`baseDebit`/`baseCredit`), FX rates | `TC-ACC-013` – `TC-ACC-016` |
| **04** | Trial Balance (Oborotka) | Aggregate debit/credit parity, date filters, account net balances | `TC-ACC-017` – `TC-ACC-020` |
| **05** | Financial Statements | P&L (2-shakl), Balance Sheet (1-shakl: $\text{Assets} = \text{Liabilities} + \text{Equity}$) | `TC-ACC-021` – `TC-ACC-026` |
| **06** | Fixed Assets & Depreciation | Straight-line depreciation posting, disposal gain/loss | `TC-ACC-027` – `TC-ACC-030` |
| **07** | Accounting Periods | Period locking, modification block, backdated posting guards | `TC-ACC-031` – `TC-ACC-035` |
| **08** | Cross-Module Ledger Integrity | POS sales, Inventory COGS, Platform-wide parity, Stock valuation | `TC-ACC-036` – `TC-ACC-040` |

---

## 🏛️ Suite 01: Chart of Accounts (Hisoblar rejasi)

### `TC-ACC-001` — Create Custom GL Account
- **Preconditions**: Authenticated user with accounting permissions.
- **Steps**:
  1. Send `POST /api/admin/accounts` with `{ code: "6990", name: "Boshqa majburiyatlar", accountType: "LIABILITY" }`.
  2. Query `GET /api/admin/accounts` to verify.
- **Expected Result**: Account created with `status: 201`, assigned unique ID, and grouped under `LIABILITY`.

### `TC-ACC-002` — Duplicate Account Code Collision Guard
- **Preconditions**: Account `6990` exists for tenant.
- **Steps**:
  1. Send `POST /api/admin/accounts` with `{ code: "6990", name: "Clash Account", accountType: "ASSET" }`.
- **Expected Result**: Rejected with `400 Bad Request` or `422 Unprocessable Entity` ("Account code already exists for this company").

### `TC-ACC-003` — Hierarchical Parent-Child Account Tree
- **Preconditions**: Parent account `1000` (Materiallar) exists.
- **Steps**:
  1. Create child account `1010` with `parentId: "<id of 1000>"`.
  2. Retrieve tree view via `GET /api/admin/accounts`.
- **Expected Result**: Account `1010` is nested under `1000`.

### `TC-ACC-004` — Role-Protected System Control Account Guard
- **Preconditions**: Control account `1200` (Inventory Asset) or `1100` (Accounts Receivable) has `roleProtected: true`.
- **Steps**:
  1. Attempt `DELETE /api/admin/accounts/:id` on the control account.
  2. Attempt `PUT /api/admin/accounts/:id` changing code or deleting account.
- **Expected Result**: Mutation blocked with `403 Forbidden` / `400 Bad Request` protecting ledger integrity.

### `TC-ACC-005` — Uzbekistan BHMS National Chart of Accounts Seeding
- **Preconditions**: Tenant initialized with Uzbekistan localization pack (`countryCode: 'UZ'`).
- **Steps**:
  1. Send `GET /api/admin/accounts/bhms` or inspect seeded CoA.
- **Expected Result**: Pre-populated with standard Uzbekistan accounts (`1000`–`2900` Assets, `4000`–`4900` Revenue, `5000`–`5900` COGS, `9400`–`9430` Operating Expenses).

### `TC-ACC-006` — Semantic Role Key Mapping (`LedgerAccountMapping`)
- **Preconditions**: Accounts exist for AR, AP, COGS, INVENTORY, REVENUE, BANK.
- **Steps**:
  1. Map role `COGS` $\rightarrow$ Account `5001`.
  2. Verify mapping in `LedgerAccountMapping` table.
- **Expected Result**: System posting engines correctly route COGS debits to mapped account.

---

## 📝 Suite 02: Journal Entries & Manual Postings

### `TC-ACC-007` — Balanced Manual Journal Entry Creation
- **Preconditions**: Two active accounts (e.g. Bank `1200` and Owner Equity `3000`).
- **Steps**:
  1. Send `POST /api/admin/journal-entries` with:
     - Line 1: `accountId: "...", debit: 500000, credit: 0`
     - Line 2: `accountId: "...", debit: 0, credit: 500000`
- **Expected Result**: `201 Created`, entry created with unique `entryNumber` (e.g. `JE-000001`), `isSystemGenerated: false`.

### `TC-ACC-008` — Unbalanced Journal Entry Hard Rejection
- **Preconditions**: Two active accounts.
- **Steps**:
  1. Send `POST /api/admin/journal-entries` with:
     - Line 1: `debit: 500000, credit: 0`
     - Line 2: `debit: 0, credit: 450000` (Difference of 50,000)
- **Expected Result**: Rejected with `400 Bad Request` ("Debits must equal credits"). Zero records inserted.

### `TC-ACC-009` — Single-Line Journal Entry Rejection (Minimum 2 Lines)
- **Preconditions**: One active account.
- **Steps**:
  1. Send `POST /api/admin/journal-entries` with only 1 line (`debit: 100000`).
- **Expected Result**: Rejected with `400 Bad Request` ("At least 2 lines required").

### `TC-ACC-010` — Foreign Tenant Account Boundary Enforcement
- **Preconditions**: Tenant A and Tenant B exist.
- **Steps**:
  1. Tenant A attempts to create a Journal Entry referencing an `accountId` belonging to Tenant B.
- **Expected Result**: Rejected with `400 Bad Request` ("One or more accounts not found"). Cross-tenant data isolation preserved.

### `TC-ACC-011` — Journal Entry Reversal Workflow
- **Preconditions**: Existing journal entry `JE-000001` with `Dr 1200 (50k) / Cr 3000 (50k)`.
- **Steps**:
  1. Send `POST /api/admin/journal-entries/:id/reverse`.
- **Expected Result**: Reversal journal entry created with inverted debit/credits (`Dr 3000 (50k) / Cr 1200 (50k)`), referencing original entry ID.

### `TC-ACC-012` — Multi-Line Split Journal Entry Balancing
- **Preconditions**: 3+ accounts (e.g. Split expense: Dr Rent 300k, Dr Utilities 200k / Cr Bank 500k).
- **Steps**:
  1. Submit split entry where $\sum \text{Debits} = 500,000$ and $\sum \text{Credits} = 500,000$.
- **Expected Result**: `201 Created` with all 3 `JournalLine` rows correctly saved and balanced.

---

## 💱 Suite 03: Multi-Currency General Ledger

### `TC-ACC-013` — Base Currency Automatic Derivation
- **Preconditions**: Company functional currency is `UZS`.
- **Steps**:
  1. Create base-currency journal entry (`exchangeRate: 1`).
- **Expected Result**: `baseDebit = debit` and `baseCredit = credit`.

### `TC-ACC-014` — Foreign Currency Journal Conversion (USD $\rightarrow$ UZS)
- **Preconditions**: USD transaction ($100 at exchange rate 12,800 UZS/USD).
- **Steps**:
  1. Send `POST /api/admin/journal-entries` with `currencyCode: "USD"`, `exchangeRate: 12800`, lines totaling $100.
- **Expected Result**: `JournalLine.debit = 100`, `JournalLine.baseDebit = 1,280,000`. Reports use `baseDebit`.

### `TC-ACC-015` — Base-Currency Parity Enforced on Converted Amounts
- **Preconditions**: Foreign multi-line entry where raw rounding could produce a fractional difference.
- **Steps**:
  1. Submit entry where `baseDebitTotal !== baseCreditTotal`.
- **Expected Result**: Rejected with `400 Bad Request` ("Base-currency debits must equal base credits").

### `TC-ACC-016` — Non-Positive Exchange Rate Rejection
- **Preconditions**: FX journal entry.
- **Steps**:
  1. Submit entry with `exchangeRate: -12800` or `exchangeRate: 0`.
- **Expected Result**: Fallback to default `1` or rejection, preventing negative/zero base amounts.

---

## ⚖️ Suite 04: Trial Balance (Aylanma vedomost / Oborotka)

### `TC-ACC-017` — Global Debit and Credit Equality in Trial Balance
- **Preconditions**: Transactions posted across invoices, purchases, POS, and manual JEs.
- **Steps**:
  1. Send `GET /api/admin/reports/trial-balance`.
- **Expected Result**: `totals.debit === totals.credit` and `balanced: true` with zero discrepancy ($|\text{Debit} - \text{Credit}| < 0.01$).

### `TC-ACC-018` — Account Type Balance Direction
- **Preconditions**: Standard posted ledger.
- **Steps**:
  1. Check individual account rows in Trial Balance.
- **Expected Result**:
  - Asset & Expense accounts show positive normal net debit ($\text{Debit} - \text{Credit}$).
  - Liability, Equity, and Income accounts show positive normal net credit ($\text{Credit} - \text{Debit}$).

### `TC-ACC-019` — Trial Balance Date Range Filtering
- **Preconditions**: Transactions posted across different months (e.g. July 2026 and August 2026).
- **Steps**:
  1. Query `GET /api/admin/reports/trial-balance?from=2026-08-01&to=2026-08-31`.
- **Expected Result**: Only transactions with `entryDate` in August 2026 are included. Totals remain perfectly balanced.

### `TC-ACC-020` — Drill-Down Account Filtering
- **Preconditions**: Journal entries touching Account `1200`.
- **Steps**:
  1. Send `GET /api/admin/journal-entries?accountId=<id of 1200>`.
- **Expected Result**: Returns only journal entries containing lines for account `1200`.

---

## 📑 Suite 05: Financial Statements (P&L Form 2 & Balance Sheet Form 1)

### `TC-ACC-021` — Profit & Loss (2-shakl) Gross Profit & Operating Income
- **Preconditions**: Posted sales invoices, POS sales, purchase COGS, and operating expenses.
- **Steps**:
  1. Send `GET /api/admin/reports/profit-loss`.
- **Expected Result**:
  $$\text{Gross Profit} = \text{Revenue} - \text{COGS}$$
  $$\text{Operating Income} = \text{Gross Profit} - \text{Operating Expenses}$$
  $$\text{Net Income} = \text{Operating Income}$$

### `TC-ACC-022` — Balance Sheet (1-shakl) Fundamental Invariant
- **Preconditions**: Active company ledger.
- **Steps**:
  1. Send `GET /api/admin/reports/balance-sheet`.
- **Expected Result**:
  $$\mathbf{Total\ Assets} \equiv \mathbf{Total\ Liabilities} + \mathbf{Total\ Equity}$$
  $$\text{where } \text{Total Equity} = \text{Owner Equity} + \text{Retained Earnings (Net Income)}$$

### `TC-ACC-023` — Cash-Basis vs. Accrual-Basis P&L Comparison
- **Preconditions**: Invoices sent but not yet paid, expenses paid via cash.
- **Steps**:
  1. Query `GET /api/admin/reports/profit-loss?basis=cash`.
  2. Query `GET /api/admin/reports/profit-loss` (accrual mode).
- **Expected Result**: Cash-basis recognizes revenue only upon invoice payment receipt; Accrual recognizes upon invoice issuance.

### `TC-ACC-024` — Bank Breakdown Aggregation with Sub-Accounts
- **Preconditions**: Multiple bank accounts created (e.g. Ipak Yo'li UZS, Kapitalbank USD).
- **Steps**:
  1. Query `GET /api/admin/reports/balance-sheet`.
- **Expected Result**: `bankBreakdown` lists each bank account with its balance; `cashAndBank` in current assets equals sum of all bank/cash balances.

### `TC-ACC-025` — Sales Returns Contra-Revenue Netting
- **Preconditions**: Sales Credit Note issued for returned goods.
- **Steps**:
  1. Query P&L statement.
- **Expected Result**: Credit note taxable amount acts as an income contra, correctly reducing top-line revenue rather than being misclassified as an operating expense.

### `TC-ACC-026` — Uzbekistan Official Reporting Format (Form 1 & Form 2)
- **Preconditions**: Ledger populated with BHMS account entries.
- **Steps**:
  1. Send `GET /api/admin/reports/uzbekistan?from=2026-01-01&to=2026-12-31`.
- **Expected Result**: Generates official Form 1-shakl and Form 2-shakl lines mapped to statutory row numbers.

---

## 🏢 Suite 06: Fixed Assets & Depreciation

### `TC-ACC-027` — Fixed Asset Registration & Acquisition GL Posting
- **Preconditions**: Authenticated user.
- **Steps**:
  1. Send `POST /api/admin/fixed-assets` with:
     - `name: "Server Rack Dell PowerEdge"`
     - `cost: 24000000` (24M UZS)
     - `salvageValue: 0`
     - `usefulLifeMonths: 24`
     - `acquisitionDate: "2026-01-01"`
     - `postAcquisition: true`
- **Expected Result**: Asset created in `active` status. If `postAcquisition: true`, GL entry posted: `Dr 0100 (Fixed Asset) / Cr 1200 (Bank) 24,000,000 UZS`.

### `TC-ACC-028` — Straight-Line Monthly Depreciation Calculation
- **Preconditions**: Fixed asset with cost 24M UZS, salvage 0, 24 months life ($1\text{M UZS/month}$).
- **Steps**:
  1. Send `POST /api/admin/fixed-assets/:id/depreciate`.
- **Expected Result**:
  - Posts `Dr 9430 (Depreciation Expense) 1,000,000 / Cr 0200 (Accumulated Depreciation) 1,000,000`.
  - Increments `accumulatedDepreciation` by 1,000,000.
  - Updates `lastDepreciatedOn`.

### `TC-ACC-029` — Idempotent Depreciation Execution (No Double-Depreciation)
- **Preconditions**: Depreciation already run for the current month.
- **Steps**:
  1. Send `POST /api/admin/fixed-assets/:id/depreciate` a second time in the same month.
- **Expected Result**: System detects no overdue months and skips posting without duplicate GL entries.

### `TC-ACC-030` — Fixed Asset Disposal with Gain/Loss Calculation
- **Preconditions**: Asset with book value = $24\text{M} - 4\text{M} = 20\text{M UZS}$.
- **Steps**:
  1. Send `POST /api/admin/fixed-assets/:id/dispose` with `disposalProceeds: 22000000` (Sold for 22M UZS).
- **Expected Result**:
  - Asset status updated to `disposed`.
  - Posts disposal GL entry recognizing **2,000,000 UZS Gain on Disposal** (`Dr Bank 22M, Dr Accum Depr 4M / Cr Asset 24M, Cr Gain 2M`).

---

## 🔒 Suite 07: Accounting Periods & Period Locking

### `TC-ACC-031` — Create Fiscal Accounting Period
- **Preconditions**: Admin user.
- **Steps**:
  1. Send `POST /api/admin/accounting-periods` with `{ name: "Q1 2026", startDate: "2026-01-01", endDate: "2026-03-31" }`.
- **Expected Result**: Period created with `isLocked: false`.

### `TC-ACC-032` — Lock Accounting Period
- **Preconditions**: Unlocked accounting period exists.
- **Steps**:
  1. Send `POST /api/admin/accounting-periods/:id/lock`.
- **Expected Result**: `isLocked: true`, `lockedAt` and `lockedBy` recorded.

### `TC-ACC-033` — Prohibit Editing Locked Accounting Period
- **Preconditions**: Period is locked.
- **Steps**:
  1. Attempt `PUT /api/admin/accounting-periods/:id` with new dates.
- **Expected Result**: Rejected with `400 Bad Request` ("Cannot edit a locked period").

### `TC-ACC-034` — Unlock Accounting Period (Authorized Supervisor Only)
- **Preconditions**: Period is locked.
- **Steps**:
  1. Send `POST /api/admin/accounting-periods/:id/unlock`.
- **Expected Result**: `isLocked: false`, allowing authorized adjustments.

### `TC-ACC-035` — Manual Posting Block on Locked Period Date
> ⚠️ **Code Analysis Alert**: Check whether `postingGate.ts` and `createManualJournalEntry` check `accountingPeriod.isLocked` for the entry's `entryDate`.
- **Preconditions**: Period January 1 – March 31, 2026 is locked.
- **Steps**:
  1. Attempt to post manual journal entry with `entryDate: "2026-02-15"`.
- **Expected Result**: Rejected with `403 Forbidden` / `400 Bad Request` ("Period is locked for posting").

---

## 🔗 Suite 08: Cross-Module Ledger Integrity (Downstream Reconciliation)

*This suite performs cross-system verification against live data previously generated by POS and Inventory tests.*

### `TC-ACC-036` — POS Sales to GL Revenue Reconciliation
- **Objective**: Reconcile cash register receipts against the General Ledger.
- **Verification Query**:
  ```sql
  SELECT SUM("totalAmount") FROM "PosReceipt" WHERE "userId" = :tenantId;
  ```
  vs.
  ```sql
  SELECT SUM("baseCredit" - "baseDebit") FROM "JournalLine" 
  WHERE "accountId" = (SELECT "accountId" FROM "LedgerAccountMapping" WHERE "roleKey" = 'REVENUE' AND "userId" = :tenantId);
  ```
- **Expected Result**: Every completed POS receipt has a corresponding revenue credit entry in the ledger.

### `TC-ACC-037` — Inventory COGS Auto-Posting Reconciliation
- **Objective**: Verify that cost of goods sold auto-posted matches exact inventory depletion value.
- **Verification Query**:
  - Sum COGS debit entries (`roleKey = 'COGS'`) across all invoices/POS receipts.
  - Compare with $\sum (\text{depleted units} \times \text{cost layer / WAC unit cost})$.
- **Expected Result**: Exact match between inventory asset credits and COGS debits.

### `TC-ACC-038` — Platform-Wide Global Double-Entry Parity
- **Objective**: Validate mathematical integrity of the entire `JournalLine` table across all tenants and modules.
- **Verification Query**:
  ```sql
  SELECT 
    SUM("baseDebit") as total_base_debit, 
    SUM("baseCredit") as total_base_credit,
    ABS(SUM("baseDebit") - SUM("baseCredit")) as discrepancy
  FROM "JournalLine"
  WHERE "journalEntryId" IN (SELECT id FROM "JournalEntry" WHERE "userId" = :tenantId AND "isDeleted" = false);
  ```
- **Expected Result**: `discrepancy == 0.0000`. Total debits must strictly equal total credits.

### `TC-ACC-039` — Balance Sheet Inventory Asset vs. Warehouse On-Hand Valuation
- **Objective**: Ensure the Inventory Asset account (`1200`/`2910`) on the Balance Sheet matches the real inventory valuation.
- **Verification Query**:
  - Balance Sheet Inventory Line: $\text{DebitNet}(\text{INVENTORY control account})$.
  - Warehouse Valuation:
    ```sql
    -- For WAC products:
    SELECT SUM("quantityOnHand" * "avgCost") FROM "Inventory" WHERE "userId" = :tenantId;
    -- For FIFO products:
    SELECT SUM("qtyRemaining" * "unitCost") FROM "InventoryCostLayer" WHERE "userId" = :tenantId AND "isDeleted" = false;
    ```
- **Expected Result**: Balance Sheet Inventory figure ties out to physical warehouse inventory valuation.

### `TC-ACC-040` — Subledger to General Ledger AR / AP Control Tie-Out
- **Objective**: Verify Accounts Receivable and Accounts Payable control accounts match open document totals.
- **Verification Query**:
  - **AR Tie-Out**: Unpaid Invoices balance $\equiv \text{DebitNet}(\text{AR account})$.
  - **AP Tie-Out**: Unpaid Purchases balance $\equiv \text{CreditNet}(\text{AP account})$.
- **Expected Result**: Subledger document balances equal General Ledger control account balances.

---

## 🚩 Suspected Risk Areas & Code Implementation Notes

1. **`TC-ACC-035` (Period Lock on Auto-Postings)**:
   - *Risk*: `postingGate.ts` currently checks `companySettings.ledgerInitialized` and `goLiveDate`, but does not query `AccountingPeriod.isLocked` during document creation (Invoices, Purchases). Manual JEs check periods, but automated document flows may post into locked periods unless gated.
2. **`TC-ACC-039` (Legacy Subledger vs. GL-Derived Statements)**:
   - *Risk*: `financialStatementsController.ts` branches on `ledgerLive(userId)` (`companySettings.ledgerInitialized`). If `ledgerInitialized` is false, it uses legacy fallback formulas (`quantity * product.purchase_price`), which ignores FIFO layers and WAC adjustments. Always ensure `ledgerInitialized: true` is set.
3. **`TC-ACC-014` / `TC-ACC-015` (Manual FX Entries Base Columns)**:
   - *Note*: `journalEntryController.ts` explicitly derives `baseDebit` and `baseCredit` via `buildManualJeBaseLines`. Manual entries with exchange rates must be verified to ensure reports aggregate base currency columns properly.
