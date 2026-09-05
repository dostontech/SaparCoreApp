/**
 * lib/payroll/uzbekPayrollEngine.ts
 *
 * 🇺🇿 Uzbekistan Labor Code (Mehnat Kodeksi) & Tax Code (Soliq Kodeksi)
 * Payroll Calculation Engine
 *
 * Standard Rates:
 *   - JShODS (НДФЛ): 12.0% (11.9% Budget + 0.1% INPS)
 *   - INPS (Xalq Banki Jamgʻarib boriladigan pensiya): 0.1% of taxable gross
 *   - Ijtimoiy Soliq (Social Tax): 12.0% standard (1.0% for IT Park residents & SME concessions)
 */

export interface SalaryInput {
  baseSalary: number; // Oylik maosh / Oklad
  bonus?: number; // Mukofot / Ragʻbatlantirish
  allowances?: number; // Ustama / Kompensatsiya
  overtimeHours?: number; // Qoʻshimcha ishlangan soatlar
  hourlyRate?: number; // Soatbay stavka
  unpaidLeaveDays?: number; // Ish haqi saqlanmagan taʼtil kunlari
  workingDaysInMonth?: number; // Oydagi ish kunlari (standart 21-22)
  workedDays?: number; // Amalda ishlangan kunlar
  advancePaid?: number; // Avans summasi
  otherDeductions?: number; // Boshqa ushlanmalar (ijro varaqasi, aliment va h.k.)
  isItPark?: boolean; // IT Park rezidenti imtiyozi (1% ijtimoiy soliq)
}

export interface PayrollCalculationResult {
  // 1. Accruals (Hisoblangan daromadlar)
  baseSalary: number;
  bonus: number;
  allowances: number;
  overtimePay: number;
  grossSalary: number; // Brutto ish haqi

  // 2. Employee Deductions (Xodimdan ushlab qolinadigan soliqlar)
  inpsRate: number; // 0.1%
  inpsAmount: number; // INPS (Xalq Banki)
  jshodsRate: number; // 12%
  jshodsTotal: number; // Jami JShODS (12%)
  jshodsBudget: number; // Byudjetga toʻlanadigan qismi (11.9%)
  totalTaxesDeducted: number; // 12%

  // 3. Other Deductions (Boshqa ushlanmalar)
  advancePaid: number;
  otherDeductions: number;
  totalDeductions: number;

  // 4. Net Salary (Qoʻlga tegadigan summa / Netto)
  netSalary: number;

  // 5. Employer Costs (Ish beruvchi xarajatlari)
  socialTaxRate: number; // 12% or 1%
  socialTaxAmount: number; // Ijtimoiy soliq
  totalEmployerCost: number; // Jami korxona xarajati (Gross + Social Tax)
}

/**
 * Calculates complete salary breakdown per Uzbekistan Tax & Labor Code.
 */
export function calculateUzbekSalary(input: SalaryInput): PayrollCalculationResult {
  const base = Math.max(0, Number(input.baseSalary || 0));
  const bonus = Math.max(0, Number(input.bonus || 0));
  const allowances = Math.max(0, Number(input.allowances || 0));

  // Overtime calculation: Overtime in UZ is at least 2x hourly rate (MK Art. 195)
  const hourly = input.hourlyRate || (base > 0 ? base / (21 * 8) : 0);
  const overtimePay = Math.round(Math.max(0, Number(input.overtimeHours || 0)) * hourly * 2);

  // Prorated base for actual worked days if specified
  let proratedBase = base;
  if (input.workingDaysInMonth && input.workedDays !== undefined && input.workingDaysInMonth > 0) {
    proratedBase = Math.round((base / input.workingDaysInMonth) * Math.min(input.workedDays, input.workingDaysInMonth));
  }

  // 1. Gross (Brutto)
  const grossSalary = Math.round(proratedBase + bonus + allowances + overtimePay);

  // 2. INPS (0.1% of Gross)
  const inpsRate = 0.1;
  const inpsAmount = Math.round(grossSalary * 0.001);

  // 3. JShODS (12% of Gross)
  const jshodsRate = 12.0;
  const jshodsTotal = Math.round(grossSalary * 0.12);
  const jshodsBudget = Math.max(0, jshodsTotal - inpsAmount);
  const totalTaxesDeducted = jshodsTotal;

  // 4. Other deductions & Net salary
  const advancePaid = Math.max(0, Number(input.advancePaid || 0));
  const otherDeductions = Math.max(0, Number(input.otherDeductions || 0));
  const totalDeductions = totalTaxesDeducted + advancePaid + otherDeductions;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  // 5. Employer Social Tax (12% or 1% for IT Park)
  const socialTaxRate = input.isItPark ? 1.0 : 12.0;
  const socialTaxAmount = Math.round(grossSalary * (socialTaxRate / 100));
  const totalEmployerCost = grossSalary + socialTaxAmount;

  return {
    baseSalary: proratedBase,
    bonus,
    allowances,
    overtimePay,
    grossSalary,
    inpsRate,
    inpsAmount,
    jshodsRate,
    jshodsTotal,
    jshodsBudget,
    totalTaxesDeducted,
    advancePaid,
    otherDeductions,
    totalDeductions,
    netSalary,
    socialTaxRate,
    socialTaxAmount,
    totalEmployerCost,
  };
}

