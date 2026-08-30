# FSD — HRM & Payroll

**Module slug:** `hrm-payroll`
**File:** `docs/fsd/hrm-payroll.md`
**Last updated:** 2026-08-23

---

## 1. Purpose and Scope

The HRM & Payroll module manages the complete employee lifecycle within a single-tenant workspace:

- **Employee Directory** — staff `User` records with payroll profiles
- **Payroll Calculation** — gross salary, Uzbekistan statutory deductions (JShODS 12%, Ijtimoiy Soliq 12%, INPS 0.1%), net pay computation, GL posting
- **Pay Runs** — monthly payroll batch with finalize/void lifecycle, journal entry generation
- **Time Tracking** — weekly timesheets, project-hour allocation, billable hours
- **Leave Management** — leave types, allocations, requests with approval workflow, holiday calendar
- **Tabel (Attendance)** — daily attendance sheet UI (TabelAttendancePage)

**Regional scope:** Uzbekistan. Tax rates are coded to Uzbek statutory rates. Account codes 9230 (Wages Expense), 9260 (Net Payable), 9270 (Deductions Payable) follow the Uzbekistan National Chart of Accounts.

---

## 2. Data Model — Main Entities

### 2.1 PayrollProfile

```prisma
model PayrollProfile {
  id             String       @id @default(uuid())
  userId         String       // tenant (company owner id)
  employeeUserId String       // FK to User
  defaultGross   Decimal?     @db.Decimal(18,4)  // base monthly gross in UZS
  payFrequency   PayFrequency @default(MONTHLY)   // only MONTHLY supported
  isActive       Boolean      @default(true)
  isDeleted      Boolean      @default(false)
}
```

One profile per employee per company. Enforced by unique guard in `createProfile`.

### 2.2 PayRun

```prisma
model PayRun {
  id           String       @id @default(uuid())
  userId       String       // tenant
  taxYearLabel String       // e.g. "2026"
  taxMonth     Int          // 1-12
  periodStart  DateTime
  periodEnd    DateTime
  status       PayRunStatus // DRAFT | FINALIZED | VOID
  finalizedAt  DateTime?
  voidedAt     DateTime?
  isDeleted    Boolean      @default(false)
  lines        PayRunLine[]
}
```

### 2.3 PayRunLine

```prisma
model PayRunLine {
  id             String   @id @default(uuid())
  payRunId       String
  employeeUserId String
  gross          Decimal  @db.Decimal(18,4)
  deductions     Decimal  @default(0) @db.Decimal(18,4)
  net            Decimal  @db.Decimal(18,4)
  deductionLines Json?    // [{label, amount}] — JShODS, Ijtimoiy, INPS
  note           String?
}
```

### 2.4 Timesheet + TimeEntry

```prisma
model Timesheet {
  id             String          @id @default(uuid())
  userId         String          // tenant
  employeeUserId String
  weekStartDate  DateTime        // Monday UTC midnight
  status         TimesheetStatus // DRAFT | SUBMITTED | APPROVED | REJECTED
  submittedAt    DateTime?
  approvedById   String?
  approvedAt     DateTime?
  rejectionNote  String?
  entries        TimeEntry[]
}

model TimeEntry {
  id          String    @id @default(uuid())
  timesheetId String
  projectId   String
  date        DateTime
  hours       Decimal   @db.Decimal(5,2)
  billable    Boolean   @default(true)
  note        String?
}
```

Unique constraint: one Timesheet per `(employeeUserId, weekStartDate)`.

### 2.5 Leave Management

