# FSD — E-IMZO & Electronic Documents (Uzbekistan)

**Module slug:** `e-imzo`
**File:** `docs/fsd/e-imzo.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The E-IMZO & Electronic Documents module provides a complete in-house Uzbekistan electronic document management flow without mandatory reliance on third-party EDI portals:

- **E-IMZO Authentication** — login via national digital signature (USB e-token or `.pfx` certificate)
- **E-IMZO Signing** — PKCS#7 cryptographic signing of any document type
- **E-Hisob-Faktura** — Uzbekistan-compliant electronic invoices with MXIK/IKPU codes, 12% QQS, seller/buyer STIR
- **Yukxat / TTN** — Electronic waybills (tovarni yetkazib berish hujjati)
- **Ishonchnoma** — Electronic Power of Attorney (Form M-2 / M-2a)
- **Solishtirma Dalolatnoma** — Act of Reconciliation (Akt Sverki)
- **Shartnoma** — Electronic Commercial Contracts
- **Counterparty Portal** — Public signature verification and document acceptance by the receiving party
- **Didox / Factura.uz connector** — planned EDI operator integration (currently stub)

**Regional scope:** Pure Uzbekistan module. All document types, legal field names, and identifiers (STIR — 9 digits, PINFL — 14 digits, MXIK — 17 digits, MFO — 5-digit bank code) follow Uzbekistan standards.

---

## 2. Data Model

### 2.1 InHouseEDocument (in-memory, NOT persisted)

The entire E-Document module is backed by an in-memory store (`eDocumentsStore: Record<userId, InHouseEDocument[]>`) in `eDocumentController.ts`:

```typescript
interface InHouseEDocument {
  id: string;
  userId: string;
  docType: 'INVOICE' | 'WAYBILL' | 'EMPOWERMENT' | 'ACT_RECONCILIATION' | 'CONTRACT';
  docNumber: string;         // e.g. "IF-2026-0089"
  docDate: string;
  contractNumber: string;
  contractDate: string;
  title: string;
  status: 'DRAFT' | 'WAITING_COUNTERPARTY' | 'FULLY_SIGNED' | 'REJECTED';
  direction: 'OUTBOUND' | 'INBOUND';

  // Parties
  sellerName: string;
  sellerTin: string;       // STIR (9 digits)
  sellerPinfl?: string;    // PINFL (14 digits)
  sellerAddress: string;
  sellerBankAccount?: string;
  sellerBankMfo?: string;  // 5-digit MFO code

  buyerName: string;
  buyerTin: string;
  buyerAddress: string;
  buyerBankAccount?: string;
  buyerBankMfo?: string;

  // Line items
  items: EDocumentItem[];    // MXIK, packageCode, vatRate, vatSum
  subtotal: number;
  vatTotal: number;          // 12% QQS
  totalSum: number;
  currency: string;          // UZS

  // Document-type specific metadata
  metaData?: Record<string, any>;   // Akt sverki periods, Ishonchnoma authority scope
  legalArticles?: LegalArticle[];   // Contract articles

  // Digital signatures
  senderSignature?: EDigitalSignatureInfo | null;
  recipientSignature?: EDigitalSignatureInfo | null;
  rejectionReason?: string | null;

  // Security
  canonicalHash: string;    // SHA-256 of canonical JSON (for tamper detection)
  publicSignToken: string;  // UUID for counterparty access
  qrCodeUrl: string;        // https://e-hujjat.sapar.uz/verify/{id}?token={token}
}

interface EDocumentItem {
  ordNo: number;
  name: string;
  catalogCode: string;   // MXIK / IKPU — 17-digit national product classifier
  packageCode: string;   // Unit of measure code (796=dona, 006=kg, etc.)
  packageName: string;   // Unit name (dona, kg, metr, etc.)
  count: number;
  summa: number;         // Unit price
  vatRate: number;       // 12 | 0
  vatSum: number;
  totalSum: number;
}
```

> **CRITICAL GAP:** No Prisma model for E-Documents. All documents are lost on server restart.

### 2.2 E-IMZO Certificate Info

```typescript
interface EDigitalSignatureInfo {
  signedBy: string;       // Full name from certificate
  tin: string;            // STIR
  pinfl?: string;         // PINFL
  organization?: string;
  role?: string;          // e.g. "Direktor", "Bosh Buxgalter"
  serialNumber: string;   // Certificate serial
  signedAt: string;
  pkcs7Signature: string; // Base64 PKCS#7 CMS signature
  isValid: boolean;
}
```

### 2.3 Services

- `services/eimzoAuthService.ts` — Challenge-response nonce management for E-IMZO browser agent authentication
- `services/qrAuthService.ts` — QR code session management for mobile-based authentication
- `services/smsService.ts` — SMS OTP for phone-based authentication

---

## 3. Backend

### 3.1 API Endpoints

#### E-IMZO Authentication (`uzAuthController.ts`)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/uz/phone-otp/send` | Send SMS OTP to Uzbekistan phone (+998...) |
| `POST` | `/auth/uz/phone-otp/verify` | Verify OTP and authenticate |
| `POST` | `/auth/uz/phone-password/login` | Phone number + password login |
| `GET` | `/auth/uz/eimzo/challenge` | Issue PKCS#7 nonce challenge |
| `POST` | `/auth/uz/eimzo/verify` | Verify E-IMZO PKCS#7 signature and authenticate |
| `POST` | `/auth/uz/qr/session` | Create QR auth session |
| `GET` | `/auth/uz/qr/session/:sessionId` | Poll QR session status |
| `POST` | `/auth/uz/qr/session/approve` | Approve QR session (mobile app) |

