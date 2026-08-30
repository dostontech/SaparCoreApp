# FSD — Projects & Time Tracking

**Module slug:** `projects`
**File:** `docs/fsd/projects.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The Projects & Time Tracking module provides:

- **Project Registry** — client projects with billing rates, dates, and budget
- **Project Members** — team assignment with per-member billing rates and roles
- **Timesheets** — weekly employee time entry against projects with approval workflow
- **Time Entries** — billable/non-billable hour records per project per day
- **Time Reports** — aggregated billable hours, project revenue, utilization
- **Leave Management** — leave types, allocations, requests, approvals, holiday calendar (shared with HRM; see `hrm-payroll.md`)
- **Task Kanban Board** (in-memory) — project task management with 4 stages
- **Project Profitability P&L** — revenue vs. costs (in-memory mockup)

**Note:** Leave management and Holiday calendar are architecturally part of the same time tracking system and are documented jointly in `hrm-payroll.md`. This document focuses on project-specific features.

---

## 2. Data Model — Main Entities

### 2.1 Project

```prisma
model Project {
  id          String    @id @default(uuid())
  userId      String    // tenant
  code        String    // e.g. "PROJ-001"
  name        String
  description String?
  status      String    @default("active")  // active | completed | on_hold
  billingRate Decimal?  @db.Decimal(12,2)   // default hourly rate in UZS
  startDate   DateTime?
  endDate     DateTime?
  contactId   String?   // linked client contact (no FK enforced)
  // @@unique([userId, code])
}
```

Back-relations: `Invoice.projectId`, `Expense.projectId`, `Purchase.projectId`, `JournalLine.projectId` — all GL entries can be tagged to a project.

### 2.2 ProjectMember

```prisma
model ProjectMember {
  id             String            @id
  userId         String            // tenant
  projectId      String
  employeeUserId String            // FK to User
  role           ProjectMemberRole // MEMBER | MANAGER
  billingRate    Decimal?          @db.Decimal(12,2)  // override project default
  isActive       Boolean           @default(true)
  // @@unique([projectId, employeeUserId])
}
```

### 2.3 Timesheet

```prisma
model Timesheet {
  id             String          @id
  userId         String          // tenant
  employeeUserId String
  weekStartDate  DateTime        // Monday, UTC midnight
  status         TimesheetStatus // DRAFT | SUBMITTED | APPROVED | REJECTED
  submittedAt    DateTime?
  approvedById   String?
  approvedAt     DateTime?
  rejectionNote  String?
  entries        TimeEntry[]
  // @@unique([employeeUserId, weekStartDate])
}
```

### 2.4 TimeEntry

```prisma
model TimeEntry {
  id          String   @id
  timesheetId String
  projectId   String
  date        DateTime
  hours       Decimal  @db.Decimal(5,2)
  billable    Boolean  @default(true)
  note        String?
}
```

### 2.5 ProjectTask (in-memory, NOT persisted)

```typescript
interface ProjectTask {
  id: string;          // TASK-{timestamp}
  projectId: string;
  title: string;
  description?: string;
  stage: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedToName: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
}
```

> **CRITICAL GAP:** `tasksStore` is a process-local `Record<projectId, ProjectTask[]>`. Tasks are lost on server restart. No `Task` Prisma model exists.

---

## 3. Backend

### 3.1 API Endpoints

#### Projects

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/projects` | `adminRoutes.js` (project CRUD) |
| `POST` | `/admin/projects` | |
| `PUT` | `/admin/projects/:id` | |
| `DELETE` | `/admin/projects/:id` | |
| `GET` | `/admin/projects/:projectId/workspace` | `projectWorkspaceController.ts::getProjectWorkspace` |
| `POST` | `/admin/projects/:projectId/tasks` | `projectWorkspaceController.ts::createProjectTask` |
| `PATCH` | `/admin/projects/:projectId/tasks/:taskId/stage` | `projectWorkspaceController.ts::updateProjectTaskStage` |
| `DELETE` | `/admin/projects/:projectId/tasks/:taskId` | `projectWorkspaceController.ts::deleteProjectTask` |

#### Project Members

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/projects/:id/members` | `projectMemberController.ts` |
| `POST` | `/admin/projects/:id/members` | `projectMemberController.ts::addMember` |
| `PUT` | `/admin/projects/:id/members/:memberId` | `projectMemberController.ts::updateMember` |
| `DELETE` | `/admin/projects/:id/members/:memberId` | `projectMemberController.ts::removeMember` |

#### Timesheets

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/time-tracking/timesheets` | `timesheetController.ts` |
| `POST` | `/admin/time-tracking/timesheets` | `timesheetController.ts::createTimesheet` |
| `PUT` | `/admin/time-tracking/timesheets/:id/entries` | `timesheetController.ts::upsertEntries` |
| `POST` | `/admin/time-tracking/timesheets/:id/submit` | |
| `POST` | `/admin/time-tracking/timesheets/:id/approve` | |
| `POST` | `/admin/time-tracking/timesheets/:id/reject` | |
| `GET` | `/admin/time-tracking/reports` | `timeReportController.ts` |

### 3.2 Business Logic

**Project workspace (`getProjectWorkspace`):**
- Returns `tasksStore[projectId]` (in-memory tasks)
- Returns hardcoded financial summary (revenue, costs, margin) as a demo mockup
- Tasks are initialized with 4 Uzbek-language demo tasks on first access

**Task stage update:**
- Drag-and-drop on frontend calls `PATCH /projects/:id/tasks/:taskId/stage`
- `task.stage` updated in `tasksStore[projectId]`

