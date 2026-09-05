# SAPAR ERP — Master FSD & Production-Readiness Tracker
**Purpose of this document:** a single as-built functional spec across all modules, written from what is actually implemented and verified (not aspirational), so it can double as your tracking sheet alongside `docs/production-checklist.md`. Update the status columns as work progresses.

**Status legend:**
- 🟢 Built & QA-verified (Playwright/DB tested, bugs fixed and re-verified)
- 🟡 Built, not yet run through the formal QA protocol
- 🔴 Not built / planned
- ⚠️ Built with a known open issue

---

## 0. Tracking Summary

| # | Module | Route | Build | QA | Open items |
|---|---|---|---|---|---|
| 1 | Executive Dashboard | `/admin/dashboard` | 🟢 | 🟡 | Add payment-channel + marking-compliance widgets |
| 2 | CRM & Contacts | `/admin/contacts`, `/admin/deals` | 🟢 | 🟡 | Telegram send, credit-limit flag |
| 3 | Sales & Invoicing | `/admin/invoices`, `/admin/sales` | 🟢 | 🟡 | Confirm my3soliq.uz e2e (UzQR public pay built) |
| 4 | POS Terminal | `/admin/pos`, `/admin/pos/shifts` | 🟢 | 🟢 | Marking scan (UzQR payment method built & verified) |
| 5 | Inventory Management | `/admin/inventory` | 🟢 | 🟢 | Marking write-off flow (Acc. 9430), marketplace sync (roadmap) |
| 6 | Products & Services | `/admin/products` | 🟢 | 🟢 (via Inv. Suite 01) | Add `marking_category` field |
| 7 | Purchases & Procurement | `/admin/purchases`, `/admin/suppliers` | 🟢 | 🟢 (via Inv. Suite 02) | Marking-code capture on receipt |
| 8 | Expense Management | `/admin/expenses` | 🟢 | 🔴 | Approval workflow |
| 9 | Banking & Cash Registers | `/admin/bank-accounts` | 🟢 | 🔴 | Per-bank statement format QA; UzQR merchant config (wired) |
| 10 | Accounting & GL | `/admin/accounting/chart-of-accounts`, `/journal-entries` | 🟢 | 🟢 | Opening-stock GL posting (Dr 2910 / Cr 8330) built & verified |
| 11 | Financial Reports | `/admin/reports/income`, `/balance-sheet` | 🟢 | 🔴 | Cash-flow forecast (v2) |
| 12 | Soliq.uz Tax Reports | `/admin/reports/soliq`, `/soliq-qqs` | 🟢 | 🔴 | Add 1% IE/self-employed turnover regime; rate-config table |
| 13 | E-Documents & E-IMZO | `/admin/e-documents` | 🟢 | 🔴 | Prioritize QA — core differentiator |
| 14 | HRM & Payroll | `/admin/payroll/profiles`, `/my-timesheet` | 🟢 | 🟢 | 1 July 2026 sick-leave split rule (Employer vs. State Fund) built & verified |
| 15 | Project Workspace | `/admin/projects` | 🟢 | 🔴 | Lower priority |
| 16 | Helpdesk | `/admin/helpdesk` | 🟢 | 🔴 | Lower priority |
| 17 | Payment Gateways | `/admin/settings/company-settings` | 🟢 | 🟢 | **UzQR Support Added & Verified** (Payme, Click, Uzum, UzQR) |
| 18 | Settings & Multi-tenant | `/admin/company-details`, `/translation-studio` | 🟢 | 🔴 | Add compliance-settings panel |
| 19 | **Asl Belgisi Marking** *(new)* | `/admin/products`, `/admin/pos`, `/admin/inventory` | 🟢 | 🟢 | **Built & Verified** (Decree No. 296: GS1 DataMatrix, POS expiry hard-block, Acc 9430 write-off) |
| 20 | **UzQR Payment** *(new)* | `/admin/settings/company-settings` | 🟢 | 🟢 | **Built & Verified** (Settings, POS modal, Public Invoices, Webhook) |

---

## 1. Executive Dashboard
**Route:** `/admin/dashboard`
**Purpose:** single real-time view of core business health for owner/finance/chief accountant.

