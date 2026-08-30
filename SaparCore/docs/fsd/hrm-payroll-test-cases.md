# HRM & Payroll Test Cases

**Module:** `hrm-payroll`  
**FSD:** [`docs/fsd/hrm-payroll.md`](./hrm-payroll.md)  
**Standard:** Uzbekistan Payroll Standards (12% JShODS, 12% Social Tax, 0.1% INPS), Tabel Attendance Matrix, Vacation/Sick Leave Calculators, General Ledger Posting (9230 Wages Expense, 9260 Net Payable, 9270 Deductions Payable).

---

## 📋 Test Case Matrix

### Suite 01: Uzbekistan Statutory Payroll Deductions
- `TC-HRM-001`: Calculate Uzbek Payroll (`POST /payroll/calculate-uz`) with standard 12% JShODS, 12% Social Tax, and 0.1% INPS deductions.
- `TC-HRM-002`: Verify IT Park concession rates (0% / 7.5% corporate, 1% social tax).
- `TC-HRM-003`: Verify Net Pay calculation formula: $\text{Net} = \text{Gross} - \text{JShODS} - \text{INPS}$.

### Suite 02: Employee Directory & Payroll Profiles
- `TC-HRM-004`: Create Employee Payroll Profile (`POST /payroll/profiles`) with base gross salary in UZS.
- `TC-HRM-005`: List and retrieve employee payroll profiles (`GET /payroll/profiles`).

### Suite 03: Attendance Sheet (Tabel) & Leave Calculations
- `TC-HRM-006`: Retrieve monthly attendance matrix (`GET /payroll/tabel`).
- `TC-HRM-007`: Save daily attendance hours (`POST /payroll/tabel`).
- `TC-HRM-008`: Calculate vacation and sick leave accruals (`GET /payroll/vacation-sick-calc`).

### Suite 04: Monthly Pay Run & General Ledger Posting
- `TC-HRM-009`: Create monthly draft pay run (`POST /payroll/runs`).
- `TC-HRM-010`: Finalize pay run (`POST /payroll/runs/:id/finalize`) and post double-entry journal lines (`Dr 9230 / Cr 9260 + Cr 9270`).
