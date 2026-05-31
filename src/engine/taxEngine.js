import { LOCATIONS } from '../data/defaults';

const US_FEDERAL_SINGLE = [
  { max: 11600, rate: 0.10 },
  { max: 47150, rate: 0.12 },
  { max: 100525, rate: 0.22 },
  { max: 191950, rate: 0.24 },
  { max: 243725, rate: 0.32 },
  { max: 609350, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const US_FEDERAL_MARRIED = [
  { max: 23200, rate: 0.10 },
  { max: 94300, rate: 0.12 },
  { max: 201050, rate: 0.22 },
  { max: 383900, rate: 0.24 },
  { max: 487450, rate: 0.32 },
  { max: 731200, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const US_STANDARD_DEDUCTION = { single: 14600, married: 29200 };

const US_LTCG_SINGLE = [
  { max: 47025, rate: 0.00 },
  { max: 518900, rate: 0.15 },
  { max: Infinity, rate: 0.20 },
];

const US_LTCG_MARRIED = [
  { max: 94050, rate: 0.00 },
  { max: 583750, rate: 0.15 },
  { max: Infinity, rate: 0.20 },
];

const STATE_TAXES = {
  WA: [],
  TX: [],
  FL: [],
  CA: [
    { max: 10412, rate: 0.01 },
    { max: 24684, rate: 0.02 },
    { max: 38959, rate: 0.04 },
    { max: 54081, rate: 0.06 },
    { max: 68350, rate: 0.08 },
    { max: 349137, rate: 0.093 },
    { max: 418961, rate: 0.103 },
    { max: 698271, rate: 0.113 },
    { max: 1000000, rate: 0.123 },
    { max: Infinity, rate: 0.133 },
  ],
  NY: [
    { max: 8500, rate: 0.04 },
    { max: 11700, rate: 0.045 },
    { max: 13900, rate: 0.0525 },
    { max: 80650, rate: 0.055 },
    { max: 215400, rate: 0.06 },
    { max: 1077550, rate: 0.0685 },
    { max: 5000000, rate: 0.0965 },
    { max: 25000000, rate: 0.103 },
    { max: Infinity, rate: 0.109 },
  ],
  OR: [
    { max: 4050, rate: 0.0475 },
    { max: 10200, rate: 0.0675 },
    { max: 125000, rate: 0.0875 },
    { max: Infinity, rate: 0.099 },
  ],
  CO: [{ max: Infinity, rate: 0.044 }],
  IL: [{ max: Infinity, rate: 0.0495 }],
};

const CA_FEDERAL = [
  { max: 55867, rate: 0.15 },
  { max: 111733, rate: 0.205 },
  { max: 154906, rate: 0.26 },
  { max: 220000, rate: 0.29 },
  { max: Infinity, rate: 0.33 },
];

const CA_BASIC_PERSONAL = 15705;

const PROVINCIAL_TAXES = {
  BC: [
    { max: 47937, rate: 0.0506 },
    { max: 95875, rate: 0.077 },
    { max: 110076, rate: 0.105 },
    { max: 133664, rate: 0.1229 },
    { max: 181232, rate: 0.147 },
    { max: 252752, rate: 0.168 },
    { max: Infinity, rate: 0.205 },
  ],
  ON: [
    { max: 51446, rate: 0.0505 },
    { max: 102894, rate: 0.0915 },
    { max: 150000, rate: 0.1116 },
    { max: 220000, rate: 0.1216 },
    { max: Infinity, rate: 0.1316 },
  ],
  AB: [
    { max: 148269, rate: 0.10 },
    { max: 177922, rate: 0.12 },
    { max: 237230, rate: 0.13 },
    { max: 355845, rate: 0.14 },
    { max: Infinity, rate: 0.15 },
  ],
  QC: [
    { max: 51780, rate: 0.14 },
    { max: 103545, rate: 0.19 },
    { max: 126000, rate: 0.24 },
    { max: Infinity, rate: 0.2575 },
  ],
};

const PROVINCIAL_BASIC_PERSONAL = {
  BC: 11981,
  ON: 11865,
  AB: 21003,
  QC: 17183,
};

function applyBrackets(income, brackets) {
  if (income <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const { max, rate } of brackets) {
    if (income <= prev) break;
    const taxable = Math.min(income, max) - prev;
    tax += taxable * rate;
    prev = max;
  }
  return tax;
}

function calcUSFederalTax(taxableIncome, filingStatus) {
  const brackets = filingStatus === 'married' ? US_FEDERAL_MARRIED : US_FEDERAL_SINGLE;
  return applyBrackets(taxableIncome, brackets);
}

function calcUSStateTax(taxableIncome, state) {
  const brackets = STATE_TAXES[state];
  if (!brackets || brackets.length === 0) return 0;
  return applyBrackets(taxableIncome, brackets);
}

function calcFICA(grossIncome) {
  const ssWageCap = 168600;
  const ss = Math.min(grossIncome, ssWageCap) * 0.062;
  const medicare = grossIncome * 0.0145;
  const additionalMedicare = Math.max(0, grossIncome - 200000) * 0.009;
  return ss + medicare + additionalMedicare;
}

function calcCanadaFederalTax(taxableIncome) {
  return applyBrackets(taxableIncome, CA_FEDERAL);
}

function calcProvincialTax(taxableIncome, province) {
  const brackets = PROVINCIAL_TAXES[province];
  if (!brackets) return 0;
  return applyBrackets(taxableIncome, brackets);
}

function calcCPP(grossIncome) {
  const exemption = 3500;
  const maxPensionableEarnings = 68500;
  const rate = 0.0595;
  const cpp1 = Math.max(0, Math.min(grossIncome, maxPensionableEarnings) - exemption) * rate;
  const cpp2Max = 73200;
  const cpp2Rate = 0.04;
  const cpp2 = Math.max(0, Math.min(grossIncome, cpp2Max) - maxPensionableEarnings) * cpp2Rate;
  return cpp1 + cpp2;
}

function calcEI(grossIncome) {
  const maxInsurableEarnings = 63200;
  const rate = 0.0166;
  return Math.min(grossIncome, maxInsurableEarnings) * rate;
}

export function calculateAnnualTax(grossIncome, locationKey, filingStatus, preTaxDeductions = 0) {
  const loc = LOCATIONS[locationKey];
  if (!loc) return { totalTax: 0, effectiveRate: 0, breakdown: {} };

  if (loc.country === 'US') {
    const deduction = US_STANDARD_DEDUCTION[filingStatus] || US_STANDARD_DEDUCTION.single;
    const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - deduction);
    const federal = calcUSFederalTax(taxableIncome, filingStatus);
    const state = calcUSStateTax(taxableIncome, loc.state);
    const fica = calcFICA(grossIncome);
    const totalTax = federal + state + fica;
    return {
      totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      breakdown: { federal, state, fica },
      country: 'US',
    };
  }

  if (loc.country === 'CA') {
    const taxableIncome = Math.max(0, grossIncome - preTaxDeductions);
    const federalTaxable = Math.max(0, taxableIncome - CA_BASIC_PERSONAL);
    const federal = calcCanadaFederalTax(federalTaxable);
    const provPersonal = PROVINCIAL_BASIC_PERSONAL[loc.province] || 0;
    const provTaxable = Math.max(0, taxableIncome - provPersonal);
    const provincial = calcProvincialTax(provTaxable, loc.province);
    const cpp = calcCPP(grossIncome);
    const ei = calcEI(grossIncome);
    const totalTax = federal + provincial + cpp + ei;
    return {
      totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      breakdown: { federal, provincial, cpp, ei },
      country: 'CA',
    };
  }

  return { totalTax: 0, effectiveRate: 0, breakdown: {}, country: 'US' };
}

export function calculateCapitalGainsTax(gains, otherIncome, locationKey, filingStatus) {
  if (gains <= 0) return 0;
  const loc = LOCATIONS[locationKey];
  if (!loc) return 0;

  if (loc.country === 'US') {
    const brackets = filingStatus === 'married' ? US_LTCG_MARRIED : US_LTCG_SINGLE;
    return applyBrackets(gains, brackets);
  }

  if (loc.country === 'CA') {
    const inclusionRate = 0.5;
    const taxableGain = gains * inclusionRate;
    const marginalIncome = otherIncome + taxableGain;
    const taxWithGains = calcCanadaFederalTax(Math.max(0, marginalIncome - CA_BASIC_PERSONAL));
    const taxWithout = calcCanadaFederalTax(Math.max(0, otherIncome - CA_BASIC_PERSONAL));
    return taxWithGains - taxWithout;
  }

  return 0;
}

export function calculateRetirementWithdrawalTax(withdrawalAmount, otherIncome, locationKey, filingStatus) {
  const totalIncome = otherIncome + withdrawalAmount;
  const taxOnTotal = calculateAnnualTax(totalIncome, locationKey, filingStatus);
  const taxOnOther = calculateAnnualTax(otherIncome, locationKey, filingStatus);
  return Math.max(0, taxOnTotal.totalTax - taxOnOther.totalTax);
}