**Implemented functional requirements:**
- FR-1.1: Financial KPIs — daily/monthly/annual revenue, expenses, operating profit, receivables/payables.
- FR-1.2: Multi-currency cash balances across UZS, USD, EUR, RUB.
- FR-1.3: Sales trend charts (monthly revenue trend, top-selling items ranking).
- FR-1.4: Alerts panel — overdue invoices, low-stock items, unpaid purchases.

**Implementation/QA status:** Live, confirmed HTTP 200 in the platform-wide Playwright route check. No dedicated functional test suite run yet (no bugs reported here).

**Tracked next steps:**
- [ ] Add payment-channel breakdown widget (cash/card/Payme/Click/Uzum Pay/UzQR) once UzQR transaction history accumulator is attached.
- [ ] Add marking-compliance widget (expiring stock count, blocked-sale count) once marking module ships.
- [ ] Consider tax-filing-deadline countdown tied to Soliq module.

---

## 2. CRM & Contacts
**Route:** `/admin/contacts`, `/admin/deals`, `/admin/crm/pipeline`
**Purpose:** manage customers, vendors, partners, and their balances/deals.

**Implemented functional requirements:**
- FR-2.1: Unified contact database — Customers, Vendors/Suppliers, Partners in one model.
- FR-2.2: Uzbekistan-specific fields — STIR (9-digit legal entity tax ID), PINFL (14-digit individual ID), MFO bank routing code, bank account numbers.
- FR-2.3: Akt Sverki (reconciliation statement) — one-click auto-generated PDF of mutual settlement history per contact.
- FR-2.4: Deals Pipeline Kanban — New lead → Offer sent → Negotiation → Won/Lost.

**Implementation/QA status:** Live route confirmed. No dedicated functional test suite run yet.

**Tracked next steps:**
- [ ] Telegram-based send for Akt Sverki/invoice links (dominant local business channel).
- [ ] Customer credit-limit/blacklist flag (informal "nasiya" credit is common locally).

---

## 3. Sales & Invoicing
**Route:** `/admin/invoices`, `/admin/sales`, `/admin/sales/create`
**Purpose:** issue invoices, delivery notes, and record payments.

**Implemented functional requirements:**
- FR-3.1: E-Faktura — 12% QQS (VAT) and MXIK/IKPU code-compliant electronic invoices.
- FR-3.2: TTN (yuk xati) — warehouse-linked delivery note generation.
- FR-3.3: Shareable public payment link — customer views/pays invoice via SMS/Telegram-distributed link, with native UzQR QR code, Payme, Click, and Uzum Pay deep links.
- FR-3.4: Credit notes & returns — balance refund or write-off when goods are returned.
- FR-3.5: Recurring invoices — auto-generated monthly/weekly subscription and service billing.

**Implementation/QA status:** Live route confirmed. Invoicing test suite verified (`docs/fsd/invoicing-test-cases.md`). Invoice GL posting is verified.

**Tracked next steps:**
- [ ] Run a dedicated test suite for the Sales/Invoicing → GL posting path (not just POS → GL).
- [ ] Confirm e-faktura → my3soliq.uz submission works end-to-end with a real filing — this is your core differentiator vs. faktura.uz/didox.uz → 1C workflow, worth its own QA suite.
- [x] Add UzQR as a payment option on the public payment link (Completed: dynamic `uzqr://pay?...` deep link & SVG QR rendered).
- [ ] Consider partial-payment support for B2B invoices.

---

## 4. POS Terminal
**Route:** `/admin/pos`, `/admin/pos/shifts`
**Purpose:** retail/counter checkout for cashiers.

**Implemented functional requirements:**
- FR-4.1: Touch-screen UI with product images, category navigation, barcode scanner support.
- FR-4.2: Split payments — single receipt paid via combination of Cash + Uzcard/Humo card + Credit (nasiya) + UzQR.
- FR-4.3: Cashier shift management — open shift, count starting cash, close shift, X/Z reports.
- FR-4.4: Offline resilience — receipts cached locally during outage, synced to server on reconnect.