#### E-Documents (`eDocumentController.ts`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/e-documents` | List all e-documents for tenant |
| `POST` | `/admin/e-documents` | Create new e-document (any type) |
| `GET` | `/admin/e-documents/:id` | Get document detail |
| `POST` | `/admin/e-documents/:id/sign` | Apply E-IMZO PKCS#7 signature (sender) |
| `POST` | `/admin/e-documents/:id/reject` | Reject document with reason |
| `POST` | `/admin/e-documents/from-invoice/:invoiceId` | Auto-generate E-Faktura from Invoice |
| `POST` | `/admin/e-documents/akt-sverki` | Generate Akt Sverki from contact statement |
| `GET` | `/public/e-documents/:id/sign` | Public counterparty signing portal |
| `POST` | `/public/e-documents/:id/sign` | Counterparty applies signature |
| `POST` | `/public/e-documents/:id/reject` | Counterparty rejects |

### 3.2 Business Logic

**E-IMZO Challenge-Response flow:**
1. Client browser loads `E-IMZO Browser Extension` at `ws://127.0.0.1:64443`
2. Client calls `GET /auth/uz/eimzo/challenge` → server returns `{challengeId, nonce, expiresAt}`
3. Browser extension signs nonce with user's private key (USB token or `.pfx`)
4. Client posts PKCS#7 signature + `certInfo` to `POST /auth/uz/eimzo/verify`
5. Server verifies signature using `EimzoAuthService.verifySignature` → extracts TIN/PINFL from certificate
6. User authenticated and session token issued

**Document signing flow:**
1. Sender creates e-document → status `DRAFT`
2. Sender's browser agent signs document canonical JSON hash with E-IMZO
3. `POST /admin/e-documents/:id/sign` → `senderSignature` attached, status → `WAITING_COUNTERPARTY`
4. System sends `publicSignToken` URL to counterparty
5. Counterparty opens public URL → reads document → signs with their E-IMZO
6. `POST /public/e-documents/:id/sign` → `recipientSignature` attached → status `FULLY_SIGNED`

**Canonical hash computation:**
```typescript
const canonicalHash = crypto.createHash('sha256')
  .update(JSON.stringify({ docNumber, docDate, sellerTin, buyerTin, items, totalSum }))
  .digest('hex');
```

**E-Faktura from Invoice:**
`POST /admin/e-documents/from-invoice/:invoiceId` — reads the `Invoice` record and transforms it into an `InHouseEDocument` with type `INVOICE`, auto-populating seller info from `CompanySettings` and buyer info from the linked `Contact`.

**Akt Sverki generation:**
`POST /admin/e-documents/akt-sverki` — queries AR/AP transactions for a contact over a date range, builds a reconciliation table, creates an `ACT_RECONCILIATION` document.

**Ishonchnoma (Power of Attorney):**
`metaData` carries: `{representativeName, representativePinfl, authority, validUntil}`. `legalArticles` carry the legal basis for the PoA per Uzbekistan Civil Code.

### 3.3 Validation Rules

- Document must have at least one `items` line
- `sellerTin` must be 9 digits (STIR format)
- `buyerTin` must be 9 digits
- Each item must have a valid `catalogCode` (17-digit MXIK) — not enforced in current code
- `vatRate` must be 0 or 12
- `vatSum = summa × count × vatRate / 100`
- `totalSum = summa × count + vatSum`
- Cannot sign an already FULLY_SIGNED document (status guard)
- Cannot sign a REJECTED document

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| E-Documents List | `pages/admin/e-documents/EDocumentsPage.tsx` | `/admin/e-documents` |
| E-Documents Detail | `pages/admin/e-documents/EDocumentDetailPage.tsx` | `/admin/e-documents/:id` |
| Public Sign Portal | `pages/public/PublicEDocumentSignPage.tsx` | `/e-documents/:id/sign?token=...` |