```prisma
model LeaveType {
  id                    String   // tenant-scoped
  name                  String
  paid                  Boolean  @default(true)
  defaultAllocationDays Decimal? @db.Decimal(5,1)
  isActive              Boolean  @default(true)
}

model LeaveAllocation {
  employeeUserId  String
  leaveTypeId     String
  year            Int
  allocatedDays   Decimal  @db.Decimal(5,1)
  carriedOverDays Decimal  @default(0) @db.Decimal(5,1)
  // @@unique([employeeUserId, leaveTypeId, year])
}

model LeaveRequest {
  employeeUserId String
  leaveTypeId    String
  startDate      DateTime
  endDate        DateTime
  status         LeaveStatus  // PENDING | APPROVED | REJECTED | CANCELLED
  reason         String?
  totalDays      Decimal      @db.Decimal(5,1)
  approvedById   String?
  days           LeaveRequestDay[]
}

model LeaveRequestDay {
  leaveRequestId String
  date           DateTime
  portion        LeavePortion  // FULL | AM | PM
  portionDays    Decimal       @db.Decimal(2,1)
}

model Holiday {
  userId          String
  name            String
  date            DateTime
  recurringYearly Boolean @default(false)
}
```

---

## 3. Backend

### 3.1 API Endpoints

#### Payroll Profiles

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/payroll/profiles` | `payrollController.ts::listProfiles` |
| `POST` | `/admin/payroll/profiles` | `payrollController.ts::createProfile` |
| `PUT` | `/admin/payroll/profiles/:id` | `payrollController.ts::updateProfile` |
| `DELETE` | `/admin/payroll/profiles/:id` | `payrollController.ts::deleteProfile` |

#### Pay Runs

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/payroll/pay-runs` | `payrollController.ts::listPayRuns` |
| `POST` | `/admin/payroll/pay-runs` | `payrollController.ts::createPayRun` |
| `GET` | `/admin/payroll/pay-runs/:id` | `payrollController.ts::getPayRun` |
| `POST` | `/admin/payroll/pay-runs/:id/finalize` | `payrollController.ts::finalizePayRun` |
| `POST` | `/admin/payroll/pay-runs/:id/void` | `payrollController.ts::voidPayRun` |
| `PUT` | `/admin/payroll/pay-runs/:id/lines/:lineId` | `payrollController.ts::updatePayRunLine` |

#### Timesheets

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/time-tracking/timesheets` | `timesheetController.ts` |
| `POST` | `/admin/time-tracking/timesheets` | `timesheetController.ts::createTimesheet` |
| `PUT` | `/admin/time-tracking/timesheets/:id/entries` | `timesheetController.ts::upsertEntries` |
| `POST` | `/admin/time-tracking/timesheets/:id/submit` | `timesheetController.ts::submitTimesheet` |
| `POST` | `/admin/time-tracking/timesheets/:id/approve` | `timesheetController.ts::approveTimesheet` |
| `POST` | `/admin/time-tracking/timesheets/:id/reject` | `timesheetController.ts::rejectTimesheet` |
| `GET` | `/admin/time-tracking/reports` | `timeReportController.ts` |

#### Leave

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/time-tracking/leave-types` | `leaveTypeController.ts` |
| `POST` | `/admin/time-tracking/leave-types` | `leaveTypeController.ts::createLeaveType` |
| `GET` | `/admin/time-tracking/leave-requests` | `leaveRequestController.ts` |
| `POST` | `/admin/time-tracking/leave-requests` | `leaveRequestController.ts::createLeaveRequest` |
| `POST` | `/admin/time-tracking/leave-requests/:id/approve` | `leaveRequestController.ts::approveLeaveRequest` |
| `POST` | `/admin/time-tracking/leave-requests/:id/reject` | `leaveRequestController.ts::rejectLeaveRequest` |
| `GET` | `/admin/time-tracking/leave-allocations` | `leaveRequestController.ts` |
| `POST` | `/admin/time-tracking/leave-allocations` | `leaveRequestController.ts::allocateLeave` |
| `GET` | `/admin/time-tracking/leave-report` | `leaveReportController.ts` |
| `GET` | `/admin/time-tracking/holidays` | `holidayController.ts` |
| `POST` | `/admin/time-tracking/holidays` | `holidayController.ts::createHoliday` |

#### Soliq Payroll Tax Reports

| Method | Path | Controller |
|--------|------|-----------|
| `GET` | `/admin/soliq/jshods` | `soliqTaxReportsController.ts::getSoliqJshodsDeclaration` |

### 3.2 Business Logic — Uzbekistan Payroll Tax

Computed in `payrollController.ts::computeLineTotals` + `lib/payroll/`:

```
Gross Salary (Oylik maosh - Ish haqi)
  - JShODS (Jismoniy shaxslardan olinadigan daromad solig'i): 12% of Gross
  - INPS (ShJBPH — Shaxsiy jamg'arib boriladigan pensiya): 0.1% of Gross
= Net Salary (To'lanadigan miqdor)

Employer obligations (booked separately):
  - Ijtimoiy soliq (Social Tax): 12% of Gross (employer pays, not deducted from employee)
```

**GL posting on PayRun finalization** (`lib/payroll/payRunPosting.ts::postPayRunLineAccrual`):
```
Dr 9230 (Wages Expense)            = Gross
  Cr 9260 (Net Payable to Employee) = Net
  Cr 9270 (Deductions Payable)      = JShODS + INPS
```

**Reversal on void** (`reversePayRunLineAccrual`): Creates a mirror journal entry with `event = 'PAYRUN_VOID'`.

**Account resolution:** Accounts 9230/9260/9270 are looked up by code from the tenant's chart of accounts. Throws if not initialized (requires payroll accounts backfill migration).

### 3.3 Validation Rules

**PayrollProfile:**
- `employeeUserId` required; must be a User that belongs to the tenant (`id == tenantId` OR `ownerId == tenantId`)
- One active profile per employee (409 Conflict if duplicate)
- `defaultGross >= 0`

**PayRun creation:**
- `taxMonth` must be 1–12
- `periodStart <= periodEnd`
- Cannot create a second DRAFT run for same `(userId, taxYearLabel, taxMonth)` (unique constraint implied)

**PayRunLine:**
- `deductions <= gross` (400 error if exceeded)
- `net = gross - deductions`

**Leave Request:**
- `startDate <= endDate`
- Leave days must not exceed allocation for the year
- Half-day leaves require `LeavePortion.AM` or `LeavePortion.PM`

**Timesheet:**
- One timesheet per `(employeeUserId, weekStartDate)` — unique constraint
- `hours` per entry must be `> 0` and `<= 24`
- Can only submit a DRAFT timesheet; can only approve/reject a SUBMITTED timesheet

---

## 4. Frontend

### 4.1 Screens

| Screen | File | Route |
|--------|------|-------|
| Payroll Profiles | `pages/admin/payroll/PayrollProfiles.tsx` | `/admin/payroll/profiles` |
| Pay Runs | `pages/admin/payroll/PayRuns.tsx` | `/admin/payroll/pay-runs` |
| My Timesheet | `pages/admin/payroll/MyTimesheet.tsx` | `/admin/payroll/my-timesheet` |
| Timesheet Approvals | `pages/admin/payroll/TimesheetApprovals.tsx` | `/admin/payroll/timesheet-approvals` |
| Time Reports | `pages/admin/payroll/TimeReports.tsx` | `/admin/payroll/time-reports` |
| My Leave | `pages/admin/payroll/MyLeave.tsx` | `/admin/payroll/my-leave` |
| Leave Approvals | `pages/admin/payroll/LeaveApprovals.tsx` | `/admin/payroll/leave-approvals` |
| Leave Report | `pages/admin/payroll/LeaveReport.tsx` | `/admin/payroll/leave-report` |
| Leave Types | `pages/admin/payroll/LeaveTypes.tsx` | `/admin/payroll/leave-types` |
| Holidays | `pages/admin/payroll/Holidays.tsx` | `/admin/payroll/holidays` |
| Tabel Attendance | `pages/admin/payroll/TabelAttendancePage.tsx` | `/admin/payroll/tabel` |

### 4.2 User Flows

**Create Pay Run:**
1. Manager opens Pay Runs → "Yangi Ish Haqi" (New Pay Run)
2. Select tax year + month, period dates → system pre-fills lines from active PayrollProfiles
3. Each line shows: employee name, gross, computed JShODS (12%), INPS (0.1%), net
4. Manager can override gross or add bonus/deduction lines per employee
5. "Finalize" → calls `POST /admin/payroll/pay-runs/:id/finalize` → GL journal entries posted
6. Finalized pay run generates JShODS declaration data for Soliq report

