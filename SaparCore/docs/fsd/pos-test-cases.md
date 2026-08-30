# POS (Point of Sale) — Comprehensive Manual QA Test Checklist

**Module:** Point of Sale (POS) & Retail Terminal  
**FSD Reference:** [`docs/fsd/pos.md`](file:///c:/Users/Doston/Downloads/SAPAR/SaparCore/docs/fsd/pos.md)  
**Target Platform:** Web (Desktop & Touch POS Terminals / Chrome / Edge)  
**Locale & Currency:** Uzbekistan (`uz-UZ`, `soʻm` / UZS, QQS 12%)  

---

## Summary Matrix

| Category | Test Suite | Scope & Objective |
|---|---|---|
| **01** | **Shift Management & Auditing** | Shift opening float, active status tracking, X-Report snapshot, Z-Report cash reconciliation (Kamomad/Ortiqcha). |
| **02** | **Product Discovery & Barcode Scanning** | Search input, category filters, USB barcode scanner emulation, duplicate scans, non-existent barcodes. |
| **03** | **Cart Operations & Tax Calculation** | Item additions, quantity steppers, item removal, cart clearing, discount handling, and included 12% QQS reverse tax verification. |
| **04** | **Single-Tender Payment Methods** | Full payments via Naqd pul (Cash) with change calculation, Uzcard, Humo, Payme/Click QR, and Nasiya (Credit). |
| **05** | **Split-Tender Payment Processing** | Multi-method payments, exact remaining balance enforcement, underpaid/overpaid boundaries. |
| **06** | **Receipt Generation & Thermal Printing** | Receipt modal, company STIR, fiscal number format, Soliq QR code URL schema, print triggers. |
| **07** | **Hardware & Peripherals Integration** | USB HID scanner rapid bursts, thermal printer dialog handling, audio synth cues (scan, success, remove). |
| **08** | **Resilience, Edge Cases & Failure Recovery** | Network disconnection mid-sale, server reload/process restart, negative values, boundary pricing, offline mock trapping. |

---

## 01. Shift Management & Auditing

- [ ] **TC-POS-001 [Happy Path]: Initial State Without Open Shift**
  - **Preconditions:** Server running, user logged in as cashier, no active shift.
  - **Steps:** Navigate to `/admin/pos/shifts`.
  - **Expected Result:** "Aktiv Kassa Smenasi Mavjud Emas" banner is displayed with a "Yangi Smenani Ochish" CTA button. Terminal features indicate shift is needed.
- [ ] **TC-POS-002 [Happy Path]: Open Cashier Shift with Valid Float**
  - **Preconditions:** No active shift.
  - **Steps:** Click "Yangi Smenani Ochish", enter Cashier Name (`"Aziz Rustamov"`), Opening Float (`500,000 UZS`), click "Smenani Boshlash".
  - **Expected Result:** API `POST /admin/pos/shift/open` returns success (`200 OK`). Active shift card shows Shift ID, Cashier Name, Opening Time, and initial cash float of `500,000 UZS`.
- [ ] **TC-POS-003 [Edge Case]: Open Shift with Zero or Decimal Float**
  - **Steps:** Open shift with `0 UZS` float, and separately test with non-integer numbers (e.g. `500000.50`).
  - **Expected Result:** Zero float is accepted without crashing; decimal values either round according to currency rules or store properly as numerical floats.
- [ ] **TC-POS-004 [Edge Case]: Duplicate Shift Opening Guard**
  - **Preconditions:** Active shift is already open.
  - **Steps:** Attempt to send `POST /admin/pos/shift/open` directly via API or secondary tab.
  - **Expected Result:** System returns error or overwrites gracefully without creating orphaned dangling sessions.
- [ ] **TC-POS-005 [Happy Path]: Generate Mid-Shift X-Report (Oraliq Tekshiruv)**
  - **Preconditions:** Active shift open with recorded cash and card sales.
  - **Steps:** Click "X-Hisobot (Oraliq)".
  - **Expected Result:** API `GET /admin/pos/shift/x-report` responds with status `OPEN`, current cumulative totals across cash/uzcard/humo/qr/credit, total transaction count, and expected cash in drawer (`openingCash + cashSales`). The shift remains open.
- [ ] **TC-POS-006 [Happy Path]: Close Shift with Exact Cash Match (TENG)**
  - **Preconditions:** Shift has Opening Float = `500,000 UZS`, Cash Sales = `350,000 UZS` (Expected = `850,000 UZS`).
  - **Steps:** Click "Smenani Yopish", enter Counted Cash = `850,000 UZS`, confirm.
  - **Expected Result:** API `POST /admin/pos/shift/close` succeeds. Z-Report modal appears showing `Farq holati: TENG (Toʻgʻri)`, `difference = 0`. Active shift transitions to `CLOSED`.
- [ ] **TC-POS-007 [Negative / Edge Case]: Close Shift with Cash Shortage (KAMOMAD)**
  - **Preconditions:** Expected cash in drawer = `850,000 UZS`.
  - **Steps:** Cashier enters Counted Cash = `800,000 UZS` (50,000 shortage).
  - **Expected Result:** Z-Report displays `KAMOMAD (-50000 soʻm)` with negative difference highlighted in alert state.
- [ ] **TC-POS-008 [Negative / Edge Case]: Close Shift with Cash Overage (ORTIQCHA)**
  - **Preconditions:** Expected cash in drawer = `850,000 UZS`.
  - **Steps:** Cashier enters Counted Cash = `920,000 UZS` (70,000 surplus).
  - **Expected Result:** Z-Report displays `ORTIQCHA (+70000 soʻm)` with positive surplus clearly identified.

---

## 02. Product Discovery & Barcode Scanning

- [ ] **TC-POS-009 [Happy Path]: Product Grid Loading & Category Filtering**
  - **Steps:** Open `/admin/pos/terminal`. Click each category pill ("Barchasi", "Ichimliklar", "Oziq-ovqat", etc.).
  - **Expected Result:** Product grid renders with item name, SKU, price in UZS, stock badge, and category tag. Switching category pills updates the grid without UI stutter.
- [ ] **TC-POS-010 [Happy Path]: Text Search by Name & SKU**
  - **Steps:** Type `"Coca"` or SKU `"CC-15"` in the search input and press Enter.
  - **Expected Result:** Matching product is identified, scan beep sound plays, product is added to cart, search input clears automatically, and toast notification confirms addition.
- [ ] **TC-POS-011 [Happy Path]: Single Barcode Scanner Input**
  - **Steps:** Focus search input. Scan valid 13-digit EAN barcode (e.g. `4780001234567`) via hardware USB scanner.
  - **Expected Result:** Scanner terminates with `Enter`, cart increments matching item by +1, 1400Hz scan beep triggers, search bar resets.
- [ ] **TC-POS-012 [Edge Case]: Rapid Duplicate Barcode Scans (Burst Scanning)**
  - **Steps:** Trigger scanner 5 times in rapid succession (<500ms intervals) on the same product.
  - **Expected Result:** Cart quantity increments to 5 without skipping counts, race conditions, or creating duplicate line item rows for the same product ID.
- [ ] **TC-POS-013 [Negative]: Scan Non-Existent Barcode**
  - **Steps:** Scan or enter unknown barcode `9999999999999` and hit Enter.
  - **Expected Result:** Low removal/error tone (320Hz) plays, toast displays `"Mahsulot topilmadi"`, cart remains unmodified, and search input is ready for next attempt.
- [ ] **TC-POS-014 [Edge Case]: Special Characters and Whitespace in Search**
  - **Steps:** Input leading/trailing spaces (`"  Coca-Cola  "`), Cyrillic vs Latin Uzbek letters (`"Сок"` / `"Sharbat"`), quotes, and symbols (`%`, `&`, `'`).
  - **Expected Result:** Search sanitizes input without throwing unhandled exceptions or regex parsing errors.
- [ ] **TC-POS-015 [Happy Path]: Product Details Modal (Tovar Ma'lumotlari)**
  - **Steps:** Click the `(i)` info icon on any product card in the grid.
  - **Expected Result:** Modal opens displaying Product Name, Category, SKU, Barcode, Stock Level, 17-digit MXIK/IKPU classifier code, Net Price, included 12% QQS amount, and Cost Price. Clicking "Savatga Qoʻshish" adds item and closes modal.

---

## 03. Cart Operations & Tax Calculation

- [ ] **TC-POS-016 [Happy Path]: Quantity Steppers (+ / -)**
  - **Steps:** In the active cart panel, click `+` button to increase quantity to 3; click `-` button to decrease to 1.
  - **Expected Result:** Quantity updates in real-time, line item total (`price * qty`) recalculates, audio feedback plays (scan beep on `+`, lower tone on `-`), and subtotal reflects changes immediately.
- [ ] **TC-POS-017 [Happy Path]: Reduce Quantity to Zero via Stepper**
  - **Steps:** On an item with `qty = 1`, click `-`.
  - **Expected Result:** Item is completely removed from cart, remove tone plays, subtotal recalculates.
- [ ] **TC-POS-018 [Happy Path]: Single Item Trash & Clear Cart (Tozalash)**
  - **Steps:** Add 3 distinct products. Click trash icon next to item 2. Then click "Tozalash" in cart header.
  - **Expected Result:** Clicking single trash removes only that item. Clicking "Tozalash" empties all items, resets discount, and displays the "Savat boʻsh" empty state illustration.
- [ ] **TC-POS-019 [Happy Path]: Included 12% QQS (VAT) Mathematical Verification**
  - **Preconditions:** Cart Total = `112,000 UZS`.
  - **Formula:** $\text{QQS} = \text{round}\left(\frac{\text{Total} \times 12}{112}\right) = 12,000\text{ UZS}$.
  - **Steps:** Add products to total exactly `112,000 UZS`. Inspect cart summary.
  - **Expected Result:** "Oraliq summa" = `112,000 UZS`, "Shu jumladan QQS (12%)" = `12,000 UZS`, "Jami Toʻlov" = `112,000 UZS`.
- [ ] **TC-POS-020 [Edge Case]: Fixed Discount Application**
  - **Steps:** Cart subtotal = `100,000 UZS`. Apply discount of `15,000 UZS`.
  - **Expected Result:** Total payable displays `85,000 UZS`. QQS re-evaluates as $\text{round}((85000 \times 12) / 112) = 9,107\text{ UZS}$.
- [ ] **TC-POS-021 [Negative / Edge Case]: Discount Exceeds Subtotal**
  - **Steps:** Cart subtotal = `50,000 UZS`. Apply discount of `75,000 UZS`.
  - **Expected Result:** Total payable clamps to `0 UZS` (never negative). Checkout button remains functional or prompts validation warning.
- [ ] **TC-POS-022 [Happy Path]: Custom Customer Name Assignment**
  - **Steps:** Edit customer input from `"Chakana Xaridor"` to `"OOO MEGA TRADE / STIR: 301234567"`. Complete sale.
  - **Expected Result:** Custom customer name and identifier are transmitted in payload and appear on generated receipt.

---

## 04. Single-Tender Payment Methods

- [ ] **TC-POS-023 [Happy Path]: Cash Payment with Exact Tender (Aniq Summa)**
  - **Preconditions:** Total = `45,000 UZS`.
  - **Steps:** Click "Toʻlovni Qabul Qilish", select "Naqd Pul" tab, click "Aniq Summa" (`45,000 UZS`), click "Toʻlovni Yakunlash".
  - **Expected Result:** Change due = `0 UZS`. Success chime plays. API sends `cashAmount: 45000`, all other amounts = `0`. Shift cash sales accumulator increments by `45,000`.
- [ ] **TC-POS-024 [Happy Path]: Cash Payment with Quick-Add Buttons & Change Calculation**
  - **Preconditions:** Total = `68,000 UZS`.
  - **Steps:** Click "Naqd Pul" tab. Click `+50 000` then `+50 000` (Tendered = `100,000 UZS`).
  - **Expected Result:** "Qaytariladigan Qaytim (Change)" calculates dynamically to `32,000 UZS`. On submit, receipt reflects cash paid `100,000` and change given.
- [ ] **TC-POS-025 [Happy Path]: Card Payment via Uzcard**
  - **Preconditions:** Total = `120,000 UZS`.
  - **Steps:** Select "Uzcard" tab. Click "Toʻlovni Yakunlash".
  - **Expected Result:** API receives `paymentMethod: "Uzcard"`, `uzcardAmount: 120000`. Shift `uzcardSales` accumulator increases by `120,000`.
- [ ] **TC-POS-026 [Happy Path]: Card Payment via Humo**
  - **Preconditions:** Total = `85,000 UZS`.
  - **Steps:** Select "Humo" tab. Click "Toʻlovni Yakunlash".
  - **Expected Result:** API receives `paymentMethod: "Humo"`, `humoAmount: 85000`. Shift `humoSales` accumulator increases by `85,000`.
- [ ] **TC-POS-027 [Happy Path]: Mobile QR Payment (Payme / Click)**
  - **Preconditions:** Total = `54,000 UZS`.
  - **Steps:** Select "Payme / Click" tab. Click "Toʻlovni Yakunlash".
  - **Expected Result:** API receives `qrAmount: 54000`. Shift `qrSales` increments by `54,000`.
- [ ] **TC-POS-028 [Happy Path]: Nasiya / Store Credit Tab (Muddatli Toʻlov)**
  - **Preconditions:** Total = `300,000 UZS`, Customer = `"Sharipov Akmal"`.
  - **Steps:** Select "Nasiya" tab. Click "Toʻlovni Yakunlash".
  - **Expected Result:** API receives `creditAmount: 300000`. Shift `creditSales` increments by `300,000` without altering cash drawer balance.

---

## 05. Split-Tender Payment Processing

- [ ] **TC-POS-029 [Happy Path]: Split Payment Exactly Matching Total**
  - **Preconditions:** Total = `150,000 UZS`.
  - **Steps:** Select "Aralash" (Split) tab. Enter Cash = `50,000`, Uzcard = `60,000`, Payme QR = `40,000` (Total entered = `150,000`).
  - **Expected Result:** "Qoldiq" shows `0 UZS` in green. "Toʻlovni Yakunlash" button is enabled. On submit, shift statistics increment `cashSales +50k`, `uzcardSales +60k`, `qrSales +40k`.
- [ ] **TC-POS-030 [Negative]: Split Payment Underpaid Guard (Qoldiq > 0)**
  - **Preconditions:** Total = `100,000 UZS`.
  - **Steps:** Enter Cash = `40,000`, Uzcard = `30,000` (Total entered = `70,000`, Remaining = `30,000`).
  - **Expected Result:** "Qoldiq" shows `30,000 UZS` in red alert text. "Toʻlovni Yakunlash" submit button is **disabled**.
- [ ] **TC-POS-031 [Negative]: Split Payment Overpaid Guard (Qoldiq < 0)**
  - **Preconditions:** Total = `100,000 UZS`.
  - **Steps:** Enter Cash = `70,000`, Uzcard = `50,000` (Total entered = `120,000`, Remaining = `-20,000`).
  - **Expected Result:** "Qoldiq" shows `-20,000 UZS` in red. Submit button remains disabled until values balance exactly to zero difference.
- [ ] **TC-POS-032 [Edge Case]: 5-Way Maximum Split Tender**
  - **Preconditions:** Total = `500,000 UZS`.
  - **Steps:** Allocate: Cash `100,000`, Uzcard `100,000`, Humo `100,000`, QR `100,000`, Nasiya Credit `100,000`.
  - **Expected Result:** System accepts 5-way split. Receipt itemizes all 5 payment methods with respective portions.

---

## 06. Receipt Generation & Thermal Printing

- [ ] **TC-POS-033 [Happy Path]: Thermal Receipt Modal Rendering**
  - **Preconditions:** Sale completed.
  - **Steps:** Inspect receipt modal popup.
  - **Expected Result:** Modal displays:
    1. Company Name & STIR/TIN (`308765432` or tenant settings)
    2. Unique Receipt Number (`CHK-XXXXXXXX`)
    3. Fiscal Marker (`FISC-XXXXXXXX`)
    4. Formatted Timestamp (`DD.MM.YYYY, HH:mm:ss`)
    5. Itemized Table (Name, Qty, Unit Price, Line Total)
    6. Subtotal, Discount, included QQS (12%), Grand Total
    7. Method-specific breakdown (Cash, Uzcard, etc.)
- [ ] **TC-POS-034 [Happy Path]: Print Trigger Execution (`window.print`)**
  - **Steps:** Click "Chekni Chop Etish" button in receipt modal.
  - **Expected Result:** Browser triggers `window.print()`. Print preview renders receipt container styled for thermal slip without app header/sidebar artifacts.
- [ ] **TC-POS-035 [Edge Case]: Browser Print Dialog Cancelation**
  - **Steps:** Trigger print dialog and click "Cancel" in browser OS print dialog.
  - **Expected Result:** POS UI returns smoothly without losing cart/shift state or freezing the modal. Cashier can close modal or re-print.
- [ ] **TC-POS-036 [Edge Case]: Multi-Item Long Receipt Pagination / Layout**
  - **Preconditions:** Cart with 25 distinct line items.
  - **Steps:** Complete checkout and inspect thermal receipt layout.
  - **Expected Result:** Receipt view scrolls vertically without layout breaking or overlapping total summary/fiscal QR section.

---

## 07. Hardware & Peripherals Integration

- [ ] **TC-POS-037 [Happy Path]: Web Audio Synthesizer Cues**
  - **Steps:** Enable sound. Execute (1) item scan, (2) checkout completion, (3) item deletion.
  - **Expected Result:** 
    1. Scan: Clean 1400Hz sine pulse.
    2. Checkout: 880Hz/1320Hz/1760Hz triangle chord chime.
    3. Deletion: 320Hz low tone.
- [ ] **TC-POS-038 [Happy Path]: Sound Mute / Unmute State Persistence**
  - **Steps:** Click Audio toggle button to mute. Refresh page. Add item to cart.
  - **Expected Result:** Audio toggle indicates muted (`VolumeX`), `localStorage['sapar_pos_muted'] === 'true'`, no audio plays upon scan.
- [ ] **TC-POS-039 [Happy Path]: Fullscreen Toggle Mode**
  - **Steps:** Click "Toʻliq Ekran" button. Press `ESC` or click "Kichraytirish".
  - **Expected Result:** POS expands to `document.documentElement.requestFullscreen()`, occupying 100% viewport without OS toolbars. Exiting returns to standard layout.
- [ ] **TC-POS-040 [Hardware Simulation]: High-Speed Barcode Reader Wedge**
  - **Steps:** Send characters via barcode wedge with 5ms inter-character delay ending with `CR/LF`.
  - **Expected Result:** Input buffer receives complete string without character dropping; Enter key triggers lookup immediately.

---

## 08. Resilience, Edge Cases & Failure Recovery

- [ ] **TC-POS-041 [Failure Scenario]: Network Drop Mid-Sale (Offline Detection Check)**
  - **Steps:** Add items to cart. Disconnect network cable / toggle offline in DevTools. Click "Toʻlovni Qabul Qilish" and submit.
  - **Expected Result:** 
    - *Expected Production Behavior:* UI displays clear network failure alert; does not falsely claim server persistence.
    - *Audit Check:* Verify frontend does not silently disguise API failure with fake local receipt data without alerting cashier of offline status.
- [ ] **TC-POS-042 [Failure Scenario]: Backend Server Restart Mid-Shift (In-Memory Trap)**
  - **Steps:** Open shift, record 3 sales. Restart backend Node process. Navigate to `/admin/pos/shifts`.
  - **Expected Result:** Verify system state handling. Document whether shift was preserved in database or lost due to process restart (highlighting need for P0 Prisma persistence).
- [ ] **TC-POS-043 [Edge Case]: Zero-Item Checkout API Rejection**
  - **Steps:** Send `POST /admin/pos/checkout` with `items: []`.
  - **Expected Result:** Backend returns `400 Bad Request` with message `"Savatda mahsulotlar mavjud emas"`.
- [ ] **TC-POS-044 [Edge Case]: Large Value Boundaries & Decimals**
  - **Steps:** Create item with price = `999,999,999 UZS` (1 Billion UZS sale). Complete checkout.
  - **Expected Result:** Formatter renders `999 999 999 soʻm` without truncation or scientific notation (`1e9`); tax calculates correctly without floating point precision corruption.
- [ ] **TC-POS-045 [Security / Auth]: Checkout Without Auth Token**
  - **Steps:** Send `POST /admin/pos/checkout` with missing or expired `Authorization` header.
  - **Expected Result:** Server rejects with `401 Unauthorized`.

---

## Sign-Off Matrix

| Role | Name | Status | Date |
|---|---|---|---|
| **QA Lead** | | [ ] PASS &nbsp; [ ] FAIL | |
| **Store Manager / Cashier** | | [ ] PASS &nbsp; [ ] FAIL | |
| **Release Engineer** | | [ ] GO &nbsp;&nbsp;&nbsp;&nbsp; [ ] NO-GO | |
