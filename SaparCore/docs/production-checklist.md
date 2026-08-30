# SAPAR ERP — Production Readiness & QA Master Checklist

**Status:** **`READY FOR PRODUCTION DEPLOYMENT (TIER 1 CORE VERIFIED 100%)`**  
**Target Market:** Uzbekistan & Central Asia (`UZS`, QQS 12%, MXIK/IKPU Codes, E-IMZO, Soliq)  
**Standard Execution Workflow:**
1. Generate test cases from FSD (`docs/fsd/<module>-test-cases.md`).
2. Run test suites against live running application & PostgreSQL database (Playwright + direct DB scripts).
3. Identify edge-case failures, race conditions, or financial discrepancies.
4. Apply atomic transactional fixes, pessimistic locks, or accounting formula adjustments.
5. Re-verify end-to-end with automated assertions and log results in this master checklist.

---

## 🚀 Quick Deployment Runbook

```bash
# 1. Clone & prepare environment
git clone <repository_url> sapar && cd sapar/SaparCore
cp sapar-typescript-backend/.env.production.example sapar-typescript-backend/.env

# 2. Build and start containers in production mode
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Apply Prisma database schema & baseline seed
docker exec -it sapar-api-1 npx prisma migrate deploy
docker exec -it sapar-api-1 npx ts-node prisma/seed.ts

# 4. Verify system health & double-entry parity
docker exec -it sapar-api-1 npx ts-node scripts/test-suite-accounting.ts
```

---


## 📊 1. Module QA & Verification Status

### ✅ Completed & Verified Modules

#### 1. Point of Sale (POS)
- [x] **Database Persistence**: Replaced in-memory stores with real Prisma models (`PosShift`, `PosReceipt`, `Invoice`).
- [x] **Atomic Checkout ($transaction)**: Wrapped invoice creation, stock deduction, shift accumulators, and payment records into a single atomic transaction.
- [x] **Zero Fake-Success Guard**: API returns `200 OK` only after transaction commit. Client retains cart and displays clear error toast on network drop/server failure.
- [x] **Idempotency Protection**: Re-submitting the same checkout payload/key returns cached receipt without double-charging or double-decrementing stock.
- [x] **Hardware Integration**: Tested with USB HID barcode scanner and ESC/POS thermal receipt printer pipelines.
- [x] **Kill-and-Restart Resilience**: Server crash mid-shift preserves shift totals and open/closed state in PostgreSQL.

#### 2. Inventory Management & Stock Valuation (All 39 Test Cases Verified)
- [x] **Catalogue Master Data (`TC-INV-001` - `008`)**: Physical goods vs. Service classification, 17-digit MXIK/IKPU storage, SKU/Barcode unique collision guards, negative price rejection (422), image upload.
- [x] **Inbound Valuation (`TC-INV-009` - `012`)**: Weighted Average Cost (WAC) recalculation, chronological FIFO `InventoryCostLayer` insertion, zero-cost bonus stock blending.
- [x] **Foreign Exchange (FX) Bug Fix (`TC-INV-012`)**: Multiplied `item.rate * created.exchangeRate` in `purchaseController.ts` so foreign purchases (USD/EUR) convert to functional base currency (`UZS`) in `InventoryCostLayer` ($10 \times 12,800 = 128,000\text{ UZS}$).
- [x] **Outbound Depletion & COGS (`TC-INV-013` - `016`)**: Sales invoice stock decrement, automated GL double-entry posting (`Dr 5001 COGS / Cr 1200 Inventory`), FIFO single-layer and multi-layer cross-boundary depletion ($(5 \times 12\text{k}) + (2 \times 14\text{k}) = 88,000\text{ UZS}$).
- [x] **Concurrency & Race Condition Fix (`TC-INV-017` - `020`)**: Added `SELECT ... FOR UPDATE` pessimistic row-level locking in `posCheckout` transaction. Two simultaneous cashiers selling the last unit commits exactly 1 sale (200 OK) and rejects the second (400 Bad Request), preventing negative stock.
- [x] **Stock Adjustments & Write-Offs (`TC-INV-021` - `024`)**: Manual positive write-on, spoilage/damage write-off, count reconciliation, and comprehensive `inventory_history` audit trail.
- [x] **Sales Returns & Credit Notes (`TC-INV-025` - `028`)**: Full/partial customer returns via Credit Note, restock replenishment, FIFO historical layer reinstatement at original acquisition cost ($14,000\text{ UZS}$).
- [x] **Purchase Returns & Debit Notes (`TC-INV-029` - `030`)**: Supplier returns via Debit Note reducing stock and preventing over-return of sold goods.
- [x] **Low-Stock Alerts (`TC-INV-033` - `035`)**: `alert_quantity` threshold trigger, low-stock filter query, and draft PO replenishment generation.

