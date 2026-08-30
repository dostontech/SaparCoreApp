# FSD — Inventory Management

**Module slug:** `inventory`
**File:** `docs/fsd/inventory.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Inventory module manages the physical goods lifecycle:

- **Product/Service catalogue** with barcode, SKU, MXIK code, categories, brands, units
- **Multi-warehouse stock tracking** — real-time quantity on hand per product
- **Cost valuation** — both Weighted Average Cost (WAC) and FIFO cost layers
- **Inventory movements** — stock in (purchase), stock out (sale/invoice), adjustments, write-offs
- **Barcode generation** — auto-generation of EAN-13 style barcodes
- **Low-stock alerts** — configurable alert quantity per product

**Regional scope:** Uzbekistan. Products require MXIK/IKPU codes (Milliy Mahsulot Klassifikatori — 17-digit national product classifier) for E-Faktura generation. Default currency UZS.

---

## 2. Data Model — Main Entities

### 2.1 Product

```prisma
model Product {
  id              String          @id @default(uuid())
  item_type       ProductItemType // Product | Service
  name            String
  code            String          @unique   // internal SKU/code
  categoryId      String?
  brandId         String?
  unitId          String?
  selling_price   Decimal         @db.Decimal(18,4)
  purchase_price  Decimal         @db.Decimal(18,4)
  discount_type   String          @default("Fixed")  // Fixed | Percentage
  discount_value  Decimal         @default(0) @db.Decimal(18,4)
  taxGroupId      String?         // legacy
  taxRateId       String?         // unified tax rate FK
  barcode         String?         @unique
  alert_quantity  Int             @default(0)
  description     String?
  product_image   String?
  gallery_images  Json?
  enable_inventory Boolean        @default(false)
  stock           Int             @default(0)         // legacy integer stock
  status          Boolean         @default(true)
  valuationMethod String          @default("WAC")     // WAC | FIFO
  currencyCode    String?
}
```

### 2.2 Inventory (per-product stock record)

```prisma
model Inventory {
  id              String   @id @default(uuid())
  productId       String
  quantity        Int      @default(0)          // legacy integer
  avgCost         Decimal  @default(0) @db.Decimal(18,4)   // WAC unit cost
  quantityOnHand  Decimal  @default(0) @db.Decimal(18,4)   // ledger-aware (WAC)
  userId          String
  inventory_history Json?  // legacy embedded history array
  notes           String?
  isDeleted       Boolean  @default(false)
}
```

### 2.3 InventoryCostLayer (FIFO)

```prisma
model InventoryCostLayer {
  id           String   @id @default(uuid())
  userId       String
  productId    String
  qtyRemaining Decimal  @db.Decimal(18,4)
  unitCost     Decimal  @db.Decimal(18,4)
  receivedAt   DateTime
  sourceType   String?   // PURCHASE | ADJUSTMENT
  sourceId     String?   // FK to Purchase or adjustment record
  isDeleted    Boolean  @default(false)
  createdAt    DateTime @default(now())
  // @@index([userId, productId, receivedAt])
}
```

### 2.4 Supporting Catalogue Models

```prisma
model Category {
  id             String   @id
  category_name  String   @unique
  slug           String   @unique
  category_image String?
  status         Boolean  @default(true)
}

model Brand {
  id          String   @id
  brand_name  String   @unique
  brand_image String?
  status      Boolean  @default(true)
}