### 4.2 User Flows

**Create and Sign E-Faktura:**
1. From Invoice view → "E-Faktura yaratish" (Create E-Invoice)
2. System calls `POST /admin/e-documents/from-invoice/:id` → pre-filled E-Faktura shown
3. Review: seller, buyer, items with MXIK codes and 12% QQS breakdown
4. Click "E-IMZO bilan imzolash" → browser connects to E-IMZO extension at port 64443
5. Certificate list shown (USB token or `.pfx` in browser)
6. User selects certificate → signs → PKCS#7 returned to server
7. Document status → `WAITING_COUNTERPARTY`
8. System copies counterparty sign URL to clipboard or sends via email

**Counterparty Signing:**
1. Counterparty opens public URL: `/e-documents/:id/sign?token={publicSignToken}`
2. Document rendered: items, totals, QR code
3. Counterparty clicks "Qabul qilish va imzolash" (Accept and Sign)
4. Their E-IMZO browser extension signs the canonical hash
5. Status → `FULLY_SIGNED`; both signatures visible with certificate info

**Generate Akt Sverki:**
1. CRM → Contact Card → "Akt Sverki yaratish"
2. Select date range → `POST /admin/e-documents/akt-sverki`
3. Akt document generated, ready to sign and send to counterparty

### 4.3 Key Components

- `EDocumentsPage.tsx` (12 KB): Document list with type badges, status badges, direction indicators (OUTBOUND/INBOUND).
- `EDocumentDetailPage.tsx` (18 KB): Full document view with item table, party info panel, signature status panel, sign/reject action buttons.
- `PublicEDocumentSignPage.tsx` (11 KB): Public counterparty portal — renders document without auth, provides Sign/Reject buttons.

---

## 5. Integrations

- **E-IMZO Browser Agent (`ws://127.0.0.1:64443`):** The browser extension exposes a local WebSocket. The frontend sends the document hash; the extension signs it with the user's certificate and returns PKCS#7. This is the standard Uzbekistan E-IMZO integration pattern.
- **Invoicing Module:** `from-invoice/:invoiceId` pulls data from `Invoice` Prisma records.
- **CRM:** Akt Sverki generation reads `Contact` statement data.
- **Soliq Tax Reports:** The signed E-Faktura `pkcs7Signature` is reused in `submitSoliqDeclaration` to submit tax declarations.
- **Didox / Factura.uz (planned):** The PKCS#7 signed payload is designed to be forwarded to a licensed Uzbekistan EDI operator. Current submission is mocked/in-house only.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **E-Documents not persisted** | 🔴 Critical | `eDocumentsStore` is process-local in-memory. All signed documents lost on restart. Need `EDocument`, `EDocumentItem`, `EDocumentSignature` Prisma models. |
| 2 | **No real Didox / Factura.uz API call** | 🔴 Critical | Document submission is mocked. Real EDI operator API integration (OAuth2, PKCS#7 upload, status polling) is not implemented. |
| 3 | **E-IMZO verification is partial** | 🔴 Critical | `EimzoAuthService.verifySignature` performs structural validation and nonce expiry checks but does NOT validate the PKCS#7 cryptographic chain against the Uzbekistan trusted CA (DST) certificate store. Real signature cryptographic verification requires the Uzbekistan E-IMZO CA bundle. |
| 4 | **MXIK code not in Product model** | 🔴 Critical | Items need 17-digit MXIK codes but `Product` schema has no `mxikCode` field. The controller uses `(p as any).mxikCode`. |
| 5 | **No E-Document inbox (inbound)** | 🟡 Medium | `direction: INBOUND` is modeled but there is no mechanism to receive inbound E-Fakturas from suppliers via Didox/Factura.uz API. |
| 6 | **QR auth approval is hardcoded** | 🟡 Medium | `approveQrSession` finds the tenant's first `user_type=1` user. Multi-user workspaces cannot properly associate QR sessions with specific users. |
| 7 | **No PINFL validation** | 🟡 Medium | PINFL (14-digit personal tax ID) is stored as a string with no format validation or Uzbekistan ID registry lookup. |
| 8 | **Public portal has no rate limiting** | 🟡 Medium | The counterparty signing public URL is accessible to anyone with the token. No rate limiting or IP-based access control. |