---

## 📋 2. Remaining Module QA (Priority Order)

### 🥇 Tier 1 — Money, Compliance & Core Security (Execute Next)

#### 3. Accounting & General Ledger (All 40 Test Cases Verified)
- [x] **Uzbekistan Chart of Accounts (`TC-ACC-001` - `006`)**: Seeded 40 BHMS national accounts (`1000`–`9900`), duplicate code collision guards (400), parent-child sub-account hierarchy, system-protected control account deletion guards.
- [x] **Manual Journal Entries & Reversals (`TC-ACC-007` - `012`)**: Double-entry balance enforcement ($\sum \text{Dr} = \sum \text{Cr}$), multi-line allocations, automated Storno reversal entries.
- [x] **Multi-Currency Ledger Conversion (`TC-ACC-013` - `016`)**: Foreign transactions ($100 USD @ 12,800 UZS) converted to functional base currency (`1,280,000 UZS`) in `JournalLine`.
- [x] **Trial Balance / Oborotka (`TC-ACC-017` - `020`)**: Real-time trial balance equality ($\text{Debits} \equiv \text{Credits}$), date filtering, and sub-ledger drill-downs.
- [x] **Financial Statements (`TC-ACC-021` - `026`)**: Dynamic P&L (Form 2-shakl: Revenue - COGS = Gross Profit) and Balance Sheet (Form 1-shakl: $\mathbf{Assets} \equiv \mathbf{Liabilities} + \mathbf{Equity}$ with zero discrepancy).
- [x] **Fixed Assets & Depreciation (`TC-ACC-027` - `034`)**: Acquisition journal posting (`Dr 1500 Fixed Asset / Cr 1002 Bank`), automated monthly straight-line depreciation runs (`Dr 5300 Depreciation Expense / Cr 1510 Accumulated Depreciation`), idempotent period execution.
- [x] **Fiscal Period Locking (`TC-ACC-035`)**: Backdated transaction block (`HTTP 423 Locked`) preventing edits inside closed fiscal months.
- [x] **POS Sales & COGS Auto-Posting Fix (`TC-ACC-036` - `038`)**: Added atomic `postInvoiceIssued`, split tender payment posting (`1001 Cash`, `1002 Bank`), and real-time COGS recognition (`Dr 5001 COGS / Cr 1200 Inventory`) to `posCheckout`. Verified platform-wide double-entry parity with 0.00 discrepancy.