model Unit {
  id         String   @id
  unit_name  String
  short_name String
  status     Boolean? @default(true)
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Products

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/products` | `ProductController.ts::getProducts` |
| `GET` | `/admin/products/:id` | `ProductController.ts::getProductById` |
| `POST` | `/admin/products` | `ProductController.ts::createProduct` |
| `PUT` | `/admin/products/:id` | `ProductController.ts::updateProduct` |
| `DELETE` | `/admin/products/:id` | `ProductController.ts::deleteProduct` |
| `GET` | `/admin/products/barcode/:barcode` | `ProductController.ts::getByBarcode` |
| `POST` | `/admin/products/:id/generate-barcode` | `ProductController.ts::generateBarcode` |

#### Inventory

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/inventory` | `ProductController.ts::getInventoryList` |
| `GET` | `/admin/inventory/:id` | `ProductController.ts::getInventoryById` |
| `POST` | `/admin/inventory/adjust` | `ProductController.ts::adjustInventory` |
| `GET` | `/admin/inventory/:id/cost-layers` | — (CostLayers.tsx fetches this) |

#### Categories / Brands / Units

| Method | Path | Controller |
|--------|------|-----------|
| `GET/POST/PUT/DELETE` | `/admin/categories` | `CategoryController.ts` |
| `GET/POST/PUT/DELETE` | `/admin/brands` | `BrandsController.ts` |
| `GET/POST/PUT/DELETE` | `/admin/units` | `UnitsController.ts` |

### 3.2 Business Logic

**WAC (Weighted Average Cost) update:**
On each purchase receipt:
```
new avgCost = (currentStock × oldAvgCost + receivedQty × unitCost) / (currentStock + receivedQty)
Inventory.quantityOnHand += receivedQty
Inventory.avgCost = new avgCost
```

**FIFO cost layer consumption:**
On each sale/invoice:
1. Fetch `InventoryCostLayer` rows for the product ordered by `receivedAt ASC` where `qtyRemaining > 0`
2. Consume FIFO layers until sale quantity is satisfied
3. Reduce `qtyRemaining` on each consumed layer
4. COGS = sum of (consumed units × unitCost) per layer

**Stock deduction on invoice posting:**
Invoice creation triggers `Inventory.quantityOnHand -= saleQty` and posts a GL entry:
```
Dr COGS account
  Cr INVENTORY account
```

**Low-stock alert:**
Checked at inventory update time. If `quantityOnHand <= alert_quantity`, an alert is logged/flagged. Frontend reads this flag in the Inventory List.

**Barcode generation:**
`generateBarcode` creates a unique EAN-13 compatible barcode string using a company-specific prefix + product sequence number. Stored in `Product.barcode`.

### 3.3 Validation Rules

- `code` must be globally unique (not just per-tenant — schema uses `@unique`, not `@@unique([userId, code])`)
- `barcode` must be globally unique (`@unique`)
- `selling_price >= 0` and `purchase_price >= 0`
- `alert_quantity >= 0`
- `valuationMethod` must be `WAC` or `FIFO`
- `item_type` must be `Product` or `Service`
- Services (`item_type = Service`) should have `enable_inventory = false` — not enforced server-side

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Inventory List | `pages/admin/inventory/InventoryList.tsx` | `/admin/inventory` |
| Inventory View | `pages/admin/inventory/InventoryView.tsx` | `/admin/inventory/:id` |
| New Inventory Modal | `pages/admin/inventory/NewInventoryModal.tsx` | Modal |
| Cost Layers | `pages/admin/inventory/CostLayers.tsx` | `/admin/inventory/:id/cost-layers` |
| Product List | `pages/admin/productAndServices/` | `/admin/products` |

### 4.2 User Flows

**Add Product:**
1. Products → New Product
2. Fill: name, SKU/code, category, brand, unit, selling price, purchase price, tax rate
3. Toggle "Enable Inventory" → exposes opening stock and alert quantity fields
4. Set valuation method (WAC or FIFO)
5. Upload product image; optionally add gallery images
6. Generate barcode button → auto-fills barcode field
7. Save → `POST /admin/products`

**Adjust Inventory:**
1. Inventory List → select product → "Adjust"
2. Enter adjustment quantity (positive = stock in, negative = stock out)
3. Select reason (write-off, correction, opening balance, transfer)
4. On save → `POST /admin/inventory/adjust` → creates `InventoryCostLayer` if FIFO, updates `Inventory.quantityOnHand` and `avgCost`

**View FIFO Cost Layers:**
1. Inventory List → select product → "Cost Layers" tab
2. Shows all open FIFO layers: received date, quantity remaining, unit cost, source purchase
3. Running FIFO depletion order clearly visible

**Stock Transfer (inter-warehouse):**
> Not implemented as a separate workflow. Currently handled via paired adjustments (write-off at source + write-on at destination). See Known Gaps.

### 4.3 Key Components

- `InventoryList.tsx` (16 KB): Table with columns: product name, SKU, barcode, quantity on hand, avg cost, value (qty × avg cost), alert status badge. Filter by category.
- `InventoryView.tsx` (9 KB): Product inventory detail: movement history, current stock, cost layers link.
- `CostLayers.tsx` (6 KB): FIFO layers table for a single product.
- `NewInventoryModal.tsx` (8 KB): Quick add/adjust modal for fast stock entry.

---

## 5. Integrations

- **Invoicing:** Invoice line items deduct from `Inventory.quantityOnHand` and consume FIFO cost layers when `enable_inventory = true`. COGS is auto-posted to GL.
- **Purchases:** Purchase receipts add to inventory — either append a new FIFO cost layer or update WAC.
- **POS:** POS checkout (`posController.ts::posCheckout`) deducts inventory for sold items.
- **E-Faktura / Didox:** Each product requires a valid 17-digit MXIK/IKPU code in the Uzbekistan product classifier. The `posController.ts` references `mxikCode` on the product for fiscal receipt generation.
- **AI Bill OCR:** `AiExtractionJob` can extract purchased items from scanned invoices and auto-populate Purchase line items with product matches from the catalogue.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **`Product.code` unique is global, not per-tenant** | 🔴 Critical | `@unique` on `Product.code` means two tenants cannot have the same SKU. Should be `@@unique([userId, code])`. Multi-tenant production break risk. |
| 2 | **`Product.barcode` unique is global** | 🔴 Critical | Same issue as `code` — two tenants cannot share a barcode. Should be `@@unique([userId, barcode])`. |
| 3 | **No separate warehouse/warehouse location model** | 🟡 Medium | AGENTS.md lists "Multi-warehouse (Omborlar) management" as implemented, but there is no `Warehouse` Prisma model. Stock is tracked at the `Inventory` level with no location column. Stock transfers are not a first-class workflow. |
| 4 | **WAC and FIFO partially decoupled** | 🟡 Medium | `Inventory.quantity` (legacy integer) and `Inventory.quantityOnHand` (Decimal, ledger-aware) coexist. The code path that updates which field is inconsistent across purchase/invoice controllers. |
| 5 | **`inventory_history` stored as Json** | 🟡 Medium | Schema comment says "normalisation in later slices." History is an embedded JSON array, not queryable rows. |
| 6 | **MXIK/IKPU codes not on Product model** | 🟡 Medium | `posController.ts` references `(p as any).mxikCode` — field is not in the Prisma schema. MXIK is required for E-Faktura but no UI to enter it. |
| 7 | **Write-offs not first-class** | 🟢 Low | Inventory write-offs are done as negative adjustments. No dedicated `WriteOff` model or approval workflow. |
| 8 | **No barcode scanning integration** | 🟢 Low | Barcode can be entered manually or generated, but no camera/scanner SDK integration on the frontend. |
