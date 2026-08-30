# FSD — Purchases & Expenses

**Module slug:** `purchases`
**File:** `docs/fsd/purchases.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Purchases & Expenses module covers the full supplier-side expenditure cycle:

- **Purchase Orders (Xarid buyurtmalari)** — commitments to suppliers before goods arrive
- **Purchases / Purchase Invoices** — received goods/services from suppliers with GL impact
- **Debit Notes** — purchase returns and overcharge corrections
- **Expenses** — non-inventory operating costs (utilities, travel, office supplies)
- **Recurring Expenses** — auto-generated repeating expense entries
- **Petty Cash (Kassa / Naqd pul)** — cash register management for petty disbursements
- **Supplier Payments** — payment recording against purchases with void support
- **Supplier Balance Tracking** — per-supplier running AP balance

**Regional scope:** Uzbekistan. All purchase documents support 12% QQS input VAT deduction. Currency: UZS primary, multi-currency supported.

---

## 2. Data Model — Main Entities

### 2.1 Purchase

```prisma
model Purchase {
  id             String         @id @default(uuid())
  purchaseId     String?        @unique  // PUR-NNNNNN
  purchaseOrderId String?       // linked PO
  supplierId     String?        // legacy FK
  contactId      String?        // unified contact FK
  purchaseDate   DateTime
  dueDate        DateTime
  referenceNo    String?
  items          Json?           // line items
  status         PurchaseStatus // new|pending|completed|cancelled|partially_paid|paid
  paymentModeId  String?
  taxableAmount  Decimal        @db.Decimal(18,4)
  totalDiscount  Decimal        @db.Decimal(18,4)
  totalTax       Decimal        @db.Decimal(18,4)
  taxTreatment   TaxTreatment?
  totalAmount    Decimal        @db.Decimal(18,4)
  paidAmount     Decimal        @db.Decimal(18,4)
  balanceAmount  Decimal        @db.Decimal(18,4)
  bankId         String?
  landedCost     Decimal?       @db.Decimal(18,4)  // freight/duties for inventory cost
  sign_type      PurchaseSignType
  approvalStatus ApprovalStatus
  currencyCode   String?
  exchangeRate   Decimal?       @db.Decimal(18,8)
  costCenterId   String?
  projectId      String?
}
```

### 2.2 PurchaseOrder

Same financial structure as Purchase but with `PurchaseOrderStatus` (new|pending|completed|cancelled) and no payment tracking. Converts to `Purchase` via `convert_type`.

### 2.3 Expense

```prisma
model Expense {
  id                String               @id
  expenseId         String?              @unique  // EXP-NNNNNN
  referenceNo       String?
  amount            Decimal              @db.Decimal(18,4)
  expenseDate       DateTime
  paymentModeId     String?
  paymentStatus     ExpensePaymentStatus // PAID|CANCELLED|PENDING
  description       String?
  attachment        String?
  expenseCategoryId String?
  sourceType        ExpenseSourceType    // BANK|PETTY_CASH|EMPLOYEE_PAID
  bankId            String?
  supplierId        String?
  contactId         String?
  isRecurring       Boolean              @default(false)
  parentExpense     String?
  repeatEvery       RecurrenceFrequency?
  approvalStatus    ApprovalStatus
  currencyCode      String?
  exchangeRate      Decimal?             @db.Decimal(18,8)
  tax               Decimal              @db.Decimal(18,4)
  taxRateId         String?
  paidByUserId      String?              // for EMPLOYEE_PAID reimbursable expenses
  costCenterId      String?
  projectId         String?
}
```

### 2.4 PettyCash + PettyCashTransaction

```prisma
model PettyCash {
  id             String    @id
  openingBalance Decimal   @db.Decimal(18,4)
  currentBalance Decimal   @db.Decimal(18,4)
  asOnDate       DateTime
  userId         String?   // tenant
}

