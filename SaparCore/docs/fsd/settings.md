# FSD — Settings & Localization

**Module slug:** `settings`
**File:** `docs/fsd/settings.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Settings module provides per-tenant configuration for all SAPAR modules:

- **Company Profile** — legal name, STIR (9-digit TIN), address, logo, tax regime, functional currency
- **Email / SMTP** — outgoing email configuration (SMTP or Resend API)
- **Currency & Exchange Rates** — functional currency, default display currency, manual rate management
- **Localization** — language (uz/ru/en), timezone (Asia/Tashkent default), date format, number format
- **Invoice & Quotation Defaults** — default terms, footer, payment options, template
- **Approval Workflow** — enable/disable maker-checker for invoices, purchases, expenses
- **Integrations hub** — external service toggles (AI, payment gateways, E-IMZO, Xero, QuickBooks)
- **Audit Log** — read-only system activity feed

---

## 2. Data Model

### 2.1 CompanySettings

```prisma
model CompanySettings {
  id                     String   @id @default(uuid())
  userId                 String   @unique  // one per tenant
  companyName            String?
  companyTaxNumber       String?  // STIR (9 digits) — UZ Tax ID
  address                String?
  city                   String?
  state                  String?  // Viloyat / Region
  country                String?  @default("UZ")
  zip                    String?
  phone                  String?
  email                  String?
  website                String?
  logoFile               String?  // path to uploaded logo
  
  // Financial defaults
  financialYearStart     String?  // "01-01" or "01-03"
  taxType                String?  // "QQS" | "AYLANMA" | "NONE"
  functionalCurrency     String?  @default("UZS")
  defaultPaymentTermDays Int?     @default(30)
  
  // Invoice defaults
  invoicePrefix          String?  @default("INV")
  quotationPrefix        String?  @default("QUO")
  creditNotePrefix       String?  @default("CN")
  purchasePrefix         String?  @default("PUR")
  defaultInvoiceNote     String?
  defaultInvoiceTerms    String?
  invoiceTemplate        String?  @default("template-a")
  
  // Feature flags
  approvalsEnabled       Boolean  @default(false)
  twoFactorRequired      Boolean  @default(false)
  sessionTimeoutMins     Int      @default(480)
  
  // Localization
  language               String?  @default("uz")
  timezone               String?  @default("Asia/Tashkent")
  dateFormat             String?  @default("DD.MM.YYYY")
  numberFormat           String?  @default("1 000 000,00")  // UZS format
  
  // Bank auto-explain AI
  bankAutoExplainEnabled Boolean  @default(false)
  
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

### 2.2 EmailSettings

```prisma
model EmailSettings {
  id          String   @id @default(uuid())
  userId      String   @unique
  provider    String?  // "smtp" | "resend" | "sendgrid"
  host        String?
  port        Int?
  username    String?
  password    String?  // encrypted
  fromName    String?
  fromEmail   String?
  apiKey      String?  // Resend/SendGrid API key (encrypted)
  isVerified  Boolean  @default(false)
  verifiedAt  DateTime?
}
```

### 2.3 AccountingIntegration (Xero / QuickBooks)

```prisma
model AccountingIntegration {
  id            String   @id
  userId        String   @unique
  provider      String   // "xero" | "quickbooks"
  accessToken   String?  // encrypted OAuth2 token
  refreshToken  String?
  expiresAt     DateTime?
  orgId         String?
  isActive      Boolean  @default(false)
}
```

### 2.4 LedgerAccountMapping (in Settings)

```prisma
model LedgerAccountMapping {
  id        String   @id
  userId    String
  roleKey   String   // e.g. "ACCOUNTS_RECEIVABLE", "VAT_OUTPUT", "BANK", "COGS"
  accountId String
  // @@unique([userId, roleKey])
}
```

The GL role mapping is configured in Settings → Chart of Accounts → Role Mappings.

### 2.5 Counter (sequence numbers)

```prisma
model Counter {
  id     String @id
  userId String
  key    String  // "invoice" | "purchase" | "quotation" | "credit_note" | ...
  value  Int     @default(0)
  // @@unique([userId, key])
}
```

Auto-incremented per document type to generate `INV-000001`, `PUR-000001`, etc.

---

## 3. Backend

### 3.1 API Endpoints

#### Company Settings

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/settings/company` | `settingsController.ts::getCompanySettings` |
| `PUT` | `/admin/settings/company` | `settingsController.ts::updateCompanySettings` |
| `POST` | `/admin/settings/company/logo` | `settingsController.ts::uploadLogo` |

#### Email Settings

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/settings/email` | `emailSettingsController.ts::getEmailSettings` |
| `PUT` | `/admin/settings/email` | `emailSettingsController.ts::updateEmailSettings` |
| `POST` | `/admin/settings/email/test` | `emailSettingsController.ts::sendTestEmail` |

#### Exchange Rates

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/exchange-rates` | `exchangeRateController.ts::getExchangeRates` |
| `POST` | `/admin/exchange-rates` | `exchangeRateController.ts::createExchangeRate` |
| `PUT` | `/admin/exchange-rates/:id` | `exchangeRateController.ts::updateExchangeRate` |
| `GET` | `/admin/exchange-rates/latest` | latest rate per currency pair |

#### Ledger Role Mappings

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/settings/ledger-mappings` | `accountController.ts` |
| `POST` | `/admin/settings/ledger-mappings` | bulk upsert |

#### Audit Log

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/audit-log` | `auditLogController.ts::getAuditLog` |

#### Integrations

| Method | Path | Controller |
|--------|------|-----------|
| `GET/PUT` | `/admin/settings/integrations` | `accountingIntegrationController.ts` |
| `GET/PUT` | `/admin/settings/ai` | `aiConfigController.ts` |
| `GET/PUT` | `/admin/settings/uz-payments` | `uzbekPaymentGatewaysController.ts` |
| `GET/PUT` | `/admin/settings/whatsapp` | `whatsappController.ts` |

### 3.2 Business Logic

**CompanySettings onboarding:**
At first login, `CompanySettings` is created with Uzbekistan defaults:
- `country = "UZ"`
- `language = "uz"`
- `timezone = "Asia/Tashkent"`
- `dateFormat = "DD.MM.YYYY"`
- `functionalCurrency = "UZS"`
- `taxType = "QQS"` (12% VAT regime)
- `invoicePrefix = "INV"`, etc.

**Exchange rate lookup:**
When processing a multi-currency transaction, the system queries `ExchangeRate` for the `(fromCurrency, toCurrency, asOfDate <= today)` pair with `ORDER BY asOfDate DESC LIMIT 1`. If no rate found → falls back to `1.0` (same-currency assumed).

**Counter (sequence numbers):**
```typescript
const counter = await prisma.counter.upsert({
  where: { userId_key: { userId, key: 'invoice' } },
  update: { value: { increment: 1 } },
  create: { userId, key: 'invoice', value: 1 },
});
const invoiceNumber = `${settings.invoicePrefix}-${String(counter.value).padStart(6, '0')}`;
```

**Audit log:**
`AuditLog` records are created by a middleware wrapper around all write operations:
```
AuditLog { action: CREATE|UPDATE|DELETE, entityType: "Invoice", entityId, summary, changes, userId, ipAddress }
```
Provides a tamper-evident activity trail. `changes` field stores JSON diff of before/after state.

**SMTP test:**
`sendTestEmail` sends a test message to the configured `fromEmail` address. On success, marks `EmailSettings.isVerified = true`.

### 3.3 Validation Rules

- `companyTaxNumber` must be 9 digits (STIR format) — stored as string, no checksum validation
- `timezone` must be a valid IANA timezone string
- `dateFormat` must be one of the supported formats (`DD.MM.YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`)
- `language` must be one of `uz | ru | en`
- `ExchangeRate.rate > 0`
- `Counter.value` can only increment (no reset in normal operation)
- Email settings: `host` and `port` required for SMTP; `apiKey` required for Resend/SendGrid

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Company Profile | `pages/admin/settings/CompanyProfile.tsx` | `/admin/settings/company` |
| Email Settings | `pages/admin/settings/EmailSettings.tsx` | `/admin/settings/email` |
| Currency Settings | `pages/admin/settings/CurrencySettings.tsx` | `/admin/settings/currency` |
| Exchange Rates | `pages/admin/settings/ExchangeRates.tsx` | `/admin/settings/exchange-rates` |
| Invoice Settings | `pages/admin/settings/InvoiceSettings.tsx` | `/admin/settings/invoices` |
| Approval Settings | `pages/admin/settings/ApprovalSettings.tsx` | `/admin/settings/approvals` |
| User Management | `pages/admin/settings/UserManagement.tsx` | `/admin/settings/users` |
| Role Management | `pages/admin/settings/RoleManagement.tsx` | `/admin/settings/roles` |
| Payment Gateways | `pages/admin/settings/UzPaymentGatewaysPage.tsx` | `/admin/settings/uz-payments` |
| AI Settings | `pages/admin/ai/AiSettingsPage.tsx` | `/admin/settings/ai` |
| WhatsApp Settings | `pages/admin/settings/WhatsappSettings.tsx` | `/admin/settings/whatsapp` |
| Integrations | `pages/admin/settings/Integrations.tsx` | `/admin/settings/integrations` |
| Ledger Role Mappings | `pages/admin/settings/LedgerMappings.tsx` | `/admin/settings/ledger-mappings` |
| Audit Log | `pages/admin/settings/AuditLog.tsx` | `/admin/audit-log` |

### 4.2 User Flows

**Onboarding Setup:**
1. First login → redirected to Company Profile setup wizard
2. Enter: company name, STIR, address, viloyat (select from 14 UZ regions), phone, email
3. Upload logo
4. Select tax regime (QQS 12% / Aylanma 4%)
5. Confirm functional currency (UZS default)
6. Save → `PUT /admin/settings/company`

**Configure Email:**
1. Settings → Email → select provider (SMTP / Resend / SendGrid)
2. Enter credentials
3. "Test email yuborish" → sends to `fromEmail` → green checkmark on success

**Set Up Exchange Rates:**
1. Settings → Exchange Rates → "Yangi kurs" (New Rate)
2. Enter: from currency (e.g., USD), to currency (UZS), rate (e.g., 12600), as-of date
3. Save → used for all multi-currency transactions on or after that date

**Configure Ledger Role Mappings:**
1. Settings → Ledger Mappings → select role key (e.g., `ACCOUNTS_RECEIVABLE`)
2. Pick account from CoA type-ahead
3. Save → all AR postings will use this account

**Audit Log Review:**
1. Settings → Audit Log
2. Filter by date range, action type (CREATE/UPDATE/DELETE), entity type (Invoice, Payment, etc.)
3. Expand row to see `changes` JSON diff

### 4.3 Key Components

- `CompanyProfile.tsx` (32 KB): Multi-section form with logo uploader, region selector (14 Uzbekistan viloyats), STIR field, tax regime radio, financial year start.
- `ExchangeRates.tsx` (14 KB): Rate entry table with currency pair selector, rate input, as-of date picker. Latest rate highlighted.
- `LedgerMappings.tsx` (10 KB): Role key → CoA account mapping table. Pre-populated with common Uzbekistan BHMS account codes.
- `AuditLog.tsx` (12 KB): Paginated audit trail with entity type filter, user filter, and JSON diff viewer.

---

## 5. Integrations

- **All modules** read `CompanySettings` at runtime (logo for PDFs, STIR for E-Faktura, currency for formatting, language for email templates).
- **Invoicing:** `invoicePrefix` + `Counter.value` generates invoice numbers.
- **E-IMZO:** `companyTaxNumber` (STIR) is used as `sellerTin` in all E-Documents.
- **Accounting:** `LedgerAccountMapping` drives GL role key → account resolution for all journal postings.
- **Payroll:** `taxType` determines which declaration tabs are shown in `SoliqTaxReportsPage`.
- **Xero/QuickBooks:** `AccountingIntegration` stores OAuth2 tokens for cloud accounting sync (stub).

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **STIR not validated against Soliq.uz registry** | 🟡 Medium | STIR is stored as a 9-digit string without checksum or live registry validation. A lookup against the Soliq.uz business registry API would prevent typos. |
| 2 | **No CBU exchange rate auto-fetch** | 🟡 Medium | Rates must be entered manually. Central Bank of Uzbekistan (CBU) publishes daily official rates at `cbu.uz/uz/arkhiv-kursov-valyut/json/`. Should be auto-fetched daily. |
| 3 | **`dateFormat` only partially applied** | 🟡 Medium | Some frontend components format dates directly using `date-fns` without reading `CompanySettings.dateFormat`. Inconsistent date display possible. |
| 4 | **Email password not encrypted in schema** | 🔴 Critical | `EmailSettings.password` is stored as a plain string field. The schema has no annotation for encryption. Server-side encryption must be applied before DB write (unclear if it is). |
| 5 | **Xero/QuickBooks integration is stub** | 🟢 Low | `accountingIntegrationController.ts` exists but sync logic is not implemented. |
| 6 | **`financialYearStart` not enforced** | 🟢 Low | `financialYearStart` is stored but not used in any report date range calculation. All reports default to calendar year. |
| 7 | **No backup / export settings** | 🟢 Low | No data export (full database backup) or settings export/import for migration between environments. |
