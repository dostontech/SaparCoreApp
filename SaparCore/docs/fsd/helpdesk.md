# FSD — Customer Support / Helpdesk

**Module slug:** `helpdesk`
**File:** `docs/fsd/helpdesk.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Helpdesk module provides an internal customer support ticketing system:

- **Ticket creation** — customers or agents create support tickets linked to company/contact
- **Ticket conversation** — threaded message history with role-based senders (CUSTOMER / AGENT / SYSTEM)
- **Priority & SLA** — LOW / MEDIUM / HIGH / URGENT with SLA hours
- **Status workflow** — NEW → IN_PROGRESS → WAITING_CLIENT → RESOLVED
- **Agent assignment** — tickets assigned to named support agents

**Regional scope:** Uzbekistan. Demo ticket subjects reference Uzbekistan-specific issues (E-IMZO signing errors, Ipak Yo'li Bank statement delays, Didox EDI problems). Interface labels in Uzbek.

> **CRITICAL ARCHITECTURE NOTE:** The entire helpdesk module runs on in-memory storage. No Prisma model exists for tickets. All data is lost on server restart.

---

## 2. Data Model

### 2.1 SupportTicket (in-memory, NOT persisted)

```typescript
interface SupportTicket {
  id: string;           // TICK-{timestamp}
  userId: string;       // tenant
  ticketNumber: string; // SUP-{year}-{random 3 digits}
  subject: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED';
  slaHours: number;     // URGENT=2, HIGH=4, MEDIUM/LOW=8
  assignedAgentName: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;           // MSG-{timestamp}
  senderName: string;
  senderRole: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  message: string;
  createdAt: string;
}
```

Storage: `ticketsStore: Record<userId, SupportTicket[]>` in `helpdeskController.ts` process memory.

**No Prisma model exists for helpdesk.** Compare with the `Conversation` model in the schema — that is for the AI document creation conversation flow, not customer support.

---

## 3. Backend

### 3.1 API Endpoints

| Method | Path | Controller | Auth |
|--------|------|-----------|------|
| `GET` | `/admin/helpdesk/tickets` | `helpdeskController.ts::listTickets` | JWT |
| `POST` | `/admin/helpdesk/tickets` | `helpdeskController.ts::createTicket` | JWT |
| `POST` | `/admin/helpdesk/tickets/:ticketId/reply` | `helpdeskController.ts::replyToTicket` | JWT |
| `PATCH` | `/admin/helpdesk/tickets/:ticketId/status` | `helpdeskController.ts::updateTicketStatus` | JWT |

### 3.2 Business Logic

**Ticket creation:**
- Generates `ticketNumber = SUP-{year}-{random 3-digit}`
- SLA hours derived from priority: URGENT→2h, HIGH→4h, MEDIUM/LOW→8h
- `assignedAgentName` hardcoded to 'Sardor Raximov' (no real agent assignment logic)
- First `initialMessage` from body is appended as a `CUSTOMER` role message

**Reply (`replyToTicket`):**
- Appends a new `TicketMessage` to the ticket's `messages` array
- If `role = AGENT` → sets ticket status to `WAITING_CLIENT`
- If `role = CUSTOMER` → sets ticket status to `IN_PROGRESS`

**Status update:**
- Direct status update to any valid status value
- No enforced state machine (can jump from NEW to RESOLVED)

**Default demo tickets:**
On first access per tenant, two demo tickets are initialized:
1. E-IMZO / Didox signing error (HIGH, IN_PROGRESS)
2. Ipak Yo'li Bank statement delay (MEDIUM, NEW)

### 3.3 Validation Rules

- `subject`, `customerName`, `customerEmail` required for ticket creation (no explicit validation — missing fields result in undefined values stored)
- No email format validation
- Priority must be one of LOW/MEDIUM/HIGH/URGENT (no server-side enum check)
- Status values: NEW/IN_PROGRESS/WAITING_CLIENT/RESOLVED (no enum enforcement)

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Helpdesk Tickets | `pages/admin/helpdesk/HelpdeskTicketsPage.tsx` | `/admin/helpdesk/tickets` |

### 4.2 User Flows

**View Tickets:**
1. Navigate to Helpdesk → Tickets
2. Ticket list shows: ticket number, subject, customer name, priority badge (color-coded), status badge, SLA remaining indicator, assigned agent
3. Click ticket → expands to show conversation thread

**Create New Ticket:**
1. "Yangi murojaat" (New Ticket) button
2. Form: subject, customer name, email, phone, priority, initial message
3. Submit → `POST /admin/helpdesk/tickets`
4. Ticket appears at top of list with status NEW

**Reply to Ticket:**
1. Expand ticket → message thread shown chronologically
2. Agent types reply in text area
3. "Yuborish" (Send) → `POST /admin/helpdesk/tickets/:id/reply` with `role=AGENT`
4. Status automatically changes to WAITING_CLIENT

**Resolve Ticket:**
1. Ticket detail → "Yechildi" (Resolved) button
2. `PATCH /admin/helpdesk/tickets/:id/status` with `status=RESOLVED`

### 4.3 Key Components

- `HelpdeskTicketsPage.tsx` (20 KB): Combined list + detail view. Priority color badges (URGENT=red, HIGH=orange, MEDIUM=yellow, LOW=green). SLA countdown display. Message thread with role-based avatar icons (customer, agent, system).

---

## 5. Integrations

- **WhatsApp:** `whatsappController.ts` is present for sending notifications but is not currently wired to helpdesk ticket events (e.g., no auto-WhatsApp on ticket creation or status change).
- **Email reminders:** `reminderController.ts` handles invoice/quotation reminders but not helpdesk ticket notifications.
- **Contacts:** Tickets store `customerName` and `customerEmail` as plain strings — no FK to `Contact` model. No bidirectional link: viewing a contact does not show their ticket history.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Tickets not persisted** | 🔴 Critical | `ticketsStore` is process-local in-memory. All tickets lost on restart. Need `SupportTicket` + `TicketMessage` Prisma models. |
| 2 | **No Contact FK on ticket** | 🔴 Critical | Cannot link a ticket to a `Contact` record for history tracking. Customer info is plain strings. |
| 3 | **No real agent assignment** | 🔴 Critical | `assignedAgentName` is hardcoded. No user picker, no agent queue management, no workload balancing. |
| 4 | **No SLA enforcement** | 🟡 Medium | `slaHours` is stored but no cron job checks SLA breaches or escalates overdue tickets. |
| 5 | **No ticket email notifications** | 🟡 Medium | No email sent to customer on ticket creation, agent reply, or resolution. |
| 6 | **No file attachments on tickets** | 🟡 Medium | Customers often need to attach screenshots (e.g., E-IMZO error screenshots). No attachment support. |
| 7 | **No WhatsApp → ticket creation** | 🟢 Low | AGENTS.md mentions "WhatsApp & Email notification triggers." Inbound WhatsApp messages should be able to auto-create tickets. Not implemented. |
| 8 | **No customer portal** | 🟢 Low | Customers cannot self-service view their ticket status. Agents must relay updates. |
| 9 | **Input validation missing** | 🟡 Medium | `createTicket` does not validate required fields. Missing `subject` results in a ticket with `undefined` subject. |