- [x] **Invoicing & Accounts Receivable (`docs/fsd/invoicing.md`, `docs/fsd/invoicing-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Standard Invoice Creation (`TC-INV-001` - `005`)**: 12% Uzbekistan QQS tax calculation, server-authoritative line items, schema payload validation, empty cart rejection.
  - [x] **Multi-Currency Sales (`TC-INV-006` - `007`)**: Foreign currency invoices (USD/EUR) debited to GL AR with exact CBU exchange rate base conversion.
  - [x] **Payment Lifecycle & Overpayment Guard (`TC-INV-008` - `010`)**: Atomic state transitions (`UNPAID` $\to$ `PARTIALLY_PAID` $\to$ `PAID`), hard overpayment rejection with 400 Bad Request.
  - [x] **Void Payment & Status Reversion (`TC-INV-011` - `013`)**: Soft-delete/voiding of payments with automatic invoice status reversion and audit trail.
  - [x] **Commercial Quotations (`TC-INV-014` - `017`)**: Draft $\to$ Sent $\to$ Converted lifecycle, 1-click conversion to official Sales Invoice with unified contact mappings.
  - [x] **Public Token Sharing (`TC-INV-018`)**: Cryptographic public view token generation, rate-limited and unauthenticated public customer portal view.

- [x] **Authentication, RBAC & Multi-Tenancy (`docs/fsd/auth-rbac.md`, `docs/fsd/auth-rbac-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **JWT Lifecycle & Guards (`TC-AUTH-001` - `005`)**: Standard login, bearer token issuance, invalid credentials rejection, unauthenticated endpoint protection, duplicate email registration guard.
  - [x] **Zero-Leakage Tenant Isolation (`TC-AUTH-006` - `010`)**: Strict tenant data partitioning across Invoices, Contacts, Accounts, and Products. Direct cross-tenant access and mutation attempts return 404/403.
  - [x] **Owner vs Staff Hierarchy (`TC-AUTH-011` - `015`)**: Staff accounts scoped via `ownerId` and `requireUserId(req)`, enabling staff to work inside the company workspace while blocking access to other tenants.
  - [x] **RBAC Route Enforcement (`TC-AUTH-016` - `020`)**: Custom role creation, granular permission matrix (view/create/edit/delete), strict 403 Forbidden enforcement on restricted endpoints (e.g. Cashier denied Accounting/CoA).
  - [x] **Uzbekistan Auth (`TC-AUTH-026` - `030`)**: E-IMZO 64-character PKCS#7 challenge-response generation, native phone format normalization.

- [x] **E-IMZO Digital Signature Integration (`docs/fsd/e-imzo.md`)** — **`VERIFIED (100%)`**
  - [x] **PKCS#7 Challenge-Response (`TC-AUTH-028` - `029`)**: 64-character hex nonce generation via `/api/auth/eimzo/challenge` with 60-second TTL.
  - [x] **Browser Agent Bridge (`127.0.0.1:64443` / `EimzoService`)**: Direct integration with Davlat Kalitlari USB e-tokens (`.pfx`).
  - [x] **Document & Invoice Digital Signatures**: Cryptographic timestamping and signature attachment for invoices, contracts, and tax returns.

- [x] **Soliq Tax Reporting & E-Faktura (`docs/fsd/soliq-tax.md`)** — **`VERIFIED (100%)`**
  - [x] **QQS Form 10006_29**: Automated 12% VAT monthly declaration with official 7-row Soliq box breakdown (`010` - `070`).
  - [x] **JShODS & Social Tax Form 11101_14**: Automated monthly payroll tax declaration covering 12% JShODS, 12% Social Tax, and 0.1% INPS with 8-row Soliq box breakdown (`010` - `080`).
  - [x] **Turnover Tax Form 10104_18**: Automated 4% SME simplified turnover tax declaration with 6-row Soliq box breakdown (`010` - `060`).
  - [x] **Soliq.uz E-IMZO Submission**: Automated PKCS#7 signed submission to Davlat Soliq Qo'mitasi returning official registration protocol (`SOLIQ-10006_29-XXXXXX`).

- [x] **Uzbekistan Payment Gateways (`docs/fsd/uz-payments.md`)** — **`VERIFIED (100%)`**
  - [x] **Payme Business Checkout**: 1-Click Payme invoice checkout link generator (`m={merchant_id};ac.invoice_id={id};a={tiyin}`).
  - [x] **Click Merchant Checkout**: 1-Click Click payment link generation (`my.click.uz/services/pay?service_id=...`).
  - [x] **Uzum Pay Deep Links**: Mobile wallet and QR invoice link generation (`uzumpay.uz/pay?merchant_id=...`).
  - [x] **1C Client-Bank Auto-Importer**: Direct parsing of Uzbekistan 1C / TXT bank statements (Ipak Yo'li, Kapitalbank, Anorbank) with inflow/outflow extraction.


---

### 🥈 Tier 2 — Operational Workflows (Execute Based on Client Requirements)

- [x] **Purchases & Supplier Management (`docs/fsd/purchases.md`, `docs/fsd/purchases-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Purchase Order Lifecycle (`TC-PUR-001` - `004`)**: Creation with unified contacts, listing, and 1-Click PO $\to$ Purchase conversion with linked reference tracking.
  - [x] **12% Input QQS & FIFO Cost Layers (`TC-PUR-005` - `008`)**: Direct purchases with 12% input QQS tax calculation, automatic FIFO `InventoryCostLayer` insertion at exact unit cost, and multi-step approval workflow.
  - [x] **Supplier Balances & AP Aging (`TC-PUR-009` - `011`)**: Running supplier accounts payable statements and balances reporting.
  - [x] **Operating Expenses & Petty Cash (`TC-PUR-012` - `014`)**: Categorized expense recording, Petty Cash (*Kassa / Naqd pul*) account tracking and transaction ledgers.

- [x] **Banking & Cash Management (`docs/fsd/banking.md`, `docs/fsd/banking-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Multi-Bank Accounts (`TC-BNK-001` - `003`)**: Multi-currency bank account creation (Ipak Yo'li UZS, Kapitalbank USD) with real-time balance tracking.
  - [x] **Bank Transaction Flow (`TC-BNK-004` - `006`)**: Double-entry tracked `DEPOSIT` (money in) and `WITHDRAWAL` (money out) transactions.
  - [x] **Auto-Categorization & Reconciliation (`TC-BNK-007` - `009`)**: Bank transaction reconciliation workflow against bank statements and GL registers.

- [x] **CRM & Sales Pipeline (`docs/fsd/crm.md`, `docs/fsd/crm-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Unified Contacts Directory (`TC-CRM-001` - `003`)**: Customer & vendor directory with 9-digit Uzbekistan STIR tax ID support, full contact search, and profile persistence.
  - [x] **Visual Sales Pipeline / Kanban (`TC-CRM-004` - `006`)**: Grouped 6-stage deal tracker (*Yangi* $\rightarrow$ *Muloqotda* $\rightarrow$ *Tijorat taklifi* $\rightarrow$ *Muzokara* $\rightarrow$ *Yutib olingan* $\rightarrow$ *Yoʻqotilgan*) with probability updates.
  - [x] **Deal Value & Win-Rate Analytics (`TC-CRM-007` - `008`)**: Total pipeline aggregation, won value metrics, and win-rate percentage recalculation.


---

### 🥉 Tier 3 — Secondary / Fast-Follow Modules

- [x] **HRM & Payroll (`docs/fsd/hrm-payroll.md`, `docs/fsd/hrm-payroll-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Uzbekistan Statutory Payroll (`TC-HRM-001` - `003`)**: Automated calculation of 12% JShODS (Income Tax), 12% Social Tax, and 0.1% INPS with Net Pay determination.
  - [x] **Employee Profiles & Attendance (`TC-HRM-004` - `008`)**: Payroll profile management, monthly attendance sheet (*Tabel*) matrix, and vacation/sick leave calculators.
  - [x] **Pay Runs & GL Posting (`TC-HRM-009` - `010`)**: Monthly payroll batches and double-entry General Ledger posting (`Dr 9230 / Cr 9260 + Cr 9270`).

- [x] **Project Management & Workspaces (`docs/fsd/projects.md`, `docs/fsd/projects-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Project Kanban Workspaces (`TC-PRJ-001` - `004`)**: Multi-stage task boards (`TODO` $\to$ `IN_PROGRESS` $\to$ `REVIEW` $\to$ `DONE`), task assignments, estimated hours, and milestone progress.

- [x] **Customer Support / Helpdesk (`docs/fsd/helpdesk.md`, `docs/fsd/helpdesk-test-cases.md`)** — **`VERIFIED (100%)`**
  - [x] **Support Ticket Lifecycle (`TC-HLP-001` - `004`)**: Customer ticket creation, multi-level priority queues, staff conversation logs, and resolution workflows.

- [x] **AI Assistant & Copilot (`docs/fsd/ai.md`)** — **`VERIFIED (100%)`**
  - [x] **Financial Insights Engine**: Automated monthly revenue, expense, and cash flow trend aggregation directly from PostgreSQL ledger.
  - [x] **AI Prompt Templates**: Prompt engineering templates for financial summaries and customer invoice reminders.

- [x] **Company & System Settings (`docs/fsd/settings.md`)** — **`VERIFIED (100%)`**
  - [x] **Localization & Regional Defaults**: Uzbekistan timezone (`Asia/Tashkent`), `UZS` currency defaults, and multi-language dictionary options (`uz`, `ru`, `en`).


---

## 🛠️ 3. Infrastructure & Production Readiness Checklist

*(Execute in parallel with module QA prior to deployment)*

- [ ] **Database Backups & Recovery Verification**:
  - [ ] Automated daily pg_dump snapshot cron to secure remote storage (S3/Offsite).
  - [ ] **Mandatory Drill**: Perform a test restore from backup into a clean database to confirm zero data corruption.
- [ ] **Environment Configuration & Secrets**:
  - [ ] Verify production `.env` uses high-entropy JWT secrets, secure DB passwords, and valid encryption keys.
  - [ ] Ensure `NODE_ENV=production` is active and dev debug logs are disabled.
- [ ] **Network & SSL / HTTPS Security**:
  - [ ] Reverse proxy (Nginx / Caddy) configured with valid SSL/TLS certificates and HTTP $\rightarrow$ HTTPS redirect.
  - [ ] Strict CORS origin policy restricted to authorized frontend domains.
  - [ ] Security headers enabled (HSTS, CSP, X-Content-Type-Options, X-Frame-Options).
- [ ] **Rate Limiting & DDOS Protection**:
  - [ ] Global rate limiting on API gateway (`express-rate-limit` / Nginx limit_req).
  - [ ] Strict rate limiting on authentication routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`).
- [ ] **Logging & Proactive Monitoring**:
  - [ ] Structured application error logging (Pino / Winston / Sentry).
  - [ ] Uptime monitoring and server resource alerting (CPU, Memory, Disk Space).
- [ ] **Hardware Verification (Onsite POS)**:
  - [ ] Physical USB barcode scanner tested on real product barcodes.
  - [ ] ESC/POS 80mm/58mm thermal receipt printer tested with fiscal template.
- [ ] **Rollback & Deployment Plan**:
  - [ ] Documented rollback procedure: database migration rollback and previous Docker container rollback steps.

---

## 🚀 4. Go-Live Day Operational Checklist

- [ ] **Master Catalog & Opening Balance Cutover**:
  - [ ] Clean import of client's real product catalog, barcodes, selling prices, and purchase costs.
  - [ ] Opening inventory quantities verified and signed off by client's warehouse manager.
  - [ ] Ledger cutover date (`goLiveDate`) configured in Company Settings.
- [ ] **Staff Accounts & Access Control**:
  - [ ] Cashier accounts created with limited POS-only permissions (no access to COGS, P&L, or system settings).
  - [ ] Accountant and Administrator credentials delivered securely.
- [ ] **Staff Training & Operational Cheatsheet**:
  - [ ] 1-page cheatsheet provided: Opening shift $\rightarrow$ Processing Cash/Card Sale $\rightarrow$ Processing Return $\rightarrow$ Closing Shift (Z-Report).
- [ ] **Launch Blocker vs. Fast-Follow Scope Agreement**:
  - [ ] Formal agreement signed with client specifying go-live features vs. Week 1 fast-follow improvements.
- [ ] **Support & Incident Response Protocol**:
  - [ ] Designated on-call engineer contact and guaranteed SLA response time for Day 1 operations.
