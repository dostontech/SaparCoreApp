# Plan: SAPAR ERP Sidebar Navigation Modernization & UX Overhaul

## Problem Statement
The current sidebar is cluttered and hard to navigate because:
1. **Deep, 3-level nested collapsibles**: Items like `Accounting -> Financial Statements -> Reports` and `Reports -> Transaction Reports -> Sales` create excessive clicking and visual clutter.
2. **Legacy foreign tax items**: Contains outdated non-Uzbekistan tax menus (`GSTR-1`, `GSTR-3B`, `IRN`).
3. **Scattered domain items**: E-Hujjatlar, Vehicles, Petty Cash, and Reports are scattered across unrelated collapsibles without clear business boundaries.
4. **Lack of visual domain separation**: No clear section headers/groupings for Core, Trade, Finance, HRM, and Administration.

---

## Proposed Modern Sidebar Architecture

We will organize the navigation into **5 clear, distinct business modules** with clean 1-level expandable groups, elegant badges, and standard Uzbekistan terminology:

```
┌──────────────────────────────────────────────────────────┐
│  SAPAR ERP                                               │
├──────────────────────────────────────────────────────────┤
│  ASOSIY (CORE)                                           │
│  ├── 📊 Bosh sahifa (Dashboard)                          │
│  ├── 📜 E-Hujjatlar (E-Faktura, TTN, Ishonchnoma)        │
│  └── 👥 Kontaktlar (CRM: Mijozlar & Ta'minotchilar)       │
├──────────────────────────────────────────────────────────┤
│  SAVDO VA XARID (COMMERCE & OPERATIONS)                  │
│  ├── 🛒 Savdo (Invoices, Quotations, Credit Notes, TTN)  │
│  ├── 🛍️ Xaridlar (Purchase Orders, Invoices, Debits)     │
│  └── 📦 Ombor va Tovarlar (Items, Categories, FIFO Stock)│
├──────────────────────────────────────────────────────────┤
│  MOLIYA VA BUXGALTERIYA (FINANCE & ACCOUNTING)           │
│  ├── 🏦 Bank va Kassa (Bank, Petty Cash, Expenses)       │
│  ├── 📒 Buxgalteriya (Chart of Accounts, Provodkalar)    │
│  └── 📈 Moliyaviy Hisobotlar (P&L, Balans, QQS / Soliq)  │
├──────────────────────────────────────────────────────────┤
│  HRM & PAYROLL (XODIMLAR)                                │
│  ├── 💼 Ish haqi (Pay Runs, Payroll Profiles)            │
│  └── ⏱️ Davomat va Ta'tillar (Timesheet, Leaves)         │
├──────────────────────────────────────────────────────────┤
│  SOZLAMALAR & MA'MURIYAT (SETTINGS & ADMIN)              │
│  ├── 🛡️ Foydalanuvchilar va Rollar (Users & Roles)       │
│  └── ⚙️ Tizim Sozlamalari (E-IMZO, Organization, Bank)   │
└──────────────────────────────────────────────────────────┘
```

---

## Detailed Menu Items Breakdown

### 1. 🏢 ASOSIY (Core)
- **Dashboard** (`/admin`)
- **E-Hujjatlar (E-Faktura)** (`/admin/e-documents`) *(E-Faktura, Yukxati/TTN, Ishonchnoma, Akt sverki)*
- **Kontaktlar / CRM** (`/admin/contacts`)

---

### 2. 🛒 SAVDO VA OPERATSIYALAR (Sales & Operations)
- **Savdo (Sales)**:
  - Hisob-fakturalar (Invoices) (`/admin/invoices`)
  - Davriy fakturalar (Recurring Invoices) (`/admin/recurring-invoices`)
  - Tijorat takliflari (Quotations) (`/admin/quotations`)
  - Kredit-notalar (Credit Notes) (`/admin/credit-notes`)
  - Yuk xatlari (Delivery Challans / TTN) (`/admin/delivery-challans`)
- **Xaridlar (Purchases)**:
  - Xaridlar roʻyxati (Purchases) (`/admin/purchases`)
  - Xarid buyurtmalari (Purchase Orders) (`/admin/purchase-orders`)
  - Debet-notalar (Debit Notes) (`/admin/debit-notes`)
  - Yetkazib beruvchilar hisob-kitobi (Supplier Balances) (`/admin/supplier-balances`)
