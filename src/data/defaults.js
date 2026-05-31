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

export function createDefaultScenario(name, color) {
  scenarioCounter++;
  return {
    id: `scenario-${Date.now()}-${scenarioCounter}`,
    name: name || 'Base Case',
    color: color || SCENARIO_COLORS[0],

    currentAge: 30,
    retirementAge: 65,
    lifeExpectancy: 90,
    filingStatus: 'single',

    salary: 100000,
    partnerSalary: 0,
    salaryGrowth: 3,
    socialSecurityAge: 67,
    socialSecurityMonthly: 2000,
    cppMonthly: 1200,
    oasMonthly: 700,

    annualExpenses: 50000,
    retirementExpensePercent: 80,
    inflationRate: 2.5,
    healthcareMonthlyCost: 500,

    housingType: 'rent',
    monthlyRent: 2000,
    homePrice: 500000,
    downPaymentPercent: 20,
    mortgageRate: 6.5,
    mortgageTerm: 30,
    propertyTaxRate: 1.0,
    homeAppreciation: 3,

    currentSavings: 50000,
    monthlyContribution: 1500,
    taxDeferredPercent: 50,
    taxFreePercent: 25,
    taxablePercent: 25,

    stockPercent: 70,
    bondPercent: 25,
    cashPercent: 5,

    location: 'seattle',
  };
}
