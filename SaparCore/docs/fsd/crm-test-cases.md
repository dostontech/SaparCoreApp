# CRM & Visual Sales Pipeline Test Cases

**Module:** `crm`  
**FSD:** [`docs/fsd/crm.md`](./crm.md)  
**Standard:** Unified Contacts, Uzbekistan STIR/PINFL, Visual Sales Pipeline (Kanban), Deal Value Aggregation, Win-rate calculation.

---

## 📋 Test Case Matrix

### Suite 01: Unified Contacts Directory
- `TC-CRM-001`: Create Unified Contact with STIR (9 digits), phone, email, and billing address.
- `TC-CRM-002`: Search & filter contacts list by name, company, or tax number.
- `TC-CRM-003`: Update contact profile and verify persistence.

### Suite 02: Visual Sales Pipeline (Kanban Stages) & Deals
- `TC-CRM-004`: Retrieve Deals Pipeline (`GET /crm/pipeline`) with grouped Kanban stage metrics.
- `TC-CRM-005`: Create new Deal (`POST /crm/deals`) in `LEAD` stage with value and expected close date.
- `TC-CRM-006`: Progress Deal through stages: `LEAD` $\to$ `PROPOSAL` $\to$ `WON` (`PUT /crm/deals/:id/stage`).
- `TC-CRM-007`: Verify Won Value and Win-rate percentage recalculation.
- `TC-CRM-008`: Delete Deal (`DELETE /crm/deals/:id`) and assert pipeline metrics update.
