import dotenv from 'dotenv';
dotenv.config();

import { calculateSickLeavePay } from '../lib/payroll/uzbekPayrollEngine';

async function runSickLeaveTests() {
  console.log('\n=============================================================');
  console.log('🇺🇿 SICK LEAVE SPLIT & 1 JULY 2026 REFORMS QA TEST SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`   ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`   ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  const dailyEarnings = 200000; // 200,000 UZS / day
  const days = 10; // 10 days sick leave
  const seniority = 6; // 5-8 years -> 80%

  // 1. Pre-July 2026 rule test (evaluation date 2026-05-15)
  console.log('1. Testing Pre-July 2026 Baseline Rule (Full Employer Coverage):');
  const preJuly = calculateSickLeavePay(dailyEarnings, days, seniority, '2026-05-15');
  console.log(`   • Coverage: ${preJuly.coveragePercentage}%`);
  console.log(`   • Employer Days: ${preJuly.employerDays} / Total Days: ${preJuly.sickLeaveDays}`);
  console.log(`   • Employer Paid: ${preJuly.employerPaidAmount.toLocaleString()} UZS`);
  console.log(`   • State Fund Paid: ${preJuly.stateFundPaidAmount.toLocaleString()} UZS`);
  console.log(`   • Total Sick Pay: ${preJuly.totalSickPay.toLocaleString()} UZS`);

  assert(preJuly.isJuly2026RuleApplied === false, 'Pre-July date correctly flags rule not active');
  assert(preJuly.employerDays === 10, 'Employer pays all 10 days under pre-July rule');
  assert(preJuly.stateFundDays === 0, 'State Fund days is 0 under pre-July rule');
  assert(preJuly.employerPaidAmount === 1600000, 'Employer pays 1,600,000 UZS (10 * 200k * 80%)');
  assert(preJuly.stateFundPaidAmount === 0, 'State Fund pays 0 UZS under pre-July rule');

  // 2. Post-1-July-2026 rule test (evaluation date 2026-07-15)
  console.log('\n2. Testing 1 July 2026 Regulatory Split Rule (State Fund Co-Financing):');
  const postJuly = calculateSickLeavePay(dailyEarnings, days, seniority, '2026-07-15');
  console.log(`   • Coverage: ${postJuly.coveragePercentage}%`);
  console.log(`   • Employer Days (Cap 5): ${postJuly.employerDays}`);
  console.log(`   • State Fund Days (Remainder): ${postJuly.stateFundDays}`);
  console.log(`   • Employer Paid Amount: ${postJuly.employerPaidAmount.toLocaleString()} UZS`);
  console.log(`   • State Fund Paid Amount: ${postJuly.stateFundPaidAmount.toLocaleString()} UZS`);
  console.log(`   • Total Gross Sick Pay: ${postJuly.totalSickPay.toLocaleString()} UZS`);
  console.log(`   • Net Sick Pay (after 12% JShODS): ${postJuly.netSickPay.toLocaleString()} UZS`);

  assert(postJuly.isJuly2026RuleApplied === true, 'July 2026 date correctly activates the split rule');
  assert(postJuly.employerDays === 5, 'Employer pays strictly the first 5 calendar days');
  assert(postJuly.stateFundDays === 5, 'State Social Insurance Fund covers remaining 5 days');
  assert(postJuly.employerPaidAmount === 800000, 'Employer pays 800,000 UZS (5 * 200k * 80%)');
  assert(postJuly.stateFundPaidAmount === 800000, 'State Fund pays 800,000 UZS (5 * 200k * 80%)');
  assert(postJuly.totalSickPay === 1600000, 'Total employee entitlement matches 1,600,000 UZS');
  assert(postJuly.jshodsTotal === 192000, 'JShODS tax is exactly 12% (192,000 UZS)');
  assert(postJuly.netSickPay === 1408000, 'Net payout to employee is 1,408,000 UZS');

  // 3. Short duration sick leave test (<= 5 days) under July 2026 rule
  console.log('\n3. Testing Short Duration Sick Leave (3 days) under July 2026 rule:');
  const shortSick = calculateSickLeavePay(dailyEarnings, 3, seniority, '2026-08-01');
  assert(shortSick.employerDays === 3, 'When sick leave is 3 days, employer pays 3 days');
  assert(shortSick.stateFundDays === 0, 'When sick leave is 3 days, State Fund pays 0 days');
  assert(shortSick.employerPaidAmount === 480000, 'Employer paid amount: 480,000 UZS');

  // 4. Seniority tier tests
  console.log('\n4. Testing Work Seniority Tiers:');
  const junior = calculateSickLeavePay(dailyEarnings, 1, 2, '2026-07-15'); // < 5 years -> 60%
  const mid = calculateSickLeavePay(dailyEarnings, 1, 6, '2026-07-15'); // 5-8 years -> 80%
  const senior = calculateSickLeavePay(dailyEarnings, 1, 10, '2026-07-15'); // > 8 years -> 100%

  assert(junior.coveragePercentage === 60, 'Seniority < 5 years receives 60% coverage');
  assert(mid.coveragePercentage === 80, 'Seniority 5-8 years receives 80% coverage');
  assert(senior.coveragePercentage === 100, 'Seniority > 8 years receives 100% coverage');

  console.log('\n=============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSickLeaveTests().catch(console.error);
