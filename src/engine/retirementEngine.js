import { calculateAnnualTax } from './taxEngine';
import { LOCATIONS } from '../data/defaults';

function getExpectedReturn(scenario) {
  const stockReturn = 0.08;
  const bondReturn = 0.04;
  const cashReturn = 0.02;
  return (
    (scenario.stockPercent / 100) * stockReturn +
    (scenario.bondPercent / 100) * bondReturn +
    (scenario.cashPercent / 100) * cashReturn
  );
}

function getAnnualContributionLimits(locationKey) {
  const loc = LOCATIONS[locationKey];
  if (!loc) return { taxDeferred: 23000, taxFree: 7000 };
  if (loc.country === 'CA') {
    return { taxDeferred: 31560, taxFree: 7000 };
  }
  return { taxDeferred: 23000, taxFree: 7000 };
}

function getAnnualExpensesAtAge(scenario, age, yearsFromNow, inflation) {
  const categories = scenario.expenseCategories || [];
  let total = 0;
  for (const cat of categories) {
    if (age >= cat.startAge && age <= cat.endAge && cat.monthly > 0) {
      total += cat.monthly * 12;
    }
  }
  return total * Math.pow(1 + inflation, yearsFromNow);
}

export function runProjection(scenario) {
  const currentYear = new Date().getFullYear();
  const loc = LOCATIONS[scenario.location] || LOCATIONS.seattle;
  const isCanada = loc.country === 'CA';
  const returnRate = getExpectedReturn(scenario);
  const inflation = scenario.inflationRate / 100;
  const salaryGrowth = scenario.salaryGrowth / 100;
  const limits = getAnnualContributionLimits(scenario.location);

  let taxDeferredBalance = scenario.currentSavings * (scenario.taxDeferredPercent / 100);
  let taxFreeBalance = scenario.currentSavings * (scenario.taxFreePercent / 100);
  let taxableBalance = scenario.currentSavings * (scenario.taxablePercent / 100);
  let taxableCostBasis = taxableBalance;

  const yearlyData = [];
  let moneyRunsOutAge = null;

  for (let age = scenario.currentAge; age <= scenario.lifeExpectancy; age++) {
    const year = currentYear + (age - scenario.currentAge);
    const yearsFromNow = age - scenario.currentAge;
    const isRetired = age >= scenario.retirementAge;

    let grossIncome = 0;
    let taxDeferredContrib = 0;
    let taxFreeContrib = 0;
    let taxableContrib = 0;
    let govBenefits = 0;
    let totalTax = 0;
    let savings = 0;

    const expenses = getAnnualExpensesAtAge(scenario, age, yearsFromNow, inflation);

    if (!isRetired) {
      const mySalary = scenario.salary * Math.pow(1 + salaryGrowth, yearsFromNow);
      const partnerSalary = scenario.filingStatus === 'married'
        ? scenario.partnerSalary * Math.pow(1 + salaryGrowth, yearsFromNow)
        : 0;
      grossIncome = mySalary + partnerSalary;

      const annualContrib = scenario.monthlyContribution * 12;
      taxDeferredContrib = Math.min(
        annualContrib * (scenario.taxDeferredPercent / 100),
        limits.taxDeferred
      );
      taxFreeContrib = Math.min(
        annualContrib * (scenario.taxFreePercent / 100),
        limits.taxFree
      );
      taxableContrib = annualContrib - taxDeferredContrib - taxFreeContrib;

      const taxResult = calculateAnnualTax(grossIncome, scenario.location, scenario.filingStatus, taxDeferredContrib);
      totalTax = taxResult.totalTax;

      const netIncome = grossIncome - totalTax;
      savings = netIncome - expenses;

      taxDeferredBalance += taxDeferredContrib;
      taxFreeBalance += taxFreeContrib;
      taxableBalance += taxableContrib;
      taxableCostBasis += taxableContrib;
    } else {
      if (isCanada) {
        if (age >= 65) {
          govBenefits += scenario.cppMonthly * 12;
          govBenefits += scenario.oasMonthly * 12;
        } else if (age >= 60) {
          govBenefits += scenario.cppMonthly * 12 * 0.64;
        }
      } else {
        if (age >= scenario.socialSecurityAge) {
          govBenefits += scenario.socialSecurityMonthly * 12;
          if (scenario.filingStatus === 'married') {
            govBenefits += scenario.socialSecurityMonthly * 12 * 0.5;
          }
        }
      }

      govBenefits *= Math.pow(1 + inflation, yearsFromNow);

      const totalNeeded = expenses;
      let remainingNeeded = Math.max(0, totalNeeded - govBenefits);
      let withdrawals = { taxable: 0, taxDeferred: 0, taxFree: 0 };

      if (remainingNeeded > 0 && taxableBalance > 0) {
        const w = Math.min(remainingNeeded, taxableBalance);
        withdrawals.taxable = w;
        const gainRatio = taxableBalance > 0 ? Math.max(0, 1 - taxableCostBasis / taxableBalance) : 0;
        taxableBalance -= w;
        taxableCostBasis = Math.max(0, taxableCostBasis - w * (1 - gainRatio));
        remainingNeeded -= w;
      }

      if (remainingNeeded > 0 && taxDeferredBalance > 0) {
        const w = Math.min(remainingNeeded, taxDeferredBalance);
        withdrawals.taxDeferred = w;
        taxDeferredBalance -= w;
        remainingNeeded -= w;
      }

      if (remainingNeeded > 0 && taxFreeBalance > 0) {
        const w = Math.min(remainingNeeded, taxFreeBalance);
        withdrawals.taxFree = w;
        taxFreeBalance -= w;
        remainingNeeded -= w;
      }

      const taxableWithdrawalIncome = withdrawals.taxDeferred;
      const totalTaxableIncome = govBenefits + taxableWithdrawalIncome;
      const taxResult = calculateAnnualTax(totalTaxableIncome, scenario.location, scenario.filingStatus);
      totalTax = taxResult.totalTax;

      grossIncome = govBenefits + withdrawals.taxable + withdrawals.taxDeferred + withdrawals.taxFree;
      savings = -(withdrawals.taxable + withdrawals.taxDeferred + withdrawals.taxFree);

      if (remainingNeeded > 0 && !moneyRunsOutAge) {
        moneyRunsOutAge = age;
      }
    }

    taxDeferredBalance *= (1 + returnRate);
    taxFreeBalance *= (1 + returnRate);
    taxableBalance *= (1 + returnRate);

    const totalNetWorth = taxDeferredBalance + taxFreeBalance + taxableBalance;

    yearlyData.push({
      age,
      year,
      grossIncome: Math.round(grossIncome),
      totalTax: Math.round(totalTax),
      expenses: Math.round(expenses),
      savings: Math.round(savings),
      govBenefits: Math.round(govBenefits),
      taxDeferredBalance: Math.round(taxDeferredBalance),
      taxFreeBalance: Math.round(taxFreeBalance),
      taxableBalance: Math.round(taxableBalance),
      totalNetWorth: Math.round(totalNetWorth),
      isRetired,
    });
  }

  const retirementYearData = yearlyData.find(d => d.age === scenario.retirementAge);
  const lastYearData = yearlyData[yearlyData.length - 1];
  const retirementSavings = retirementYearData ? retirementYearData.totalNetWorth : 0;

  const yearsOfRetirement = scenario.lifeExpectancy - scenario.retirementAge;
  const yearsFunded = moneyRunsOutAge
    ? moneyRunsOutAge - scenario.retirementAge
    : yearsOfRetirement;
  const fundedPercentage = Math.min(100, (yearsFunded / yearsOfRetirement) * 100);

  const safeWithdrawalRate = 0.04;
  const annualSafeWithdrawal = retirementSavings * safeWithdrawalRate;
  const monthlyRetirementIncome = annualSafeWithdrawal / 12;

  const retirementExpenses = retirementYearData
    ? retirementYearData.expenses
    : getAnnualExpensesAtAge(scenario, scenario.retirementAge, scenario.retirementAge - scenario.currentAge, inflation);
  const govBenefitsAtRetirement = retirementYearData ? retirementYearData.govBenefits : 0;
  const incomeGap = Math.max(0, retirementExpenses - annualSafeWithdrawal - govBenefitsAtRetirement);

  const taxAtRetirement = calculateAnnualTax(
    scenario.salary,
    scenario.location,
    scenario.filingStatus,
    scenario.monthlyContribution * 12 * (scenario.taxDeferredPercent / 100)
  );

  // Calculate current monthly total for display
  const currentMonthlyExpenses = (scenario.expenseCategories || [])
    .filter(cat => scenario.currentAge >= cat.startAge && scenario.currentAge <= cat.endAge)
    .reduce((sum, cat) => sum + cat.monthly, 0);

  return {
    yearlyData,
    summary: {
      retirementSavings,
      monthlyRetirementIncome: Math.round(monthlyRetirementIncome),
      yearsFunded,
      fundedPercentage: Math.round(fundedPercentage),
      moneyRunsOutAge,
      annualSafeWithdrawal: Math.round(annualSafeWithdrawal),
      retirementExpenses: Math.round(retirementExpenses),
      incomeGap: Math.round(incomeGap),
      currentEffectiveTaxRate: taxAtRetirement.effectiveRate,
      finalNetWorth: lastYearData ? lastYearData.totalNetWorth : 0,
      currentMonthlyExpenses,
    },
  };
}
