# SAPAR ERP — Functional Specification Documents Index

> **Codebase scanned:** `SaparCore/` · React 19 + Vite + Tailwind v4 frontend · Node/Express + TypeScript + Prisma/PostgreSQL backend.
> **Documents generated:** 2026-08-23
> **Total modules:** 16
> **Files in this directory:** 16 FSDs + this index

---

## Module Quick Reference

| # | Module | FSD | Backend persistence | Frontend screens |
|---|--------|-----|-------------------|-----------------|
| 1 | [CRM](./crm.md) | crm.md | Contacts: Prisma · Deals: Prisma (`CrmDeal`) | 5 screens |
| 2 | [HRM + Payroll](./hrm-payroll.md) | hrm-payroll.md | PayRun/Timesheet/Leave: Prisma | 11 screens |
| 3 | [Accounting + Finance](./accounting.md) | accounting.md | GL/CoA/Budgets/FixedAssets: Prisma | 15+ screens |
| 4 | [Invoicing + Sales](./invoicing.md) | invoicing.md | Invoice/Payment/Recurring: Prisma | 10 screens |
| 5 | [Purchases + Expenses](./purchases.md) | purchases.md | Purchase/Expense/PettyCash: Prisma | 12 screens |
| 6 | [Inventory](./inventory.md) | inventory.md | Product/Inventory/CostLayer: Prisma | 5 screens |
| 7 | [POS](./pos.md) | pos.md | PosShift/PosReceipt/Invoice: Prisma | 2 screens |
| 8 | [Projects + Time Tracking](./projects.md) | projects.md | Project/Timesheet/Leave: Prisma · Tasks: Prisma (`ProjectTask`) | 5 screens |
| 9 | [Helpdesk](./helpdesk.md) | helpdesk.md | Tickets: Prisma (`SupportTicket` & `TicketMessage`) | 1 screen |
| 10 | [Banking + Reconciliation](./banking.md) | banking.md | BankDetail/Transaction/Reconciliation: Prisma | 9 screens |
| 11 | [E-IMZO + E-Documents](./e-imzo.md) | e-imzo.md | E-Documents: Prisma (`EDocument`) | 3 screens + public portal |
| 12 | [Soliq Tax Declarations](./soliq-tax.md) | soliq-tax.md | Computed from GL (no dedicated model) | 1 screen |
| 13 | [UZ Payment Gateways](./uz-payments.md) | uz-payments.md | Config only (stub) | 1 screen |
| 14 | [AI Features](./ai.md) | ai.md | AiConfig/AiChatSession/AiUsageLog: Prisma | 3 screens |
| 15 | [Auth + RBAC](./auth-rbac.md) | auth-rbac.md | User/Role/Permission: Prisma | 9 screens |
| 16 | [Settings + Localization](./settings.md) | settings.md | CompanySettings/EmailSettings: Prisma | 14 screens |

---

## QA Test Suites & Production Readiness

- **[Production Readiness Master Checklist](../production-checklist.md)** — Consolidated master roadmap, module QA progression, infrastructure drills, and go-live deployment checklist.
- **[POS Manual QA Checklist](./pos-test-cases.md)** — 45-point test suite covering cashier shifts, barcode scanning, cart calculations, split payments, thermal receipts, offline resilience, and kill/restart persistence.
- **[Inventory Manual QA Checklist](./inventory-test-cases.md)** — 39-point test suite covering catalogue classification, WAC/FIFO costing, stock deprivations, zero/negative stock guards, adjustments, returns, multi-warehouse transfers, and POS atomic stock deductions.
- **[Accounting & General Ledger QA Checklist](./accounting-test-cases.md)** — 40-point test suite covering Chart of Accounts, manual journal entries, trial balance (Oborotka), P&L (2-shakl), Balance Sheet (1-shakl), fixed assets, period locking, and cross-module POS/Inventory reconciliation.
- **[Invoicing & Sales QA Checklist](./invoicing-test-cases.md)** — 18-point test suite covering invoice creation, 12% QQS calculation, multi-currency invoices, partial/full payment lifecycles, account credit redemptions, quotations, recurring invoices, and public link sharing.
- **[Purchases & Expenses QA Checklist](./purchases-test-cases.md)** — 14-point test suite covering Purchase Orders, 1-Click PO $\to$ Purchase conversion, 12% input QQS, FIFO cost layer generation, supplier AP aging, and Petty Cash (*Kassa*).
- **[Banking & Reconciliation QA Checklist](./banking-test-cases.md)** — 9-point test suite covering multi-bank account management (UZS/USD), double-entry transaction flows (`DEPOSIT`/`WITHDRAWAL`), auto-explain categorization, and bank statement reconciliation.
- **[CRM & Sales Pipeline QA Checklist](./crm-test-cases.md)** — 8-point test suite covering unified contacts with Uzbekistan STIR support, 6-stage visual sales Kanban pipeline, deal progression, and win-rate analytics.
- **[Auth & RBAC QA Checklist](./auth-rbac-test-cases.md)** — 30-point test suite covering JWT lifecycle, zero-leakage tenant isolation, owner/staff hierarchy, RBAC route permission gating, invitations, and Uzbekistan phone OTP/E-IMZO challenge.
- **[HRM & Payroll QA Checklist](./hrm-payroll-test-cases.md)** — 10-point test suite covering Uzbekistan statutory deductions (12% JShODS, 12% Social, 0.1% INPS), monthly Tabel attendance matrix, leave accruals, and GL payroll posting.
- **[Project Management QA Checklist](./projects-test-cases.md)** — 4-point test suite covering project workspaces, multi-stage task boards (TODO, IN_PROGRESS, REVIEW, DONE), task assignments, and progress tracking.
- **[Customer Support & Helpdesk QA Checklist](./helpdesk-test-cases.md)** — 4-point test suite covering customer ticket lifecycles, priority queues, staff conversation logs, and resolution workflows.

