# Banking & Reconciliation Test Cases

**Module:** `banking`  
**FSD:** [`docs/fsd/banking.md`](./banking.md)  
**Standard:** Uzbekistan Commercial Banks (Ipak Yo'li, Kapitalbank, Anorbank), Multi-Currency Accounts, Bank Transaction Lifecycle, Auto-Explain, Reconciliation.

---

## 📋 Test Case Matrix

### Suite 01: Bank Accounts Lifecycle & Multi-Bank Management
- `TC-BNK-001`: Create Bank Account (e.g. Ipak Yoʻli Bank, UZS, 20208000900123456001).
- `TC-BNK-002`: Create Foreign Currency Bank Account (Kapitalbank, USD).
- `TC-BNK-003`: List Bank Accounts & retrieve current balances.

### Suite 02: Bank Transactions & Auto-Matching
- `TC-BNK-004`: Record Inflow Bank Transaction (`money_in`) with counterparty and reference.
- `TC-BNK-005`: Record Outflow Bank Transaction (`money_out`) for operational payments.
- `TC-BNK-006`: Query Bank Transactions list and filter by account and status.

### Suite 03: Transaction Categorization & Reconciliation
- `TC-BNK-007`: Query / Create Transaction Categories (Sales Revenue, Operating Costs, Taxes).
- `TC-BNK-008`: Reconcile Bank Transaction (`POST /bank-reconcile/:id`).
- `TC-BNK-009`: Query Reconciled Bank Transactions (`GET /bank-transactions-reconcile`).