**Timesheet weekly grid:**
- One `Timesheet` per `(employeeUserId, weekStartDate)` — enforced by unique constraint
- `upsertEntries`: Batch upsert of `TimeEntry` rows for the week. Each entry: one project, one day, hours amount
- Total hours per week computed from `SUM(entry.hours)` per timesheet

**Time report aggregation (`timeReportController.ts`):**
- Queries `TimeEntry` joined with `Timesheet` and `Project`
- Groups by `projectId`, `employeeUserId`, `billable` flag
- Computes: total hours, billable hours, billable amount (hours × member billing rate)

**Project profitability:**
- Invoices tagged `projectId` → revenue
- Expenses + Purchases tagged `projectId` → costs
- Labor cost from `TimeEntry.hours × ProjectMember.billingRate`
- Net margin = revenue - costs

### 3.3 Validation Rules

**Project creation:**
- `code` unique per tenant (`@@unique([userId, code])`)
- `endDate >= startDate` if both provided

**Project member:**
- `employeeUserId` must be a tenant user
- Unique constraint: one member record per `(projectId, employeeUserId)`
- `billingRate >= 0` if provided

**Timesheet:**
- `weekStartDate` must be a Monday (validated in controller)
- `hours` per entry: `> 0` and `<= 24`
- Can only submit a DRAFT timesheet; can only approve/reject SUBMITTED

**Task (in-memory):**
- `title` required

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Project Workspace (Kanban) | `pages/admin/projects/ProjectWorkspacePage.tsx` | `/admin/projects/:projectId/workspace` |
| Projects List | `pages/admin/accounting/Projects.tsx` | `/admin/projects` |
| My Timesheet | `pages/admin/payroll/MyTimesheet.tsx` | `/admin/payroll/my-timesheet` |
| Timesheet Approvals | `pages/admin/payroll/TimesheetApprovals.tsx` | `/admin/payroll/timesheet-approvals` |
| Time Reports | `pages/admin/payroll/TimeReports.tsx` | `/admin/payroll/time-reports` |

### 4.2 User Flows

**Project Task Kanban:**
1. Navigate to Projects → select project → Workspace
2. 4-column Kanban: TODO / IN_PROGRESS / REVIEW / DONE
3. Task cards show: title, assignee, due date, priority badge, estimated vs actual hours
4. Drag card between columns → `PATCH /projects/:id/tasks/:taskId/stage`
5. "New Task" button → form modal → `POST /projects/:id/tasks`
6. Financial summary panel on right: budget, billed revenue, costs, margin

**Weekly Timesheet:**
1. Employee → My Timesheet → current week shown
2. Rows = projects they are members of
3. Enter hours per day (Mon–Sun) × project row
4. Mark individual entries as billable/non-billable
5. Submit for manager approval
6. Manager approves in Timesheet Approvals → entries become billable records

**Time Report:**
1. Manager → Time Reports → select date range + optionally filter by employee/project
2. Report shows: total hours, billable hours, revenue, utilization %
3. Export to CSV

### 4.3 Key Components

- `ProjectWorkspacePage.tsx` (20 KB): Kanban board with in-memory tasks. Financial summary panel. Add/edit task modal.
- `MyTimesheet.tsx` (36 KB): Weekly grid with project rows. Submit/recall flow. Running weekly total counter.
- `TimesheetApprovals.tsx` (20 KB): Manager approval queue. Shows employee, week, total hours, project breakdown.
- `TimeReports.tsx` (16 KB): Aggregated time report table with filter controls.

---

## 5. Integrations

- **Invoicing:** `Invoice.projectId` → project revenue. Billed invoices appear in project P&L.
- **Expenses / Purchases:** Tagged with `projectId` → project cost.
- **GL:** `JournalLine.projectId` tags all double-entry lines to a project for dimension reporting.
- **Dimension Report:** `dimensionReportController.ts` + `/admin/reports/dimension` provides a GL breakdown by project and cost center.
- **HRM/Payroll:** `PayRunLine` wage costs can be allocated to projects via labor cost computation in the time report.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Project tasks not persisted** | 🔴 Critical | `tasksStore` is process-local in-memory. All Kanban tasks lost on restart. Need `Task` Prisma model with status, priority, assignment, due date, hours. |
| 2 | **Project profitability is hardcoded mockup** | 🔴 Critical | `getProjectWorkspace` returns hardcoded financial figures (budget: 120M, revenue: 95M). Live calculation from `Invoice`, `Expense`, `Purchase`, `TimeEntry` with `projectId` is not implemented in the workspace endpoint. |
| 3 | **Single workspace page for all projects** | 🟡 Medium | `ProjectWorkspacePage.tsx` defaults to `projectId = 'proj-main'`. Multi-project Kanban is conceptually supported but navigation between projects needs proper routing. |
| 4 | **No task assignment to User model** | 🟡 Medium | `ProjectTask.assignedToName` is a plain string, not a FK to `User`. No proper assignment or notification. |
| 5 | **No milestone tracking** | 🟡 Medium | AGENTS.md roadmap item: "Task assignments, deadlines, and milestone tracking." Milestones are not modeled. |
| 6 | **Client project profitability report missing** | 🟡 Medium | AGENTS.md lists "Client project profitability reporting." The `timeReportController` provides hours but not the full P&L combining invoices + expenses + labor. |
| 7 | **`Project.contactId` is a plain string, no FK** | 🟢 Low | Schema comment: "no relation needed; userId is a plain scalar FK." The client link exists as a scalar only — no relational integrity. |