model PettyCashTransaction {
  id              String                          @id
  pettyCashId     String
  transactionDate DateTime
  transactionType PettyCashTransactionType        // ADD|SPEND|RETURN
  amount          Decimal                         @db.Decimal(18,4)
  balanceBefore   Decimal                         @db.Decimal(18,4)
  balanceAfter    Decimal                         @db.Decimal(18,4)
  remarks         String?
  relatedType     PettyCashTransactionRelatedType // PETTY_CASH|SUPPLIER_PAYMENT|EXPENSE|BANK
  relatedId       String
}
```

### 2.5 SupplierPayment

```prisma
model SupplierPayment {
  id               String                    @id
  paymentId        String?                   @unique  // PAY-NNNNNN
  purchaseId       String
  supplierId       String?
  contactId        String?
  referenceNumber  String?
  paymentDate      DateTime
  paymentModeId    String?
  sourceType       SupplierPaymentSourceType // BANK|PETTY_CASH
  bankId           String?
  amount           Decimal                   @db.Decimal(18,4)
  paidAmount       Decimal                   @db.Decimal(18,4)
  dueAmount        Decimal                   @db.Decimal(18,4)
  notes            String?
  attachment       String?
  currencyCode     String?
  exchangeRate     Decimal?                  @db.Decimal(18,8)
  movedBankBalance Boolean                   @default(false)
  isVoided         Boolean                   @default(false)
  voidedById       String?
  voidedAt         DateTime?
  voidReason       String?
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Purchases

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/purchases` | `expenseController.ts` (shared) |
| `POST` | `/admin/purchases` | |
| `GET` | `/admin/purchases/:id` | |
| `PUT` | `/admin/purchases/:id` | |
| `DELETE` | `/admin/purchases/:id` | |
| `POST` | `/admin/purchases/:id/payments` | record supplier payment |
| `DELETE` | `/admin/purchases/:id/payments/:paymentId` | void payment |

#### Purchase Orders

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/purchase-orders` | |
| `PUT/DELETE` | `/admin/purchase-orders/:id` | |
| `POST` | `/admin/purchase-orders/:id/convert` | convert to Purchase |

#### Debit Notes

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST` | `/admin/debit-notes` | |
| `PUT/DELETE` | `/admin/debit-notes/:id` | |

#### Expenses

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/expenses` | `expenseController.ts::getExpenses` |
| `POST` | `/admin/expenses` | `expenseController.ts::createExpense` |
| `PUT` | `/admin/expenses/:id` | `expenseController.ts::updateExpense` |
| `DELETE` | `/admin/expenses/:id` | `expenseController.ts::deleteExpense` |
| `GET` | `/admin/expense-categories` | `expenseCategoryController.ts` |

#### Petty Cash

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/petty-cash` | `pettyCashController.ts::getPettyCash` |
| `POST` | `/admin/petty-cash/add` | `pettyCashController.ts::addFunds` |
| `POST` | `/admin/petty-cash/spend` | `pettyCashController.ts::spendFunds` |
| `POST` | `/admin/petty-cash/return` | `pettyCashController.ts::returnFunds` |
| `GET` | `/admin/petty-cash/transactions` | `pettyCashController.ts::getTransactions` |

#### Supplier Balances

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/supplier-balances` | `supplierBalancesController.ts` |
| `GET` | `/admin/supplier-payments` | |

### 3.2 Business Logic

**Purchase GL posting on creation:**
```
Dr INVENTORY / EXPENSE account  = taxableAmount
Dr VAT_INPUT account            = totalTax (input VAT recoverable)
  Cr ACCOUNTS_PAYABLE            = totalAmount
```

**Supplier payment GL:**
```
Dr ACCOUNTS_PAYABLE    = payment amount
  Cr BANK / PETTY_CASH  = payment amount
```

**Landed cost allocation (`landedCost`):** Optional freight/duty amount is added to the purchase total and allocated proportionally to inventory unit costs when `enable_inventory = true` on purchased products.

**Expense GL posting:**
```
Dr EXPENSE account     = amount - tax
Dr VAT_INPUT           = tax (if taxRateId set)
  Cr BANK / PETTY_CASH  = amount (sourceType determines CR account)
```

**Employee-paid expenses (`sourceType = EMPLOYEE_PAID`):**
```
Dr EXPENSE account
  Cr EMPLOYEE_PAYABLE  (mapped by paidByUserId)
```

**Petty cash ADD (funded from bank):**
```
Dr PETTY_CASH
  Cr BANK
```

**Petty cash SPEND (for expense/supplier):**
```
Dr EXPENSE / ACCOUNTS_PAYABLE
  Cr PETTY_CASH
```

**`movedBankBalance` flag:** Persisted on `SupplierPayment` and `InvoicePayment` to distinguish payment-born transactions (which moved the bank register) from bank-reconciliation-EXPLAIN flows (which reuse an existing imported statement line). Reversal on void checks this flag to decide whether to reverse the bank register.

**Recurring expenses cron** (`recurringExpensesCron.ts`): Queries `Expense` where `isRecurring = true AND nextRecurringDate <= NOW` and generates child expense records on schedule.

### 3.3 Validation Rules

- Purchase `dueDate` must be present (required by schema)
- Expense `amount > 0`
- Expense `sourceType` required; if `BANK` then `bankId` required; if `PETTY_CASH` then petty cash account must exist
- Supplier payment `amount <= remainingBalance` (enforced in controller)
- Cannot delete a purchase that has associated payments
- Petty cash balance cannot go negative (balance check before SPEND)

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Purchase List | `pages/admin/purchases/PurchaseList.tsx` | `/admin/purchases` |
| Create Purchase | `pages/admin/purchases/CreatePurchase.tsx` | `/admin/purchases/new` |
| Edit Purchase | `pages/admin/purchases/EditPurchase.tsx` | `/admin/purchases/:id/edit` |
| Overview Purchase | `pages/admin/purchases/OverviewPurchase.tsx` | `/admin/purchases/:id` |
| Purchase Order List | `pages/admin/purchases/PurchaseOrderList.tsx` | `/admin/purchase-orders` |
| Create/Edit PO | `pages/admin/purchases/CreatePurchaseOrder.tsx` | |
| Debit Note List | `pages/admin/purchases/DebitNoteList.tsx` | `/admin/debit-notes` |
| Create Debit Note | `pages/admin/purchases/CreateDebitNote.tsx` | |
| Supplier Balances | `pages/admin/purchases/SupplierBalances.tsx` | |
| Supplier Payments | `pages/admin/purchases/SupplierPayments.tsx` | |
| Expense List | `pages/admin/finance-and-accounting/ExpenseList.tsx` | `/admin/expenses` |
| Expense Form Modal | `pages/admin/finance-and-accounting/ExpenseFormModal.tsx` | Modal |
| Expense Category List | `pages/admin/finance-and-accounting/ExpenseCategoryList.tsx` | |
| Petty Cash List | `pages/admin/finance-and-accounting/PettyCashList.tsx` | `/admin/petty-cash` |
| Add Petty Cash Modal | `pages/admin/finance-and-accounting/AddPettyCashModal.tsx` | Modal |
| Recurring Expenses | `pages/admin/recurring-expenses/` | `/admin/recurring-expenses` |

### 4.2 Key User Flows

**Create Purchase Invoice:**
1. Purchases → New Purchase
2. Select supplier contact, purchase date, due date
3. Add line items (same product picker as invoicing)
4. Input QQS (VAT 12%) per line
5. Set payment mode (Cash, Bank Transfer, Credit)
6. Optionally link to a Purchase Order
7. Save → GL entry posted (AP + input VAT)

**Record Supplier Payment:**
1. Purchase Overview → "To'lov qilish" (Make Payment)
2. Enter amount, source (Bank / Petty Cash), bank account, reference
3. If partial → `balanceAmount` updated; status → `partially_paid`
4. Full → status → `paid`
5. GL entry: Dr AP → Cr Bank/PettyCash

**Petty Cash Management:**
1. Finance → Petty Cash → current balance shown
2. "Add Funds" → enter amount + source bank → `ADD` transaction created
3. "Spend" → enter amount + reason → `SPEND` transaction linked to expense/supplier payment
4. Transaction ledger shows all ADD/SPEND/RETURN movements with running balance

### 4.3 Key Components

- `CreatePurchase.tsx` (81 KB): Full purchase creation form mirroring invoice structure.
- `ExpenseFormModal.tsx` (38 KB): Expense entry modal with AI-assisted OCR upload trigger, category, source type, tax rate.
- `PettyCashList.tsx` (16 KB): Cash register view with balance ticker, transaction table, add/spend/return action buttons.
- `SupplierBalances.tsx` (5 KB): Supplier AP balance summary table.

---

## 5. Integrations

- **AI Bill OCR (`AiExtractionJob`):** Expense/Purchase creation modal supports uploading a bill image. `aiExtractionController.ts` sends to configured AI provider (Claude/OpenAI) for extraction, returns structured line items + supplier info, which pre-fills the form.
- **Banking:** Supplier payments and expense payments create `BankTransaction` rows when `sourceType = BANK`. The banking module reconciliation flow can link imported statement lines to these payments.
- **Accounting GL:** All purchase and expense events auto-post double-entry journal entries.
- **Soliq QQS Declaration:** Input VAT from purchases (`totalTax`) is aggregated in the QQS Form 10006_29 "Inward Purchases" section.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **`items` JSON not normalized** | 🟡 Medium | Same issue as Invoice — purchase line items stored as JSON blob. Not queryable for COGS/inventory analytics. |
| 2 | **No approval workflow for PO → Purchase** | 🟡 Medium | `ApprovalStatus` exists on both models but the three-way (PO approval → goods receipt → purchase invoice) workflow is not implemented. |
| 3 | **`purchaseId` nullable** | 🟡 Medium | Schema comment: "TODO 0.1c: app-generated PUR-NNNNNN". Number generation may be inconsistent. |
| 4 | **Debit note GL not clearly defined** | 🟡 Medium | `DebitNote` tracks return amounts but the GL reversal posting for input VAT reclaim on returns is not visible in the codebase. |
| 5 | **Recurring expense engine uses old pattern** | 🟢 Low | `recurringExpensesCron.ts` uses the `isRecurring/parentExpense` approach on `Expense`, not the `RecurringSchedule` engine introduced for invoices. Two different recurring systems coexist. |
| 6 | **Petty cash `userId` nullable** | 🟢 Low | Schema notes: "Nullable at schema level, but backfill guarantees every row has an owner." The application nullable FK is a tech debt smell. |