**Weekly Timesheet:**
1. Employee opens My Timesheet → current week shown as 7-column grid (Mon–Sun)
2. Each row = one project the employee is a member of
3. Employee enters hours per day cell, marks billable/non-billable
4. "Submit" → status SUBMITTED → manager sees it in Timesheet Approvals
5. Manager approves or rejects with a note

**Leave Request:**
1. Employee opens My Leave → clicks "Yangi so'rov" (New Request)
2. Selects leave type, date range, half-day option, reason
3. System checks allocation balance in real-time (remaining = allocated + carried over - used)
4. "Submit" → PENDING; manager notified
5. Manager approves/rejects in Leave Approvals screen

### 4.3 Key Components

- `PayRuns.tsx` (38 KB): Full pay-run lifecycle UI. Displays lines with calculated UZS deductions. Finalize button with confirmation modal.
- `PayrollProfiles.tsx` (15 KB): CRUD table for payroll profiles. Employee picker linked to tenant User list.
- `MyTimesheet.tsx` (36 KB): Weekly grid with editable hour cells. Project row grouping. Submit/recall flow.
- `TimesheetApprovals.tsx` (20 KB): Manager approval queue with bulk approve support.
- `MyLeave.tsx` (25 KB): Calendar + table view of own leave. Balance summary per leave type.
- `LeaveTypes.tsx` (24 KB): Admin CRUD for leave type catalogue (Annual, Sick, Maternity, etc.).
- `TabelAttendancePage.tsx` (14 KB): Daily attendance grid (Uzbek "Tabel" form — standard form T-12). Marks present/absent/leave per employee per day.

---

## 5. Integrations

- **GL / Accounting:** PayRun finalization auto-posts to the GL via `lib/payroll/payRunPosting.ts`. Uses accounts 9230/9260/9270 from the Uzbekistan National Chart of Accounts.
- **Soliq JShODS Declaration:** `soliqTaxReportsController.ts::getSoliqJshodsDeclaration` aggregates payroll data from `PayRun` and `PayRunLine` models to produce the official Form 11101_14 structure (JShODS 12% + Ijtimoiy Soliq 12% + INPS 0.1%).
- **Projects:** `TimeEntry.projectId` links hours to billable projects. Project profitability reports consume this data.

---

## 6. Known Gaps and TODOs

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | **Ijtimoiy Soliq not in `deductionLines`** | 🔴 Critical | Social Tax (12%) is computed in `getSoliqJshodsDeclaration` but the employer-side GL posting for Ijtimoiy Soliq is not visible in `postPayRunLineAccrual`. Only employee-side (JShODS + INPS) is posted. Needs a separate employer social tax accrual journal entry. |
| 2 | **IT Park / SME concessions not implemented** | 🟡 Medium | IT Park companies pay 1% Ijtimoiy Soliq (vs 12%). No tax regime toggle in PayrollProfile. |
| 3 | **`payFrequency` enum only has MONTHLY** | 🟡 Medium | Schema comment notes only MONTHLY is supported. Bi-weekly or weekly payroll not possible. |
| 4 | **Stale Prisma client** | 🟡 Medium | `payrollProfileDelegate`, `payRunDelegate`, `payRunLineDelegate` use `(prisma as unknown as any)` casts. `prisma generate` needs to be re-run after schema additions. |
| 5 | **No automated payroll calculation** | 🟡 Medium | Current flow requires manual gross entry per employee. No formula-driven auto-calculation from contract salary, allowances, overtime. |
| 6 | **Tabel (Attendance) not DB-backed** | 🟡 Medium | `TabelAttendancePage.tsx` is a UI-only page. No backend endpoint or Prisma model for daily attendance records. |
| 7 | **No payslip PDF generation** | 🟡 Medium | Pay slips (Ish haqi to'g'risida bayonnoma) cannot be downloaded or emailed to employees. |
| 8 | **Leave balance not enforced server-side** | 🟡 Medium | `leaveRequestController.ts` does not validate remaining balance before approving. Only the frontend warns. |
| 9 | **No onboarding / hiring pipeline** | 🟢 Low | AGENTS.md roadmap item. No Prisma model or UI for job posting, candidate tracking, or onboarding tasks. |
