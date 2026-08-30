# SAPAR ERP — Engineering & Agent Workflow Guide

## 🌍 Regional Scope: Uzbekistan & Central Asia

SAPAR is built specifically for **Uzbekistan and Central Asia**. All legacy foreign tax regimes, regional currencies, and foreign datasets (India GST/UPI, UK MTD, Australia ABN, US Sales Tax) are replaced with native Uzbekistan & Central Asian standards.

### 1. Localization Standards

#### Currencies:
- **Default Currency**: `UZS` (Oʻzbekiston soʻmi — `soʻm`)
- **Regional Currencies**:
  - `KZT` (Qazaqstan tengesi — `₸`)
  - `KGS` (Qirgʻiziston somi — `с`)
  - `TJS` (Tojikiston somoniysi — `SM`)
  - `TMT` (Turkmaniston manati — `m`)
- **Foreign Trade Currencies**: `USD` (`$`), `EUR` (`€`), `RUB` (`₽`)

#### Timezones:
- **Primary**: `Asia/Tashkent` (UTC+5)
- **Regional**: `Asia/Samarkand` (UTC+5), `Asia/Almaty` (UTC+5), `Asia/Bishkek` (UTC+6), `Asia/Dushanbe` (UTC+5), `Asia/Ashgabat` (UTC+5)

#### Regions & Administrative Divisions (Uzbekistan):
1. Toshkent shahri (Tashkent City)
2. Toshkent viloyati (Tashkent Region)
3. Samarqand viloyati (Samarkand)
4. Buxoro viloyati (Bukhara)
5. Fargʻona viloyati (Fergana)
6. Andijon viloyati (Andijan)
7. Namangan viloyati (Namangan)
8. Qashqadaryo viloyati (Kashkadarya)
9. Surxondaryo viloyati (Surkhandarya)
10. Jizzax viloyati (Jizzakh)
11. Sirdaryo viloyati (Syrdarya)
12. Navoiy viloyati (Navoiy)
13. Xorazm viloyati (Khorezm)
14. Qoraqalpogʻiston Respublikasi (Republic of Karakalpakstan)

#### Tax & Legal System (Uzbekistan):
- **VAT (QQS / НДС)**: 12% standard rate (or 0% / Imtiyozli / Exempt)
- **Company Tax ID**: STIR / ИНН (9 digits)
- **Personal Tax ID / PINFL**: JShShIR / ПИНФЛ (14 digits)
- **Corporate Profit Tax (Foyda soligʻi)**: 15% (or 7.5% for SME / IT Park 0%)
- **Turnover Tax (Aylanmadan olinadigan soliq)**: 4% (flat / simplified)
- **Payroll Taxes**:
  - Income Tax (JShODS / НДФЛ): 12%
  - Social Tax (Ijtimoiy soliq): 12% (1% for IT Park / SME concessions)
  - INPS (ShJBPH / ИНПС): 0.1%

---

## 📋 Core Modules & Implementation Checklist

### 1. CRM (Customer Relationship Management)
- [x] Contacts & Companies directory (Customers, Vendors, Partners)
- [x] Customer balance & ledger statements (Akt sverki)
- [x] Multi-currency customer balances (UZS / USD / EUR)
- [ ] Visual Sales Pipeline (Leads → Opportunities → Deals Stages Kanban)
- [ ] Deal stage tracking & win/loss analytics

### 2. HRM & Payroll
- [x] Basic employee directory & user roles
- [x] Salary structure & payment recording
- [ ] Uzbekistan automated payroll calculation (JShODS 12%, Ijtimoiy soliq 12%, INPS 0.1%)
- [ ] Employee attendance & work hours tracking (Tabel)
- [ ] Vacation, sick leave & time-off management
- [ ] Hiring & onboarding pipeline

### 3. Accounting & Finance
- [x] Uzbekistan Chart of Accounts (Hisoblar rejasi)
- [x] General Ledger (Bosh kitob) & Journal Entries (Provodkalar)
- [x] Profit & Loss statement (Moliyaviy natijalar toʻgʻrisida hisobot — 2-shakl)
- [x] Balance Sheet (Buxgalteriya balansi — 1-shakl)
- [x] Trial Balance (Aylanma vedomost / Oborotka)
- [x] Multi-currency accounting & foreign exchange revaluation
- [x] Accounts Receivable & Payable aging reports
- [x] Cash register & Petty cash (Kassa / Naqd pul) management

