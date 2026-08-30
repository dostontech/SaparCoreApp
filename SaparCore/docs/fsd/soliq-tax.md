# FSD — Soliq Tax Declarations (Uzbekistan)

**Module slug:** `soliq-tax`
**File:** `docs/fsd/soliq-tax.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Soliq Tax Declarations module generates and submits official Uzbekistan State Tax Committee (Davlat Soliq Qo'mitasi — DSQ / Soliq.uz) tax declarations:

| Declaration | Form Code | Tax | Rate |
|---|---|---|---|
| VAT Declaration (QQS hisobi) | `10006_29` | Qo'shilgan qiymat solig'i (QQS / НДС) | 12% |
| Payroll Tax Declaration (JShODS + Ijtimoiy) | `11101_14` | JShODS 12% + Ijtimoiy soliq 12% + INPS 0.1% | Mixed |
| Turnover Tax Declaration (Aylanma) | `10104_18` | Aylanmadan olinadigan soliq | 4% |

All declarations support:
- Live GL data aggregation (where Prisma models exist)
- Fallback demo data for preview
- Soliq JSON schema export (machine-readable)
- E-IMZO PKCS#7 signature for submission to Soliq.uz API
- Simulated submission protocol (registration number, QR verification URL)

---

## 2. Data Model

No dedicated Prisma models for tax declarations. Tax data is computed on-the-fly from existing accounting models:

| Data source | Used for |
|---|---|
| `Invoice` (taxableAmount, vat) | QQS outward turnover |
| `Purchase` (totalTax) | QQS deductible input VAT |
| `PayRun` + `PayRunLine` (gross, deductionLines) | JShODS/Ijtimoiy/INPS payroll tax base |
| `JournalLine` (taxRoleKey = 'VAT_OUTPUT' / 'VAT_INPUT') | GL-based VAT aggregation |
| `Account` codes 9230/9260/9270 | Payroll accounting |

---

## 3. Backend

### 3.1 API Endpoints

| Method | Path | Controller | Description |
|--------|------|-----------|-------------|
| `GET` | `/admin/soliq/qqs` | `soliqTaxReportsController.ts::getSoliqQqsDeclaration` | VAT 12% declaration data |
| `GET` | `/admin/soliq/jshods` | `soliqTaxReportsController.ts::getSoliqJshodsDeclaration` | Payroll tax declaration |
| `GET` | `/admin/soliq/aylanma` | `soliqTaxReportsController.ts::getSoliqAylanmaDeclaration` | Turnover tax 4% declaration |
| `POST` | `/admin/soliq/submit` | `soliqTaxReportsController.ts::submitSoliqDeclaration` | E-IMZO signed submission |

All GET endpoints accept `?from=YYYY-MM-DD&to=YYYY-MM-DD` query parameters (defaults to current month if omitted).

### 3.2 Business Logic

#### QQS Declaration (Form 10006_29)

**Outward supplies (Realizatsiya aylanmasi):**
```javascript
// Attempts to query Invoice table
const invoices = await prisma.invoice.findMany({ where: { isDeleted: false }, take: 50 });
grossOutwardTaxable = SUM(invoice.taxableAmount);
grossOutwardVat     = SUM(invoice.vat);   // 12% of taxableAmount
```
Falls back to hardcoded baseline (125M taxable, 15M VAT) if query fails.

**Inward supplies (Kirim aylanmasi):**
Currently uses hardcoded values: `75,000,000 UZS taxable, 9,000,000 UZS input VAT`.
Live aggregation from `Purchase.totalTax` is not implemented.

**Net VAT payable:**
```
netVatPayable = grossOutwardVat - deductibleInputVat
```
If negative → shown in row 070 (Byudjetdan qaytarish — VAT refund claim).

**Soliq boxes structure (Form 10006_29):**
| Row | Description |
|-----|-------------|
| 010 | 12% stavkada soliq solinadigan realizatsiya |
| 020 | 0% eksport aylanmasi |
| 030 | QQS dan ozod aylanmasi (Imtiyozli) |
| 040 | Jami realizatsiya + hisoblangan QQS |
| 050 | Hisobga olinadigan kirim QQS |
| 060 | Byudjetga to'lanishi lozim QQS (040 - 050) |
| 070 | Byudjetdan qaytarish (refund) |

#### JShODS Declaration (Form 11101_14)

Queries `prisma.payroll.findMany` (legacy `Payroll` model) for the period. Uses `PayRun` + `PayRunLine` if available.

**Computation:**
```
grossPayrollFund  = SUM(PayRunLine.gross)
incomeTax12       = grossPayrollFund × 12%       // JShODS — employee income tax
inpsPension01     = grossPayrollFund × 0.1%      // INPS — pension contribution
socialTax12       = grossPayrollFund × 12%       // Ijtimoiy soliq — employer social tax
netPayableSalaries = grossPayrollFund - incomeTax12 - inpsPension01
```

**Soliq boxes (Form 11101_14):**
| Row | Description |
|-----|-------------|
| 010 | Jami xodimlar soni (headcount) |
| 020 | Hisoblangan MHTF (gross payroll fund) |
| 030 | JShODS 12% (employee income tax) |
| 040 | INPS 0.1% (pension contribution) |
| 050 | Byudjetga JShODS sof = 030 - 040 |
| 060 | Ijtimoiy soliq bazasi (= gross) |
| 070 | Ijtimoiy soliq 12% |
| 080 | Byudjetga jami (050 + 070) |

#### Aylanma Tax Declaration (Form 10104_18)

For SMEs on the simplified "aylanmadan olinadigan soliq" (Turnover Tax) regime.

```
grossRevenue        = total sales revenue (hardcoded 150M UZS demo)
taxRatePercent      = 4%
calculatedTurnoverTax = grossRevenue × 4%
```

Live aggregation from `Invoice.TotalAmount` is not yet implemented.

**Soliq boxes (Form 10104_18):**
| Row | Description |
|-----|-------------|
| 010 | Jami tushum (gross revenue) |
| 020 | Imtiyozlar (exemptions) |
| 030 | Sof baza (010 - 020) |
| 040 | Soliq stavkasi (4%) |
| 050 | Hisoblangan soliq summasi |
| 060 | Byudjetga to'lanishi lozim |

#### E-IMZO Signed Submission (`submitSoliqDeclaration`)

Accepts:
- `formCode` — target declaration code
- `period` — declaration period
- `payload` — computed declaration data
- `pkcs7Signature` — base64 PKCS#7 signature from E-IMZO browser agent
- `certInfo` — signer certificate info

Returns simulated protocol:
```json
{
  "regNumber": "SOLIQ-10006_29-{random 6 digits}",
  "status": "ACCEPTED",
  "statusText": "Qabul qilindi / DSQ bazasiga kiritildi",
  "soliqQrCodeUrl": "https://soliq.uz/reports/verify/{regNumber}",
  "signer": "RAHIMOVA AZIZA BOTIROVNA (Bosh Buxgalter)",
  "tin": "309876543"
}
```

> **Note:** This is a mock response. Real submission to Soliq.uz requires valid API credentials with the State Tax Committee, proper OAuth2 token, and a certified PKCS#7 payload format.

### 3.3 Validation

- `from` and `to` query parameters parsed as ISO dates; defaults to current month 1st → today
- No server-side validation on `pkcs7Signature` content in `submitSoliqDeclaration` (mock endpoint)
- If `from > to`, no error is thrown — may produce empty results

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Soliq Tax Reports | `pages/admin/accounting/SoliqTaxReportsPage.tsx` | `/admin/soliq/reports` |

### 4.2 User Flows

**View QQS Declaration:**
1. Navigate to Accounting → Soliq Tax Reports
2. Select reporting period (date range picker)
3. System calls `GET /admin/soliq/qqs?from=...&to=...`
4. Declaration rendered in tabular form matching Form 10006_29 rows
5. Summary: output VAT, input VAT, net payable / refundable
6. "E-IMZO bilan imzolash va yuborish" (Sign and Submit) button

**Submit Declaration:**
1. Click "Imzolash" → E-IMZO browser agent opens certificate picker
2. User selects their director/accountant certificate (USB token or `.pfx`)
3. Agent signs declaration payload hash
4. Client posts to `POST /admin/soliq/submit` with PKCS#7 signature
5. Protocol response shown: registration number, QR code URL, signer name + TIN
6. User saves or prints the protocol

**View JShODS Declaration:**
1. Same flow but data source is `GET /admin/soliq/jshods`
2. Shows payroll fund, JShODS 12%, INPS 0.1%, Ijtimoiy soliq 12%, total to budget

**View Aylanma Declaration:**
1. `GET /admin/soliq/aylanma`
2. Shows gross revenue, 4% turnover tax computation
3. Only applicable for SME companies on the simplified tax regime

### 4.3 Key Components

- `SoliqTaxReportsPage.tsx` (25 KB): Tabbed interface: QQS tab, JShODS+Ijtimoiy tab, Aylanma tab. Period selector. Soliq box table. Submit panel with E-IMZO signature flow. Protocol display modal.

---

## 5. Integrations

- **GL / Invoicing:** `getSoliqQqsDeclaration` reads from `Invoice` model. For a fully live declaration, it should aggregate from `JournalLine` where `taxRoleKey = 'VAT_OUTPUT'` (outward) and `'VAT_INPUT'` (inward).
- **Payroll:** `getSoliqJshodsDeclaration` reads from `Payroll` model (legacy) and `PayRun/PayRunLine`.
- **E-IMZO:** PKCS#7 signature generated by the E-IMZO browser agent is passed to `submitSoliqDeclaration`.
- **Soliq.uz API (planned):** Real submission requires OAuth2 client credentials, signed PKCS#7 payload in Uzbekistan-standard CMS format, and a valid `tin` registered with the State Tax Committee portal.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Soliq submission is mocked** | 🔴 Critical | `submitSoliqDeclaration` returns a fake protocol. No real Soliq.uz API call. Integration with the actual DSQ API (OAuth2 + PKCS#7 multipart) is not implemented. |
| 2 | **QQS inward (input VAT) is hardcoded** | 🔴 Critical | `deductibleInputVat` is a hardcoded 9M UZS. Must aggregate from `Purchase.totalTax` or `JournalLine[taxRoleKey='VAT_INPUT']` for the period. |
| 3 | **Aylanma gross revenue is hardcoded** | 🔴 Critical | `grossRevenue = 150,000,000` is a demo constant. Must aggregate from `Invoice.TotalAmount` for the period. |
| 4 | **No tax regime selector** | 🟡 Medium | The system does not know whether the company is on QQS (VAT regime) or Aylanma (Turnover Tax) regime. Both declarations are always shown. Should be driven by `CompanySettings.taxRegime`. |
| 5 | **JShODS employer social tax not in GL** | 🟡 Medium | Ijtimoiy soliq (12% employer) is reported but not auto-posted as a separate GL expense (see hrm-payroll.md gap #1). |
| 6 | **Foyda solig'i (Corporate Profit Tax 15%) missing** | 🟡 Medium | AGENTS.md lists corporate profit tax. No declaration generator exists for Form 10100. |
| 7 | **E-IMZO PKCS#7 not cryptographically verified** | 🔴 Critical | Submission endpoint accepts any base64 string as `pkcs7Signature` without cryptographic validation. See e-imzo.md gap #3. |
| 8 | **No Soliq portal OAuth2 tokens stored** | 🟡 Medium | Real DSQ API requires per-company OAuth2 tokens. No `SoliqOAuthToken` model or credential storage exists. |