/**
 * Calculates vacation compensation (Mehnat taʼtili) based on average monthly earnings.
 * Average daily wage = Total 12-month earnings / 25.4 (6-day standard) or 21.0
 */
export function calculateVacationPay(total12MonthEarnings: number, vacationDays: number = 21): {
  averageMonthlyEarnings: number;
  dailyWage: number;
  vacationPay: number;
  jshodsDeduction: number;
  inpsDeduction: number;
  netVacationPay: number;
} {
  const averageMonthly = Math.round(total12MonthEarnings / 12);
  const dailyWage = Math.round(total12MonthEarnings / (12 * 25.4));
  const vacationPay = Math.round(dailyWage * vacationDays);

  const jshodsTotal = Math.round(vacationPay * 0.12);
  const inpsDeduction = Math.round(vacationPay * 0.001);
  const jshodsDeduction = jshodsTotal - inpsDeduction;
  const netVacationPay = vacationPay - jshodsTotal;

  return {
    averageMonthlyEarnings: averageMonthly,
    dailyWage,
    vacationPay,
    jshodsDeduction,
    inpsDeduction,
    netVacationPay,
  };
}

export interface SickLeaveCalculationResult {
  coveragePercentage: number;
  seniorityYears: number;
  sickLeaveDays: number;
  isJuly2026RuleApplied: boolean;
  employerDays: number;
  stateFundDays: number;
  employerPaidAmount: number;
  stateFundPaidAmount: number;
  totalSickPay: number;
  jshodsTotal: number;
  inpsDeduction: number;
  netSickPay: number;
}

/**
 * Calculates sick leave compensation (Kasallik varaqasi) per Uzbekistan Labor Code & July 2026 reforms:
 * - Seniority < 5 years: 60% of average earnings
 * - Seniority 5 - 8 years: 80%
 * - Seniority > 8 years / Occupational: 100%
 *
 * 🇺🇿 1 July 2026 Regulatory Split Rule:
 * - First 5 calendar days: funded by employer.
 * - Days beyond 5 (or co-financed remainder): funded by State Social Insurance Fund (Ijtimoiy sugʻurta jamgʻarmasi).
 * - Company GL (Dr 9420 / Cr 6710) expenses only employerPaidAmount.
 */
export function calculateSickLeavePay(
  averageDailyEarnings: number,
  sickLeaveDays: number,
  seniorityYears: number,
  effectiveDate?: Date | string
): SickLeaveCalculationResult {
  let coveragePercentage = 60;
  if (seniorityYears >= 8) {
    coveragePercentage = 100;
  } else if (seniorityYears >= 5) {
    coveragePercentage = 80;
  }

  const days = Math.max(1, Number(sickLeaveDays || 1));
  const daily = Math.max(0, Number(averageDailyEarnings || 0));

  // Determine if July 2026 rule applies
  const evalDate = effectiveDate ? new Date(effectiveDate) : new Date();
  const july2026Threshold = new Date('2026-07-01T00:00:00.000Z');
  const isJuly2026RuleApplied = evalDate >= july2026Threshold;

  let employerDays = days;
  let stateFundDays = 0;

  if (isJuly2026RuleApplied) {
    // Under 1 July 2026 rule, employer covers first 5 days, State Fund covers remaining
    employerDays = Math.min(days, 5);
    stateFundDays = Math.max(0, days - 5);
  }

  const dayRate = daily * (coveragePercentage / 100);
  const employerPaidAmount = Math.round(dayRate * employerDays);
  const stateFundPaidAmount = Math.round(dayRate * stateFundDays);
  const totalSickPay = employerPaidAmount + stateFundPaidAmount;

  const jshodsTotal = Math.round(totalSickPay * 0.12);
  const inpsDeduction = Math.round(totalSickPay * 0.001);
  const netSickPay = totalSickPay - jshodsTotal;

  return {
    coveragePercentage,
    seniorityYears,
    sickLeaveDays: days,
    isJuly2026RuleApplied,
    employerDays,
    stateFundDays,
    employerPaidAmount,
    stateFundPaidAmount,
    totalSickPay,
    jshodsTotal,
    inpsDeduction,
    netSickPay,
  };
}