### 4. Inventory Management
- [x] Multi-warehouse (Omborlar) management
- [x] Real-time stock levels & low stock alerts
- [x] FIFO inventory valuation
- [x] Barcode & SKU generation & scanning
- [x] Stock transfers between warehouses (Omborlararo koʻchirish)
- [x] Stock inventory audit & write-offs (Inventarizatsiya va hisobdan chiqarish)

### 5. Sales Management
- [x] Commercial Proposals / Quotations (Tijorat takliflari)
- [x] Sales Invoices (Hisob-fakturalar)
- [x] Delivery Challans / Waybills (Tovarni yetkazib berish yukxati / TTN)
- [x] Sales Credit Notes & Returns
- [x] Recurring invoices & auto-billing
- [x] Shareable public invoice & quotation links

### 6. Purchases Management
- [x] Purchase Orders (Xarid buyurtmalari)
- [x] Purchase Invoices & Expenses
- [x] Purchase Debit Notes & Returns
- [x] Supplier balance tracking & payment approvals
- [x] Expense categorization & receipt scanning

### 7. POS (Point of Sale)
- [ ] Dedicated cashier / retail POS touch interface
- [ ] Fast barcode scanning & product search
- [ ] Split payment methods (Cash + Uzcard/Humo + Credit)
- [ ] Fiscal receipt generation & offline resilience
- [ ] Cashier shifts & end-of-day X/Z reports

### 8. Project Management
- [x] Time tracking & billable hours
- [ ] Project workspace with Task Boards (Kanban / List)
- [ ] Task assignments, deadlines, and milestone tracking
- [ ] Project procurement & expense budget tracking
- [ ] Client project profitability reporting

### 9. Customer Support
- [x] WhatsApp & Email notification triggers
- [x] Activity logs & audit trails
- [ ] Helpdesk ticketing system (New, In Progress, Resolved)
- [ ] Customer conversation history linked directly to orders

### 10. Document Management (Add-on)
- [x] Digital signatures on invoices & quotes
- [x] File attachments on transactions
- [x] Act of Reconciliation (Akt sverki) automated generator
- [x] Electronic Power of Attorney (Ishonchnoma / Doverennost)
- [x] Contract management (Shartnomalar) & document templates

---

## 🏛️ Built for Uzbekistan — Specific Roadmap

- [x] **E-IMZO Digital Signature**:
  - Direct native browser agent integration (`127.0.0.1:64443` / `EimzoService`) for signing invoices, contracts, and acts with national digital certificates (`.pfx` / USB e-token) without leaving SAPAR.
- [x] **E-Faktura / Didox / Factura.uz / Soliq API**:
  - Direct in-house connector with Uzbekistan licensed EDI operators (Didox.uz, Factura.uz, Soliq E-Faktura) for generating Soliq-compliant e-invoices with MXIK/IKPU codes, sending signed PKCS#7 documents, tracking status, and auto-importing inbound supplier invoices.
- [ ] **Uzbekistan Payment & Banking Integrations**:
  - Payment Gateways: Payme Business, Click Merchant, Uzum Pay.
  - Direct Bank Statement API: Ipak Yoʻli Bank, Anorbank, Kapitalbank, Agrobank.
- [x] **State Tax Committee (Soliq) Tax Filing Reports**:
  - Automated QQS (VAT 12%) monthly declaration generator (Form 10006_29).
  - Automated JShODS & Social tax reporting generator (Form 11101_14).
  - Automated Turnover tax (Aylanmadan olinadigan soliq 4%) declaration generator (Form 10104_18).

---

## 🛠️ Tech Stack & Workflow Rules

- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL.
- **Frontend**: React (TypeScript) + Vite + Tailwind CSS v4.
- **Brand Palette**: Primary `#028090` (Teal), Accent `#02C39A` (Mint), Dark `#0B2B33` (Navy/Cyan), Light `#F0FBF8`.
- **Localization**: Uzbek (`uz`), Russian (`ru`), English (`en`).
- **All code changes must adhere to this document and preserve clean modular design.**