---

## Critical Cross-Cutting Gaps

### ✅ In-Memory Modules — Migrated to PostgreSQL (100% Persisted)

All previously in-memory modules have been migrated to dedicated Prisma models and persistent PostgreSQL storage:

| Module | Entity Model | Status |
|--------|-------------|:------:|
| CRM | `CrmDeal` | 🟢 Persisted in PostgreSQL |
| E-Documents | `EDocument` | 🟢 Persisted in PostgreSQL |
| Helpdesk | `SupportTicket`, `TicketMessage` | 🟢 Persisted in PostgreSQL |
| Projects | `ProjectTask` | 🟢 Persisted in PostgreSQL |

### 🔴 Mock Government API Integrations

| Integration | Status |
|---|---|
| Soliq.uz declaration submission | Mock protocol — no real API call |
| E-IMZO PKCS#7 cryptographic verification | Structural check only — no CA chain verification |
| Didox / Factura.uz EDI operator | Not implemented |
| Payme / Click / Uzum payment gateways | Stubs — no API call |
| Uzbekistan bank statement APIs | Stubs — CSV import only |
| CBU exchange rate auto-fetch | Manual entry only |

### 🟡 Schema Issues Requiring Migration

| Issue | Modules affected |
|---|---|
| `Product.code` and `Product.barcode` globally unique (should be per-tenant) | Inventory, POS |
| `MXIK/IKPU` code field missing from `Product` model | Inventory, POS, E-Documents |
| Invoice/Purchase `items` stored as JSON blob (not normalized rows) | Invoicing, Purchases |
| Stale Prisma generated client (cast workarounds in Payroll controllers) | HRM/Payroll |
| `User.stir` field missing (E-IMZO auth, E-Documents) | Auth, E-IMZO |
| Employer Ijtimoiy Soliq (12%) not auto-posted to GL | HRM/Payroll, Soliq Tax |

---

## Technology Stack

- **Backend:** Node.js 20 + Express + TypeScript + Prisma ORM + PostgreSQL
- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Auth:** JWT (HS256) + bcrypt passwords + E-IMZO PKCS#7 + SMS OTP
- **GL Engine:** Custom `lib/ledger/` double-entry posting engine
- **AI:** Anthropic Claude / OpenAI GPT-4o (BYOK, configurable)
- **File uploads:** Multer → local disk (path stored in DB)
- **Email:** SMTP / Resend / SendGrid (configurable per tenant)

## Key Architectural Patterns

1. **Tenancy via `requireUserId(req)`** — resolves to `ownerId || userId`, all queries filter by this
2. **Auto-posting GL** — every financial event posts double-entry via `lib/ledger/postJournalEntry`
3. **Idempotent posting** — `@@unique([userId, sourceType, sourceId, event])` on `JournalEntry` prevents duplicates
4. **LedgerAccountMapping** — semantic role keys map to tenant CoA accounts (decoupled from CoA structure)
5. **`movedBankBalance` flag** — determines whether voiding a payment reverses the bank register
6. **Soft delete** — `isDeleted: Boolean @default(false)` pattern used across all major models