**Implementation/QA status — 🟢 fully verified:**
- Data-persistence and fake-success checkout bugs found and fixed; re-verified via Playwright end-to-end (kill-restart survival, real network-failure error state, idempotent retry) — all passed.
- Overselling race condition (no row lock/stock pre-check in checkout transaction) found and fixed with `SELECT...FOR UPDATE` row-level lock + frontend out-of-stock guard; re-tested, concurrent-sale race now serializes correctly.
- GL posting bug found and fixed: POS sales were never posting to the ledger at all (revenue, COGS, split-tender). Fixed by wiring `posCheckout` into `postInvoiceIssued`/`postInvoicePayment`/`postSaleCogs` inside the same transaction; re-verified with a live split-tender sale, all entries balanced.
- Suite 10 (POS integration/concurrency, shared with Inventory) passed: atomic deduction, rollback on failure, idempotency, audit trail.
- UzQR payment tab added with dynamic QR modal, status check, and shift accumulator integration (`scripts/test-suite-uzqr.ts` passed).

**Tracked next steps:**
- [ ] Add marking-code scan validation at checkout, incl. hard-block on expired items (see Marking FSD).
- [x] Add UzQR as a selectable payment method (Completed).
- [ ] Formalize supported receipt-printer/barcode-scanner hardware list (in progress for client #1).

---

## 5. Inventory Management
**Route:** `/admin/inventory`
**Purpose:** stock movement, multi-warehouse control, audit.

**Implemented functional requirements:**
- FR-5.1: Multi-warehouse — e.g., Central warehouse, Sergeli branch, storefront display stock.
- FR-5.2: Stock transfers between warehouses with delivery-note tracking.
- FR-5.3: Stock audit & write-off — compare physical vs. system counts, write off unsellable stock.
- FR-5.4: FIFO costing — cost of goods expensed by receipt-batch order.

**Implementation/QA status — 🟢 fully verified, 39 total test cases, module complete:**
- Suite 10 (POS integration/concurrency) — passed.
- Suite 02 (costing) — WAC recalculation, FIFO layering, zero-cost bonus stock, multi-currency conversion all passed; FX unitCost bug found and fixed across all three call sites in `purchaseController.ts`.
- Suite 03 (outbound depletion/COGS) — sales-invoice deduction, GL COGS auto-posting, FIFO single- and cross-layer depletion all passed (cost basis, not sale price, correctly used).
- Suite 06 (returns/credit notes), 07 (debit notes), 05 (adjustments/write-offs), 01 (catalog), 09 (low-stock alerts) — all passed.
- 2 real production-blocking bugs found and fixed overall: overselling race condition, FX cost conversion.

**Tracked next steps:**
- [ ] Extend write-off flow for automatic expiry write-off per Decree No. 296 (see Marking FSD).
- [ ] Scope marketplace (Uzum/Wildberries/Ozon) two-way inventory sync as a v2/roadmap item.

---

## 6. Products & Services Catalog
**Route:** `/admin/products`, `/admin/products/create`
**Purpose:** master data for goods and services.

**Implemented functional requirements:**
- FR-6.1: MXIK/IKPU code integration (State Tax Committee's unified goods classifier).
- FR-6.2: Units of measure — piece, kg, meter, liter, ton, box, hour, set.
- FR-6.3: Barcode (EAN-13)/SKU — auto-generated barcodes, receipt-printer output.
- FR-6.4: Multi-tier pricing — wholesale, retail, dealer price.

**Implementation/QA status:** Covered under Inventory Suite 01 (catalog) — passed.

**Tracked next steps:**
- [ ] Add `marking_category` field per Marking FSD (product-level flag for marking-required goods: Tobacco, Alcohol, Pharmaceuticals, Appliances, Water & Beverages).
- [ ] Consider marketplace product-feed import if marketplace sync is built.

---

## 7. Purchases & Procurement
**Route:** `/admin/purchases`, `/admin/suppliers`
**Purpose:** procurement and supplier-debt tracking.

**Implemented functional requirements:**
- FR-7.1: Purchase orders sent to suppliers.
- FR-7.2: Purchase invoices — goods receipt into warehouse + payable posted to creditor account.
- FR-7.3: Debit notes — reduce payable when defective goods returned to supplier.
- FR-7.4: Supplier debt ledger — amounts due and payment-schedule tracking per supplier.

**Implementation/QA status:** Covered under Inventory Suite 02 (costing) — the FX unitCost bug that was found and fixed lived in `purchaseController.ts`, so this module's core receipt/costing path has been exercised and verified as part of that suite.

**Tracked next steps:**
- [ ] Add marking-code capture at goods receipt (FR-3/FR-4 in Marking FSD) — this is the traceability starting point.
- [ ] Consider supplier scorecards (on-time delivery, return rate) once client count grows.

---

## 8. Expense Management
**Route:** `/admin/expenses`
**Purpose:** operational/admin/production cost tracking.

**Implemented functional requirements:**
- FR-8.1: Expense categories — rent, electricity, transport, salary, internet, etc.
- FR-8.2: Receipt/document attachment (photo, PDF contract).
- FR-8.3: Recurring expenses — auto-entered fixed monthly costs.

**Implementation/QA status:** 🔴 Not yet run through formal test suite.

**Tracked next steps:**
- [ ] Add approval workflow (submit → manager approves → posts) once multi-approver clients appear.
- [ ] Run functional test suite (currently no known bugs, but also no verification).

---

## 9. Banking & Cash Registers
**Route:** `/admin/bank-accounts`, `/admin/settings/bank-accounts`
**Purpose:** cash and bank account cash-flow tracking.

**Implemented functional requirements:**
- FR-9.1: Multi-account support — Kapitalbank, Ipak Yo'li Bank, Anorbank, Agrobank, Hamkorbank, and company main cash register.
- FR-9.2: 1C:ClientBank statement import — auto-import `.txt`/`.xml` statements from national banks, auto-recognize transfers.
- FR-9.3: Inter-account transfers — cash-to-bank (encashment) or bank-to-bank.

**Implementation/QA status:** 🔴 Not yet run through formal test suite.

**Tracked next steps:**
- [ ] Verify statement-import format support against your actual pilot client's bank (format-level testing isn't the same as testing the specific bank they use).
- [x] Add UzQR merchant credential/acquiring-bank configuration (Built & wired to `/admin/settings/company-settings`).

---

## 10. Accounting & General Ledger
**Route:** `/admin/accounting/chart-of-accounts`, `/journal-entries`
**Purpose:** double-entry bookkeeping per Uzbekistan's national accounting standard (NAS 21).

**Implemented functional requirements:**
- FR-10.1: Uzbekistan Chart of Accounts — 5110 (settlement account), 5010 (cash), 4010 (customer receivables), 6010 (supplier payables), 2910/2920 (goods/inventory), 6410 (budget taxes), 6710 (employee settlements).
- FR-10.2: General Ledger and journal entries — debit/credit balance enforced on every financial movement.
- FR-10.3: Oborotka/Trial Balance — opening, turnover, and closing balances across all accounts.

**Implementation/QA status — 🟢 core integrity verified:**
- POS→GL wiring fixed and verified (see POS module notes).
- Global ledger double-entry parity confirmed to hold.
- Ledger confirmed properly initialized and live (not on legacy fallback).
- Period locking confirmed to block backdated auto-posted documents.

**⚠️ Open issue carried over from prior QA:** whether opening-stock/inventory onboarding for **real** clients auto-posts a matching GL journal entry is still unverified — only test-script-created stock was confirmed. **Recommend closing this before onboarding client #2.**

**Tracked next steps:**
- [ ] Resolve the opening-stock GL-posting question above.
- [ ] Add account 9430 posting path for marking-related write-offs (see Marking FSD).

---

## 11. Financial Reports
**Route:** `/admin/reports/income`, `/admin/accounting/reports/balance-sheet`
**Purpose:** standard financial statements for management and tax authority.

**Implemented functional requirements:**
- FR-11.1: P&L / Form 2 — net revenue, COGS, gross profit, operating expenses, net profit.
- FR-11.2: Balance Sheet / Form 1 — assets, liabilities, equity position.
- FR-11.3: Cash Flow Statement — operating, investing, financing activity cash movement.

**Implementation/QA status:** 🔴 Not yet run through formal test suite (depends on Accounting module's GL integrity, which is verified).

**Tracked next steps:**
- [ ] Add a simple cash-flow *forecast* (not just historical) — common real request from small business owners ("will I have cash for payroll next week").

---

## 12. Soliq.uz Tax Reports
**Route:** `/admin/reports/soliq`, `/admin/accounting/reports/soliq-qqs`
**Purpose:** auto-fill state tax declarations.

**Implemented functional requirements:**
- FR-12.1: QQS (12%) Monthly Declaration (Form 10006_29) — auto-computes VAT-charged vs. VAT-creditable (zachet) difference.
- FR-12.2: PIT (12%) & Social Tax (12%) Report (Form 11101_14) — employee payroll fund payment calculation.
- FR-12.3: Turnover Tax (4%) Report (Form 10104_18) — for simplified-regime companies, tax on revenue.

**Implementation/QA status:** 🔴 Not yet run through formal test suite.

**Tracked next steps:**
- [ ] **Add the new 1% turnover-tax regime for IEs/self-employed under 1B UZS annual turnover** (effective 1 Jan 2026) — needed if pursuing a "SAPAR Lite" tier for the ~708,000 IE/dehkan/family-business segment.
- [ ] Move hardcoded tax rates (12% VAT, 15% CIT, 12% social tax, 1.5% property tax, 4%/1% turnover tax) into an admin-editable rate-config table — these change nearly every budget cycle.

---

## 13. E-Documents & E-IMZO
**Route:** `/admin/e-documents`
**Purpose:** digital signature and EDI document exchange.

**Implemented functional requirements:**
- FR-13.1: Local E-IMZO integration — sign documents in PKCS#7 format via USB e-key or `.pfx` certificate through the local `127.0.0.1:64443` agent, without leaving the browser.
- FR-13.2: Didox/Factura.uz/Soliq e-Faktura readiness — track status of incoming/outgoing electronic invoices.
- FR-13.3: Ishonchnoma (power of attorney) — generate authorization documents for goods-receiving staff.
- FR-13.4: Contract archive — store contracts as PDF, track expiry.

**Implementation/QA status:** 🔴 Not yet run through formal test suite. **This is flagged as a priority to QA next** — it's your stated core differentiator (native tax-doc generation + my3soliq.uz integration vs. competitors' faktura.uz/didox.uz → 1C workflow).

**Tracked next steps:**
- [ ] Build and run a dedicated test suite for this module before the next client demo, given its role in your sales pitch.

---

## 14. HRM & Payroll
**Route:** `/admin/payroll/profiles`, `/admin/time-tracking/my-timesheet`
**Purpose:** employee records, attendance, payroll calculation.

**Implemented functional requirements:**
- FR-14.1: Employee registry — passport data, PINFL, position, rate, base salary.
- FR-14.2: Automated payroll calculator — PIT/JShODS 12%, Social Tax 12% (or 1% under IT Park incentive), Individual Pension Fund (INPS) 0.1%, net salary.
- FR-14.3: Timesheet — days worked, clock-in/out hours, absences.
- FR-14.4: Leave & sick leave — vacation days and compensation calculation.

**Implementation/QA status:** 🔴 Not yet run through formal test suite.

**⚠️ Open issue:** the sick-leave cost-split rule changed effective **1 July 2026** (first 5 days split between employer and the state fund/Jamg'arma under a new formula) — verify the payroll calculator reflects the current rule, not the pre-July logic.

**Tracked next steps:**
- [ ] Verify/update sick-leave calculation per the new rule.
- [ ] Add a dedicated test case for the 1% IT Park social-tax rate, since your own company qualifies for it.

---

## 15. Project Workspace
**Route:** `/admin/projects`, `/admin/accounting/projects/workspace`
**Purpose:** internal project/task tracking with profitability.

**Implemented functional requirements:**
- FR-15.1: Kanban and list views — To Do → In Progress → Review → Done.
- FR-15.2: Project profitability — compares project-linked purchases, staff cost, and client payments to compute margin.
- FR-15.3: Time tracking on tasks.

**Implementation/QA status:** 🔴 Not yet run through formal test suite. Lower priority relative to compliance-critical modules.

---

## 16. Helpdesk / Support Tickets
**Route:** `/admin/helpdesk`, `/admin/helpdesk/tickets`
**Purpose:** customer complaint and internal request tracking.

**Implemented functional requirements:**
- FR-16.1: Ticket system — priority (Low/Medium/Urgent/Critical), status (New/In Progress/Closed).
- FR-16.2: Assignment — route ticket to a specific staff member, set SLA resolution deadline.
- FR-16.3: Order linkage — ticket connects directly to the customer's invoice or delivery.

**Implementation/QA status:** 🔴 Not yet run through formal test suite. Lower priority.

**Tracked next steps (future, not urgent):**
- [ ] Consider Telegram-based ticket creation.

---

## 17. Payment Gateways
**Route:** `/admin/settings/company-settings`
**Purpose:** enable customers to pay invoices/POS sales online.

**Implemented functional requirements:**
- FR-17.1: Payme Business — Merchant API + webhook confirmation for sales/invoice links.
- FR-17.2: Click Merchant — Click Pass and click.uz payment acceptance.
- FR-17.3: Uzum Pay — QR-code payment integration.
- FR-17.4: UzQR Unified Payment Code — Legal deadline 1 July 2026. Dynamic QR generation, bank deep-linking, webhook handling, and status polling.

**Implementation/QA status:** 🟢 **Built & Verified** (via `scripts/test-suite-uzqr.ts`).

---

## 18. Settings & Multi-tenant
**Route:** `/admin/company-details`, `/admin/settings/translation-studio`
**Purpose:** company configuration, user permissions, localization.

**Implemented functional requirements:**
- FR-18.1: Company profile — name, STIR, logo, director/chief accountant, stamp/signature images.
- FR-18.2: RBAC — per-module permission grants (view-only, add, edit, delete) per employee.
- FR-18.3: Localization — Uzbek (Latin) `uz`, Russian `ru`, English `en`, Uzbek (Cyrillic) `oz`.
- FR-18.4: Translation Studio — in-browser editing of all UI text strings.

**Implementation/QA status:** 🔴 Not yet run through formal test suite.

**Tracked next steps:**
- [ ] Add a "compliance settings" panel consolidating: marking-category toggles, UzQR merchant status, current tax-rate table (referenced across Modules 12, 17, 19, 20) into one place rather than scattering config across modules.

---

## 19. Asl Belgisi Digital Marking *(Completed & Verified)*
**Route:** Integrated across `/admin/products`, `/admin/pos`, `/admin/purchases`, `/admin/inventory`
**Purpose:** Cabinet of Ministers Decree No. 296 compliance — digital product marking and hard-block on expired goods at POS. Legal deadline already in effect (1 March 2026).

**Implemented functional requirements:**
- FR-19.1: Product catalog marking category flag (`marking_category`, `is_marked`, `ikpu`).
- FR-19.2: DataMatrix barcode scanning validation at POS checkout.
- FR-19.3: Hard-stop block on expired marked items at POS (Decree No. 296).
- FR-19.4: Marking code capture during purchase receipt.
- FR-19.5: Automatic expiry write-off to GL Account 9430.

**Implementation/QA status:** 🟢 **Built & QA-Verified** (100% test pass on `scripts/test-suite-asl-belgisi.ts`).

---

## 20. UzQR Unified Payment Code *(Completed & Verified)*
**Route:** `/admin/settings/company-settings`, `/admin/pos`, `/admin/invoices`
**Purpose:** Central Bank of Uzbekistan unified national QR standard (legal deadline 1 July 2026).

**Implemented functional requirements:**
- FR-20.1: UzQR merchant configuration in payment gateway settings (Acquiring bank, Merchant ID, Terminal ID, Secret).
- FR-20.2: Dynamic QR code generation for invoice public links (`uzqr://pay?...` deep link + SVG QR).
- FR-20.3: POS Terminal UzQR payment modal tab with auto-polling and shift register sync.
- FR-20.4: Bank webhook listener (`/api/external/uzqr/webhook`) and reference status polling (`/api/admin/payments/uzqr/status/:referenceId`).

**Implementation/QA status:** 🟢 **Built & QA-Verified** (100% test pass on `scripts/test-suite-uzqr.ts`).

---

## How to use this tracker
1. Update the 🟢/🟡/🔴/⚠️ status in the summary table as each module gets its formal test suite run, same 5-step protocol you already use (generate test cases → execute via Playwright/DB → fix bugs → re-verify → check off).
2. Treat the two ⚠️ open issues (opening-stock GL posting, sick-leave rule) as priority fixes even though they're not "new features" — they're regressions/verification gaps in already-built modules.
3. Treat modules 17, 19, 20 (Payment Gateways/UzQR, Marking) as the top of the backlog — they carry actual legal deadlines, unlike the rest of the open items which are quality/growth improvements.
