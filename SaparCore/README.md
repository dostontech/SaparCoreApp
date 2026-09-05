# SAPAR — Core Fintech & ERP Application (Uzbekistan & Central Asia)

B2B SaaS Platform Automating Internal Audit, Tax Risk Prevention & Financial Health Diagnostics for SMEs.  
Official Submission for the **President Tech Award 2026** (Category: **Fintech** / Best Startup Project).

---

## 🏛️ Architecture Overview

The core application consists of two decoupled, high-performance layers:

### 1. `sapar-typescript-backend/`
- **Runtime & Language**: Node.js 22 LTS + Express + TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Fintech & Audit Engine**:
  - **Automated Internal Audit (Tally Check)**: Subledger-to-GL continuous reconciliation for Accounts Receivable, Accounts Payable, and Bank Accounts.
  - **Uzbekistan National Accounting Standards (NAS 21 / BHMS)**: 40-account General Ledger engine with real-time **1-shakl (Balance Sheet)** and **2-shakl (P&L)** generation.
  - **Soliq.uz Tax Compliance**: Automated declarations for **QQS 12% (Form 10006_29)**, **JShODS & Social Tax (Form 11101_14)**, and **Turnover Tax 4% (Form 10104_18)** with MXIK/IKPU validation.
  - **National Payment Integrations**: Central Bank UzQR unified QR, Payme Business, Click Merchant, Uzum Pay, and 1C:ClientBank automated statement parser.
  - **Digital Signatures**: Native browser integration with state E-IMZO PKCS#7 signing agent.

### 2. `sapar-typescript-frontend/`
- **Framework & UI**: React 19 + Vite + Tailwind CSS v4 + Redux Toolkit
- **Executive Diagnostics**:
  - Real-time financial dashboards displaying profit margins, cash positions, and tax liabilities.
  - Tally Check visual reconciliation interface with divergence detection.
  - Form 1 and Form 2 national financial statement viewers.
  - Touchscreen POS terminal with dynamic UzQR checkout modal and fiscal receipt generation.
- **Localization**: Native support for Uzbek (Latin & Cyrillic), Russian, and English.

---

## 🔄 Continuous Integration & Automated Cloud Deployment

* **GitHub Actions CI/CD Pipeline** (`.github/workflows/ci.yml`):
  - Every push to `main` automatically runs backend and frontend TypeScript build validation.
  - **Automated CI Vitest Suite**: Executes 109 automated regression tests verifying double-entry ledger balance, multi-currency accounting, tax calculations, and inventory cost adjustments.
  - **Standalone Regulatory Test Suites** (`scripts/test-suite-*`): Dedicated verification scripts for Decree No. 296 digital marking, Central Bank UzQR, E-IMZO PKCS#7 signing, and Soliq tax filing.
  - Verifies production Docker container builds for API and Web services.
* **Production Deployment**:
  - Live staging and production instances are continuously deployed to **Render** via automated GitHub webhooks on merge to `main`.
  - Sensitive environment variables are injected via isolated cloud secret vaults.

---

## 🧭 Code Review & Navigation Guide (For Award Evaluators)

