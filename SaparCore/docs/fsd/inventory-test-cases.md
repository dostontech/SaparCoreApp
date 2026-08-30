# Inventory Management — Comprehensive Manual QA Test Checklist

**Module:** Inventory Management, Product Catalogue & Stock Valuation  
**FSD Reference:** [`docs/fsd/inventory.md`](file:///c:/Users/Doston/Downloads/SAPAR/SaparCore/docs/fsd/inventory.md)  
**Target Platform:** Web (Desktop & Touch POS Terminals / Chrome / Edge)  
**Locale & Currency:** Uzbekistan (`uz-UZ`, `soʻm` / UZS, MXIK/IKPU 17-digit Codes)  

---

## Summary Matrix

| Category | Test Suite | Scope & Objective |
|---|---|---|
| **01** | **Product Catalogue & Classification** | SKU/Code uniqueness, barcode generation, MXIK/IKPU codes, category/brand/unit assignments, Product vs Service item types. |
| **02** | **Inbound Stock & Purchases Valuation** | Purchase order receipts, stock addition, Weighted Average Cost (WAC) recalculation, FIFO `InventoryCostLayer` creation. |
| **03** | **Outbound Stock Depletion & COGS** | Sales invoices, POS sales deductions, GL posting (`Dr COGS / Cr Inventory`), FIFO cost layer depletion order. |
| **04** | **Zero & Negative Stock Boundary Controls** | Exact-zero depletion, out-of-stock guards, concurrent multi-terminal sales race conditions, negative inventory policies. |
| **05** | **Stock Adjustments & Write-Offs (Inventarizatsiya)** | Manual count adjustments, damage/spoilage write-offs, cost layer adjustments, inventory history logging. |
| **06** | **Sales Returns, Credit Notes & Stock Reversal** | Customer returns, restocking returned goods, FIFO layer reinstatement vs new layer creation, GL reversal entries. |
| **07** | **Purchase Returns & Debit Notes** | Supplier returns, stock deduction for returned defective goods, FIFO layer removal, Accounts Payable reconciliation. |
| **08** | **Multi-Warehouse & Stock Transfers** | Inter-warehouse stock transfers, source stock-out / destination stock-in pairing, valuation preservation across warehouses. |
| **09** | **Low-Stock Alerts & Replenishment** | `alert_quantity` threshold triggers, UI alert badges, low-stock filtering, reorder purchase order generation. |
| **10** | **POS Integration & Concurrency Post-Transactional Fix** | Transactional atomic deduction, rollback integrity, idempotency duplicate sale protection against double deduction. |

---

## 01. Product Catalogue & Classification

- [ ] **TC-INV-001 [Happy Path]: Create Physical Product with Complete Attributes**
  - **Preconditions:** Logged in with `product-services:create` permission.
  - **Steps:** Navigate to `/admin/products` → click "New Product". Fill Name (`"Toshkent Non"`), SKU (`"SKU-NON-01"`), Category, Brand, Unit (`"Dona"`), Selling Price (`5,000 UZS`), Purchase Price (`3,500 UZS`), Tax Rate (`12% QQS`). Enable "Enable Inventory" toggle. Set Opening Stock (`100`), Alert Quantity (`15`), Valuation (`WAC`). Click Save.
  - **Expected Result:** API `POST /admin/products` returns `201/200`. Product appears in Catalogue and Inventory list with 100 units on hand and 3,500 UZS average cost.
- [ ] **TC-INV-002 [Happy Path]: Create Service Item (Inventory Disabled)**
  - **Steps:** Create item with `item_type = "Service"`, Name (`"Yetkazib Berish Xizmati / Delivery"`), Price (`25,000 UZS`). Ensure "Enable Inventory" is unchecked.
  - **Expected Result:** Item is created. No `Inventory` or `InventoryCostLayer` records are instantiated. Stock level shows `N/A` or is omitted from stock replenishment lists.
- [ ] **TC-INV-003 [Happy Path]: Auto-Generate EAN-13 Compatible Barcode**
  - **Steps:** Open "New Product" modal, leave barcode field empty, click "Generate Barcode".
  - **Expected Result:** API `POST /admin/products/:id/generate-barcode` generates a unique 13-digit barcode string (e.g. `478000...`). The input field is populated with the generated code.
- [ ] **TC-INV-004 [Edge Case]: MXIK/IKPU 17-Digit National Product Classifier Code**
  - **Steps:** Enter a valid 17-digit Uzbekistan MXIK code (e.g. `01111001001000000` for wheat flour) in the product classifier field. Save and verify.
  - **Expected Result:** MXIK code is stored and properly retrieved during E-Faktura and fiscal receipt generation.
- [ ] **TC-INV-005 [Negative]: Duplicate SKU / Code Validation**
  - **Steps:** Attempt to create a product with an SKU/Code that already exists in the system.
  - **Expected Result:** System rejects creation with a clear validation error (`"SKU yoki mahsulot kodi allaqachon mavjud"`), preventing duplicate SKU collisions.
- [ ] **TC-INV-006 [Negative]: Duplicate Barcode Validation**
  - **Steps:** Attempt to assign a barcode that is already registered to another product.
  - **Expected Result:** System returns validation error (`"Ushbu shtrix-kod boshqa tovar uchun roʻyxatdan oʻtgan"`).
- [ ] **TC-INV-007 [Negative]: Negative Price and Alert Threshold Validation**
  - **Steps:** Input Selling Price = `-5000`, Purchase Price = `-2000`, or Alert Quantity = `-10`.
  - **Expected Result:** Form validation blocks submission with `"Qiymat 0 dan kichik boʻlishi mumkin emas"`.
- [ ] **TC-INV-008 [Happy Path]: Product Image and Gallery Upload**
  - **Steps:** Upload primary product image (`.jpg`/`.png`) and 3 additional gallery images.
  - **Expected Result:** Images upload to `/uploads/products`, URLs are saved in `product_image` and `gallery_images` JSON, and thumbnails display in the product catalogue and POS terminal.

---

## 02. Inbound Stock & Purchases Valuation

- [ ] **TC-INV-009 [Happy Path]: Purchase Order Receipt with Weighted Average Cost (WAC)**
  - **Preconditions:** Product has initial stock = `10 units @ 10,000 UZS` (Total value = `100,000 UZS`).
  - **Steps:** Create and approve a Purchase Invoice receiving `20 units @ 13,000 UZS` (Total purchase = `260,000 UZS`).
  - **Expected Result:**
    - `quantityOnHand` increments to `30 units`.
    - `avgCost` recalculates to: `(100,000 + 260,000) / 30 = 360,000 / 30 = 12,000 UZS`.
    - Inventory list reflects stock = `30`, avg cost = `12,000 UZS`, total value = `360,000 UZS`.
- [ ] **TC-INV-010 [Happy Path]: Purchase Receipt with FIFO Cost Layers**
  - **Preconditions:** Product configured with `valuationMethod = "FIFO"`. Initial state: No open layers.
  - **Steps:**
    1. Receive Purchase #1: `15 units @ 20,000 UZS` on Day 1.
    2. Receive Purchase #2: `25 units @ 24,000 UZS` on Day 2.
  - **Expected Result:**
    - Two distinct `InventoryCostLayer` records are created in DB:
      - Layer 1: `qtyRemaining = 15`, `unitCost = 20,000`, `receivedAt = Day 1`.
      - Layer 2: `qtyRemaining = 25`, `unitCost = 24,000`, `receivedAt = Day 2`.
    - Total `quantityOnHand` = `40 units`.
    - Cost Layers screen (`/admin/inventory/:id/cost-layers`) displays both layers with correct timestamps and remaining balances.
- [ ] **TC-INV-011 [Edge Case]: Inbound Stock with Zero Purchase Cost (Sample / Bonus Goods)**
  - **Steps:** Receive `10 units @ 0 UZS` purchase price.
  - **Expected Result:** Stock increments by +10. Under WAC, average cost drops proportionally (`total value / new total quantity`). Under FIFO, a cost layer with `unitCost = 0` is added without dividing by zero error.
- [ ] **TC-INV-012 [Happy Path]: Multi-Currency Inbound Purchase Valuation**
  - **Steps:** Create a purchase invoice in `USD` for `100 units @ $2.00/unit` at an exchange rate of `1 USD = 12,800 UZS`.
  - **Expected Result:** Stock increases by +100 units. `unitCost` in `InventoryCostLayer` and WAC is recorded in base currency as `25,600 UZS/unit` ($2.00 × 12,800).

---

## 03. Outbound Stock Depletion & COGS

- [ ] **TC-INV-013 [Happy Path]: Sales Invoice Stock Deduction**
  - **Preconditions:** Product has `quantityOnHand = 50`.
  - **Steps:** Create and issue a standard Sales Invoice for `12 units`.
  - **Expected Result:**
    - `quantityOnHand` decrements from `50` to `38`.
    - `quantity` (legacy field) decrements to `38`.
    - `inventory_history` appends `stock_out` event with reference `invoice`.
- [ ] **TC-INV-014 [Happy Path]: General Ledger COGS Posting on Sale**
  - **Preconditions:** Ledger initialized. Product WAC = `15,000 UZS`.
  - **Steps:** Issue sales invoice for `4 units` (Total sales revenue = `80,000 UZS`).
  - **Expected Result:** System generates double-entry GL journal entry for Cost of Goods Sold:
    - `Debit COGS (Account 9120)`: `60,000 UZS` (4 × 15,000).
    - `Credit Inventory (Account 2910)`: `60,000 UZS`.
- [ ] **TC-INV-015 [Happy Path]: FIFO Layer Sequential Depletion (Single Layer)**
  - **Preconditions:** Layer 1 has `qtyRemaining = 20 @ 10,000 UZS`. Layer 2 has `qtyRemaining = 30 @ 12,000 UZS`.
  - **Steps:** Sell `15 units`.
  - **Expected Result:**
    - Layer 1 `qtyRemaining` drops from `20` to `5`.
    - Layer 2 remains untouched (`30`).
    - Total COGS = `150,000 UZS` (15 × 10,000).
- [ ] **TC-INV-016 [Happy Path]: FIFO Layer Multi-Layer Depletion (Layer Spanning)**
  - **Preconditions:** Layer 1 has `qtyRemaining = 10 @ 10,000 UZS`. Layer 2 has `qtyRemaining = 20 @ 14,000 UZS`.
  - **Steps:** Sell `25 units`.
  - **Expected Result:**
    - Layer 1 is fully exhausted (`qtyRemaining = 0`).
    - Layer 2 is partially consumed: `qtyRemaining` drops from `20` to `5` (consumed 15).
    - Total COGS = `(10 × 10,000) + (15 × 14,000) = 100,000 + 210,000 = 310,000 UZS`.
    - Average COGS per unit = `12,400 UZS`.

---

## 04. Zero & Negative Stock Boundary Controls

- [ ] **TC-INV-017 [Happy Path]: Exact Stock Depletion to Zero**
  - **Preconditions:** Product has `quantityOnHand = 5`.
  - **Steps:** Sell exactly `5 units` via POS or Sales Invoice.
  - **Expected Result:** `quantityOnHand` becomes `0`. Inventory status updates to "Out of Stock" (Tugagan). Item remains searchable but flags zero stock.
- [ ] **TC-INV-018 [Negative]: Attempt to Sell More Than Available Stock (POS Hard Guard)**
  - **Preconditions:** Product has `quantityOnHand = 2`.
  - **Steps:** In POS terminal, attempt to increase cart quantity to `3` or scan item 3 times.
  - **Expected Result:** UI displays alert toast (`"Omborda yetarli qoldiq mavjud emas: mavjud 2 dona"`), blocking checkout submission or capping quantity to available on-hand stock.
- [ ] **TC-INV-019 [Negative]: Concurrent POS Checkout Race Condition on Last Unit**
  - **Preconditions:** Product has exactly `1 unit` on hand.
  - **Steps:**
    1. Cashier A on Terminal 1 opens checkout for 1 unit.
    2. Cashier B on Terminal 2 simultaneously opens checkout for the same 1 unit.
    3. Cashier A clicks Complete Payment (commits at T0).
    4. Cashier B clicks Complete Payment (submits at T0 + 100ms).
  - **Expected Result:**
    - Cashier A's sale succeeds (200 OK), stock decrements to 0.
    - Cashier B's sale is safely rejected inside the atomic `$transaction` with stock insufficiency error (`"Mahsulot qoldigʻi yetarli emas"`).
    - Database stock NEVER goes negative (`-1`).
- [ ] **TC-INV-020 [Edge Case]: Invoicing with Negative Stock Allowance Policy**
  - **Preconditions:** Tenant policy allows backordering / negative inventory. Stock = `0`.
  - **Steps:** Create backend invoice for `5 units`.
  - **Expected Result:** If policy enabled, `quantityOnHand` becomes `-5`. If disabled, transaction rolls back with `400 Bad Request`.

---

## 05. Stock Adjustments & Write-Offs (Inventarizatsiya)

- [ ] **TC-INV-021 [Happy Path]: Positive Manual Adjustment (Stock Write-On / Opening Balance)**
  - **Steps:** Navigate to `/admin/inventory` → click "Adjust" on a product. Select Reason: `"Boshlangʻich qoldiq / Opening Balance"`, Quantity: `+50`, Unit Cost: `15,000 UZS`. Submit.
  - **Expected Result:** API `POST /admin/inventory/adjust` returns 200. Stock increases by 50. New FIFO layer or WAC adjustment is recorded. Audit history reflects user and timestamp.
- [ ] **TC-INV-022 [Happy Path]: Negative Manual Adjustment (Damage / Spoilage Write-Off)**
  - **Preconditions:** Stock = `100 @ 12,000 UZS`.
  - **Steps:** Select "Adjust", Reason: `"Yaroqsiz / Buzilgan (Damage/Spoilage)"`, Quantity: `-10`, Notes: `"Omborda namlik tufayli yaroqsiz boʻldi"`.
  - **Expected Result:**
    - Stock decrements from `100` to `90`.
    - GL entry generated:
      - `Debit Inventory Loss / Shrinkage (Account 9430)`: `120,000 UZS` (10 × 12,000).
      - `Credit Inventory (Account 2910)`: `120,000 UZS`.
- [ ] **TC-INV-023 [Negative]: Adjustment Quantity Greater Than Total On-Hand Stock**
  - **Preconditions:** Stock = `15 units`.
  - **Steps:** Submit negative adjustment for `-20 units`.
  - **Expected Result:** System blocks adjustment with error (`"Hisobdan chiqarish miqdori mavjud qoldiqdan oshib ketdi"`).
- [ ] **TC-INV-024 [Happy Path]: Physical Inventory Audit Discrepancy Reconciliation**
  - **Preconditions:** Book stock in system = `120 units`. Physical warehouse count = `114 units` (6 missing).
  - **Steps:** Perform inventory reconciliation adjustment: enter Counted Quantity = `114`.
  - **Expected Result:** System computes difference `-6`, creates shrinkage adjustment, updates on-hand stock to `114`, and logs audit trail.

---

## 06. Sales Returns, Credit Notes & Stock Reversal

- [ ] **TC-INV-025 [Happy Path]: Full Sales Return Restocking via Credit Note**
  - **Preconditions:** Original invoice sold `5 units @ 20,000 UZS` (Purchase Cost = `14,000 UZS`). Current stock = `45`.
  - **Steps:** Create a Credit Note for the invoice, selecting reason `"Tovarni qaytarish / Return"` and checking "Tovarni omborga qaytarish / Restock to inventory".
  - **Expected Result:**
    - `quantityOnHand` increments from `45` to `50`.
    - GL reversal posted: `Dr Inventory (2910) / Cr COGS (9120)` for `70,000 UZS` (5 × 14,000).
    - `inventory_history` logs restocking event linked to Credit Note ID.
- [ ] **TC-INV-026 [Happy Path]: Partial Sales Return (Restock Portion)**
  - **Steps:** Customer returns `2 units` out of `5 units` originally purchased.
  - **Expected Result:** Stock increases by exactly `+2 units`. COGS reversed for 2 units only.
- [ ] **TC-INV-027 [Edge Case]: Damaged Goods Return (Return Without Restocking)**
  - **Steps:** Customer returns broken/spoiled product. Create Credit Note, but UNCHECK "Restock to inventory".
  - **Expected Result:** Customer is refunded / credited, but `quantityOnHand` remains unchanged. No inventory replenishment occurs.
- [ ] **TC-INV-028 [Edge Case]: FIFO Cost Layer Reinstatement on Sales Return**
  - **Preconditions:** Under FIFO, original sale consumed Layer 1 (`10,000 UZS`) and Layer 2 (`12,000 UZS`).
  - **Steps:** Process return of goods.
  - **Expected Result:** Reinstates cost layers at their original historical cost base rather than inflating or averaging layer prices.

---

## 07. Purchase Returns & Debit Notes

- [ ] **TC-INV-029 [Happy Path]: Purchase Return to Supplier (Debit Note)**
  - **Preconditions:** Stock = `50 units`. Received via Purchase #101 @ `15,000 UZS`.
  - **Steps:** Create a Debit Note returning `10 defective units` to supplier.
  - **Expected Result:**
    - `quantityOnHand` decreases from `50` to `40`.
    - Under FIFO: Layer corresponding to Purchase #101 is reduced by 10 units.
    - GL entry: `Dr Accounts Payable (Supplier) / Cr Inventory (2910)` for `150,000 UZS`.
- [ ] **TC-INV-030 [Negative]: Purchase Return When Goods Have Already Been Sold**
  - **Preconditions:** Purchased `10 units`, sold `8 units`, remaining stock = `2 units`.
  - **Steps:** Attempt to issue Debit Note returning all `10 units` to supplier.
  - **Expected Result:** System blocks return of 10 units (`"Faqat mavjud 2 dona tovar qaytarilishi mumkin, qolgan 8 dona sotib boʻlingan"`).

---

## 08. Multi-Warehouse & Stock Transfers

- [ ] **TC-INV-031 [Happy Path]: Inter-Warehouse Stock Transfer**
  - **Preconditions:** Warehouse A (Asosiy ombor) has `100 units @ 10,000 UZS`. Warehouse B (Chilonzor filiali) has `0 units`.
  - **Steps:** Initiate Stock Transfer of `30 units` from Warehouse A to Warehouse B.
  - **Expected Result:**
    - Warehouse A stock decrements to `70 units`.
    - Warehouse B stock increments to `30 units`.
    - Valuation (`10,000 UZS/unit`) is preserved across both locations without gain/loss distortion.
- [ ] **TC-INV-032 [Negative]: Transfer Quantity Exceeding Source Warehouse Stock**
  - **Steps:** Attempt to transfer `150 units` from Warehouse A when on-hand stock is `100`.
  - **Expected Result:** Transfer is blocked with validation error (`"Boshlangʻich omborda yetarli qoldiq mavjud emas"`).

---

## 09. Low-Stock Alerts & Replenishment

- [ ] **TC-INV-033 [Happy Path]: Low-Stock Threshold Triggering Badge in UI**
  - **Preconditions:** Product `alert_quantity = 10`. Current stock = `12`.
  - **Steps:** Sell `3 units` (Stock drops to `9`). Navigate to `/admin/inventory`.
  - **Expected Result:**
    - Row displays amber/red alert badge: `"Kam qoldiq (9 dona / Min: 10)"`.
    - Dashboard widget counter for "Kam qolgan tovarlar" increments by +1.
- [ ] **TC-INV-034 [Happy Path]: Inventory List Filtering by Low Stock & Out of Stock**
  - **Steps:** On `/admin/inventory`, click filter dropdown and select "Faqat kam qolganlar (Low Stock)".
  - **Expected Result:** Table filters to display only items where `quantityOnHand <= alert_quantity`.
- [ ] **TC-INV-035 [Happy Path]: Draft Purchase Order Generation from Low Stock List**
  - **Steps:** Select 3 low-stock items from the inventory alert view and click "Xarid buyurtmasini yaratish / Generate PO".
  - **Expected Result:** Opens new Purchase Order draft pre-populated with selected products and suggested reorder quantities.

---

## 10. POS Integration & Concurrency Post-Transactional Fix

- [ ] **TC-INV-036 [Happy Path]: POS Real-Time Stock Decrement Verification**
  - **Preconditions:** Product `Coca-Cola 1.5L` has initial DB stock = `50`.
  - **Steps:**
    1. In POS terminal, scan/select 2x Coca-Cola.
    2. Complete checkout (Cash tender = `30,000 UZS`).
    3. Immediately query `Inventory` table in PostgreSQL and refresh `/admin/inventory`.
  - **Expected Result:** `quantity` and `quantityOnHand` are exactly `48`. Stock history reflects `stock_out` tied to POS invoice number.
- [ ] **TC-INV-037 [Failure / Rollback]: POS Checkout Failure Leaves Inventory Untouched**
  - **Preconditions:** Stock = `48`.
  - **Steps:**
    1. Add 2x Coca-Cola to POS cart.
    2. Force server failure or database constraint violation during payment posting.
    3. Transaction aborts with 500 error.
  - **Expected Result:** Prisma `$transaction` rolls back completely. Stock in database remains strictly `48` (NOT `46`).
- [ ] **TC-INV-038 [Idempotency]: Duplicate POS Checkout Submission Guard**
  - **Preconditions:** Product stock = `48`.
  - **Steps:** Submit checkout with `idempotencyKey = "pos-key-123"`. Intercept/retry with identical key.
  - **Expected Result:** First request deducts stock to `46`. Second request detects existing receipt, returns cached receipt, and DOES NOT deduct stock again (stock remains `46`).
- [ ] **TC-INV-039 [Happy Path]: Stock History Timeline & Audit Log Integrity**
  - **Steps:** Open Product Inventory Detail (`/admin/inventory/:id`). Inspect movement history log.
  - **Expected Result:** Chronological audit trail lists all events: Opening Balance (+50) → Purchase Receipt (+20) → Sales Invoice (-12) → POS Sale (-2) → Manual Adjustment (-1), with exact running balances after each transaction.
