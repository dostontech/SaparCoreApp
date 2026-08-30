# Customer Support & Helpdesk Test Cases

**Module:** `helpdesk`  
**FSD:** [`docs/fsd/helpdesk.md`](./helpdesk.md)  
**Standard:** Customer Support Ticketing, Multi-Channel Communication, Ticket Priorities, Staff Replies, Resolution Workflows.

---

## 📋 Test Case Matrix

### Suite 01: Support Ticket Lifecycle
- `TC-HLP-001`: Create Support Ticket (`POST /helpdesk/tickets`) with customer email, category, priority, and issue description.
- `TC-HLP-002`: List Support Tickets (`GET /helpdesk/tickets`) and filter by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`).
- `TC-HLP-003`: Send Staff Reply (`POST /helpdesk/tickets/:ticketId/reply`) and attach conversation history.
- `TC-HLP-004`: Resolve Support Ticket (`PUT /helpdesk/tickets/:ticketId/status`) and assert closed status.
