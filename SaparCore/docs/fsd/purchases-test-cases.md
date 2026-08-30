# Purchases, Expenses & Supplier AP Test Cases

**Module:** `purchases`  
**FSD:** [`docs/fsd/purchases.md`](./purchases.md)  
**Standard:** Uzbekistan 12% Input QQS, Multi-Step Approval, FIFO Cost Layers, Supplier AP Aging, Petty Cash (Kassa).

---

## 📋 Test Case Matrix

### Suite 01: Purchase Order Lifecycle & PO-to-Purchase Conversion
- `TC-PUR-001`: Create Purchase Order (Draft/New) with supplier, items, 12% QQS tax.
- `TC-PUR-002`: List & retrieve Purchase Orders with status filtering.
- `TC-PUR-003`: 1-Click convert Purchase Order into Official Purchase (`/purchase-order-convert`).
- `TC-PUR-004`: Assert PO status updates to `completed` upon conversion.

### Suite 02: Purchases, Input QQS & Inventory FIFO Cost Layer
- `TC-PUR-005`: Create official Purchase with 12% Input QQS and assert calculated tax amounts.
- `TC-PUR-006`: Assert FIFO `InventoryCostLayer` created in PostgreSQL at exact unit cost.
- `TC-PUR-007`: Foreign Currency Purchase (USD/EUR) converts at exchange rate to base `UZS` cost layer.
- `TC-PUR-008`: Approval Workflow: Approve pending purchase (`POST /purchases/:id/approve`).

### Suite 03: Supplier Payments & Balance Tracking
- `TC-PUR-009`: Record Supplier Payment against Purchase (`status: partially_paid` $\to$ `paid`).
- `TC-PUR-010`: Query Supplier Balances Report (`GET /reports/supplier-balances`).
- `TC-PUR-011`: Void Supplier Payment and assert purchase balance reverts.

### Suite 04: Operating Expenses & Petty Cash (Kassa / Naqd Pul)
- `TC-PUR-012`: Record Operating Expense with category and bank source.
- `TC-PUR-013`: Petty Cash Kassa Add Funds (`POST /petty-cash/add`).
- `TC-PUR-014`: Petty Cash Kassa Spend Funds (`POST /petty-cash/spend`) and verify running balance.