| Evaluated Module | Key Implementation Files | Architectural Highlights & What To Review |
|---|---|---|
| **1. Automated Internal Audit (Tally Check)** | • [`controllers/accountingReportController.ts`](./sapar-typescript-backend/controllers/accountingReportController.ts)<br>• [`TallyCheckReport.tsx`](./sapar-typescript-frontend/src/pages/admin/accounting/reports/TallyCheckReport.tsx) | **Continuous Subledger vs. GL Audit**: Real-time cross-verification of Accounts Receivable vs. open invoices, Accounts Payable vs. open supplier bills, and Bank account balances vs. GL control accounts with automated `Tied` / `Diverges` flags. |
| **2. Soliq.uz Tax Risk Engine** | • [`controllers/soliqTaxReportsController.ts`](./sapar-typescript-backend/controllers/soliqTaxReportsController.ts)<br>• [`SoliqQqsReport.tsx`](./sapar-typescript-frontend/src/pages/admin/accounting/reports/SoliqQqsReport.tsx)<br>• [`SoliqJshodsReport.tsx`](./sapar-typescript-frontend/src/pages/admin/accounting/reports/SoliqJshodsReport.tsx) | **Automated Official Soliq Declarations**: Live calculation of QQS (VAT 12% — Form 10006_29), JShODS & Social Tax (12% + 12% + 0.1% INPS — Form 11101_14), and Turnover Tax (4% — Form 10104_18) with mandatory MXIK / IKPU code validation. |
| **3. BHMS 21 General Ledger (NAS 21)** | • [`controllers/bhmsAccountingController.ts`](./sapar-typescript-backend/controllers/bhmsAccountingController.ts)<br>• [`lib/ledger/ledgerPosting.ts`](./sapar-typescript-backend/lib/ledger/ledgerPosting.ts)<br>• [`UzbekistanFinancialReportsPage.tsx`](./sapar-typescript-frontend/src/pages/admin/accounting/UzbekistanFinancialReportsPage.tsx) | **National Chart of Accounts & Statements**: Strict double-entry accounting engine under 21-son BHMS. Instant generation of **1-shakl (Buxgalteriya Balansi)** and **2-shakl (Moliyaviy Natijalar Toʻgʻrisida Hisobot)**. |
| **4. Central Bank UzQR & National Payments** | • [`services/uzqrService.ts`](./sapar-typescript-backend/services/uzqrService.ts)<br>• [`controllers/uzbekPaymentGatewaysController.ts`](./sapar-typescript-backend/controllers/uzbekPaymentGatewaysController.ts)<br>• [`UzQrCheckoutModal.tsx`](./sapar-typescript-frontend/src/pages/admin/pos/UzQrCheckoutModal.tsx) | **Unified Payment Infrastructure**: Dynamic UzQR Central Bank specification generator, webhook processors for Payme Business, Click Merchant, Uzum Pay, and real-time POS checkout polling. |
| **5. Automated Bank Statement Reconciliation** | • [`controllers/bankTransactionController.ts`](./sapar-typescript-backend/controllers/bankTransactionController.ts) | **1C:ClientBank Statement Parsing**: Automated statement ingestion for Ipak Yoʻli Bank, Kapitalbank, Anorbank, Agrobank, and Hamkorbank with auto-reconciliation against ledger cash accounts. |
| **6. E-IMZO State Digital Cryptography** | • [`services/eimzoService.ts`](./sapar-typescript-frontend/src/services/eimzoService.ts)<br>• [`controllers/eimzoController.ts`](./sapar-typescript-backend/controllers/eimzoController.ts) | **Native Digital Signatures**: Direct browser communication with state cryptographic agent (`127.0.0.1:64443`) for PKCS#7 signing using national `.pfx` keys and USB e-tokens. |
| **7. Executive Financial Health Dashboards** | • [`FinanceDashboard.tsx`](./sapar-typescript-frontend/src/pages/admin/dashboard/FinanceDashboard.tsx)<br>• [`AccountsDashboard.tsx`](./sapar-typescript-frontend/src/pages/admin/dashboard/AccountsDashboard.tsx) | **Real-Time C-Level Analytics**: Real-time solvency tracking, gross/net margins, working capital diagnostics, and automated financial health indicators. |
| **8. Multi-Tenant Enterprise Data Layer** | • [`prisma/schema.prisma`](./sapar-typescript-backend/prisma/schema.prisma)<br>• [`lib/tenantScope.ts`](./sapar-typescript-backend/lib/tenantScope.ts) | **Data Security & Tenant Isolation**: Comprehensive PostgreSQL relational schema with row-level tenant enforcement, ACID guarantees, and audit logging on all financial mutations. |

---

## 🚀 Local Development Setup

### 1. Backend Service
```bash
cd sapar-typescript-backend

# 1. Prepare environment
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Synchronize database schema
npx prisma db push

# 4. Run development server (http://localhost:3005)
npm run dev
```

### 2. Frontend Application
```bash
cd sapar-typescript-frontend

# 1. Prepare environment
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run development server (http://localhost:5173)
npm run dev
```

---

## 👥 Project Information & Team

- **Platform**: [sapar.uz](https://sapar.uz)
- **Award**: President Tech Award 2026 (Fintech / Best Startup Project)
- **Region**: Namangan, Republic of Uzbekistan 🇺🇿
- **Team**:
  - **Abdulboriyev Dostonbek** — Manager, FullStack Developer, AI Engineer
  - **Tukhtasinov Zoirbek** — Data Engineer
  - **Sharofiddinov Ulug'bek** — Audit and Tax Specialist

---

## 📄 License
Copyright © 2026 SAPAR Technologies. All rights reserved.