- **Ombor va Tovarlar (Inventory & Catalog)**:
  - Tovarlar va Xizmatlar (Products & Services) (`/admin/products`)
  - Kategoriyalar (Categories) (`/admin/categories`)
  - Ombor qoldiqlari (Stock Inventory) (`/admin/inventory`)
  - FIFO tannarx qatlamlari (FIFO Cost Layers) (`/admin/inventory/cost-layers`)

---

### 3. 💰 MOLIYA VA BUXGALTERIYA (Finance & Accounting)
- **Bank va Kassa (Cash & Banking)**:
  - Bank hisoblari va Tranzaksiyalar (`/admin/banking`)
  - Bank akt sverkalari (Reconciliation) (`/admin/banking/reconciliation`)
  - Xarajatlar (Expenses) (`/admin/expenses`)
  - Kassa (Petty Cash / Naqd pul) (`/admin/petty-cash`)
- **Buxgalteriya (Accounting)**:
  - Hisoblar rejasi (Chart of Accounts) (`/admin/accounting/chart-of-accounts`)
  - Jurnallar va Provodkalar (Journal Entries) (`/admin/accounting/journal-entries`)
  - Moliyaviy davrlar (Periods) (`/admin/accounting/periods`)
  - Byudjetlar (Budgets) (`/admin/accounting/budgets`)
  - Asosiy vositalar (Fixed Assets) (`/admin/accounting/fixed-assets`)
- **Moliyaviy Hisobotlar (Financial Statements & Tax)**:
  - Moliyaviy natijalar / P&L (2-shakl) (`/admin/accounting/reports/profit-loss`)
  - Buxgalteriya balansi (1-shakl) (`/admin/accounting/reports/balance-sheet`)
  - Aylanma vedomost / Oborotka (Trial Balance) (`/admin/accounting/reports/trial-balance`)
  - Qarzlar tahlili (AR/AP Aging) (`/admin/accounting/reports/ar-aging`)
  - Soliq va QQS hisoboti (Tax Summary & Soliq) (`/admin/accounting/reports/tax-summary`)

---

### 4. 👥 HRM & PAYROLL (Xodimlar va Ish haqi)
- **Ish haqi (Payroll)**:
  - Xodimlar profillari (Payroll Profiles) (`/admin/payroll/profiles`)
  - Oylik hisoblash va Toʻlovlar (Pay Runs) (`/admin/payroll/runs`)
- **Davomat va Ta'tillar (Time & Attendance)**:
  - Ish vaqti tabeli (Timesheets) (`/admin/time-tracking/my-timesheet`)
  - Tabel tasdiqlash (Timesheet Approvals) (`/admin/time-tracking/approvals`)
  - Ta'tillar va Ruxsatnomalar (Leave Management) (`/admin/leave/my-leave`)
  - Bayramlar taqvimi (Holidays) (`/admin/leave/holidays`)

---

### 5. ⚙️ TIZIM VA SOZLAMALAR (Settings & Admin)
- **Ma'muriyat (Administration)**:
  - Foydalanuvchilar (Users) (`/admin/users`)
  - Rollar va Ruxsatlar (Roles & Permissions) (`/admin/roles`)
  - Xavfsizlik va Audit jurnali (Activity Log) (`/admin/activity-log`)
- **Sozlamalar (System Settings)**:
  - E-IMZO va E-Faktura sozlamalari (`/admin/settings/edi-settings`)
  - Korxona rekvizitlari (Company Settings) (`/admin/settings/company-settings`)
  - Valyutalar va Lokalizatsiya (`/admin/settings/localization`)
  - Bildirishnomalar va Email (`/admin/settings/email-settings`)

---

## Key Improvements
1. **Eliminates deep 3-level nesting**: Everything is accessible within 1 click or 1 collapse expand.
2. **Removes foreign tax debris**: Purges all obsolete India GST (`GSTR-1`, `GSTR-3B`) links.
3. **Uzbekistan standards native**: Clean, intuitive naming matching standard business operations.
4. **Visual section headers**: Distinct uppercase section dividers (`ASOSIY`, `SAVDO VA XARID`, `MOLIYA`, `XODIMLAR`, `SOZLAMALAR`).

---

## Verification Plan
1. Rebuild frontend bundle with `npm run build`.
2. Re-test Docker container at `http://localhost:8080`.
3. Verify every menu link and permission slug works smoothly without broken links.
