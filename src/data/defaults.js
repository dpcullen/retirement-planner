export const LOCATIONS = {
  seattle: { name: 'Seattle, WA', country: 'US', state: 'WA', currency: 'USD', symbol: '$' },
  sanfrancisco: { name: 'San Francisco, CA', country: 'US', state: 'CA', currency: 'USD', symbol: '$' },
  newyork: { name: 'New York, NY', country: 'US', state: 'NY', currency: 'USD', symbol: '$' },
  austin: { name: 'Austin, TX', country: 'US', state: 'TX', currency: 'USD', symbol: '$' },
  portland: { name: 'Portland, OR', country: 'US', state: 'OR', currency: 'USD', symbol: '$' },
  denver: { name: 'Denver, CO', country: 'US', state: 'CO', currency: 'USD', symbol: '$' },
  chicago: { name: 'Chicago, IL', country: 'US', state: 'IL', currency: 'USD', symbol: '$' },
  miami: { name: 'Miami, FL', country: 'US', state: 'FL', currency: 'USD', symbol: '$' },
  vancouver: { name: 'Vancouver, BC', country: 'CA', province: 'BC', currency: 'CAD', symbol: 'C$' },
  victoria: { name: 'Victoria, BC', country: 'CA', province: 'BC', currency: 'CAD', symbol: 'C$' },
  toronto: { name: 'Toronto, ON', country: 'CA', province: 'ON', currency: 'CAD', symbol: 'C$' },
  calgary: { name: 'Calgary, AB', country: 'CA', province: 'AB', currency: 'CAD', symbol: 'C$' },
  montreal: { name: 'Montreal, QC', country: 'CA', province: 'QC', currency: 'CAD', symbol: 'C$' },
};

export const SCENARIO_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e'];

let scenarioCounter = 0;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'exp-1', name: 'Housing (rent/mortgage)', monthly: 2000 },
  { id: 'exp-2', name: 'Food & Groceries', monthly: 600 },
  { id: 'exp-3', name: 'Transportation', monthly: 400 },
  { id: 'exp-4', name: 'Utilities & Bills', monthly: 250 },
  { id: 'exp-5', name: 'Healthcare', monthly: 200 },
  { id: 'exp-6', name: 'Travel & Leisure', monthly: 300 },
  { id: 'exp-7', name: 'Children & Childcare', monthly: 0, endAge: 40 },
  { id: 'exp-8', name: 'Other', monthly: 500 },
];

export function createDefaultScenario(name, color) {
  scenarioCounter++;
  const currentAge = 30;
  const lifeExpectancy = 90;
  return {
    id: `scenario-${Date.now()}-${scenarioCounter}`,
    name: name || 'Base Case',
    color: color || SCENARIO_COLORS[0],

    currentAge,
    retirementAge: 65,
    lifeExpectancy,
    filingStatus: 'single',

    salary: 100000,
    salaryGrowth: 3,
    socialSecurityAge: 67,
    socialSecurityMonthly: 2000,
    cppMonthly: 1200,
    oasMonthly: 700,

    inflationRate: 2.5,
    expenseCategories: DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      startAge: currentAge,
      endAge: cat.endAge || lifeExpectancy,
    })),

    currentSavings: 50000,
    monthlyContribution: 1500,
    taxDeferredPercent: 50,
    taxFreePercent: 25,
    taxablePercent: 25,

    stockPercent: 70,
    bondPercent: 25,
    cashPercent: 5,

    retStockPercent: 40,
    retBondPercent: 50,
    retCashPercent: 10,

    location: 'seattle',
  };
}
