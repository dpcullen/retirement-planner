import { useState } from 'react';
import { User, DollarSign, Home, TrendingUp, MapPin, Receipt } from 'lucide-react';
import { Card, SectionHeader, InputField, SelectField, ToggleGroup, SliderField } from './ui';
import { LOCATIONS } from '../data/defaults';

const locationOptions = Object.entries(LOCATIONS).map(([key, loc]) => ({
  value: key,
  label: `${loc.name} (${loc.currency})`,
}));

function Section({ title, subtitle, icon, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
      {isOpen && <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">{children}</div>}
    </Card>
  );
}

export default function InputPanel({ scenario, onChange }) {
  const loc = LOCATIONS[scenario.location] || LOCATIONS.seattle;
  const isCanada = loc.country === 'CA';
  const sym = loc.symbol;

  function set(field) {
    return (value) => onChange({ ...scenario, [field]: value });
  }

  return (
    <div className="space-y-3">
      <Section title="Personal Details" subtitle="Age, status & location" icon={User} defaultOpen={true}>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Current Age" value={scenario.currentAge} onChange={set('currentAge')} min={18} max={80} />
          <InputField label="Retirement Age" value={scenario.retirementAge} onChange={set('retirementAge')} min={30} max={85} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Life Expectancy"
            value={scenario.lifeExpectancy}
            onChange={set('lifeExpectancy')}
            min={60}
            max={110}
            tooltip="Plan conservatively - many people live past 90"
          />
          <div />
        </div>
        <ToggleGroup
          label="Filing Status"
          value={scenario.filingStatus}
          onChange={set('filingStatus')}
          options={[
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
          ]}
        />
        <SelectField
          label="Location"
          value={scenario.location}
          onChange={set('location')}
          options={locationOptions}
          tooltip="Determines tax calculations"
        />
      </Section>

      <Section title="Income" subtitle="Salary & government benefits" icon={DollarSign}>
        <InputField
          label="Your Annual Salary"
          value={scenario.salary}
          onChange={set('salary')}
          prefix={sym}
          tooltip="Gross annual salary before taxes"
        />
        {scenario.filingStatus === 'married' && (
          <InputField
            label="Partner's Annual Salary"
            value={scenario.partnerSalary}
            onChange={set('partnerSalary')}
            prefix={sym}
          />
        )}
        <SliderField
          label="Annual Salary Growth"
          value={scenario.salaryGrowth}
          onChange={set('salaryGrowth')}
          min={0}
          max={10}
          step={0.5}
        />
        {isCanada ? (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="CPP (monthly)"
              value={scenario.cppMonthly}
              onChange={set('cppMonthly')}
              prefix={sym}
              tooltip="Canada Pension Plan monthly benefit at 65"
            />
            <InputField
              label="OAS (monthly)"
              value={scenario.oasMonthly}
              onChange={set('oasMonthly')}
              prefix={sym}
              tooltip="Old Age Security monthly benefit at 65"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="SS Start Age"
              value={scenario.socialSecurityAge}
              onChange={set('socialSecurityAge')}
              min={62}
              max={70}
              tooltip="Age you start collecting Social Security"
            />
            <InputField
              label="SS Monthly"
              value={scenario.socialSecurityMonthly}
              onChange={set('socialSecurityMonthly')}
              prefix={sym}
              tooltip="Estimated monthly Social Security benefit"
            />
          </div>
        )}
      </Section>

      <Section title="Expenses" subtitle="Living costs & healthcare" icon={Receipt}>
        <InputField
          label="Annual Living Expenses"
          value={scenario.annualExpenses}
          onChange={set('annualExpenses')}
          prefix={sym}
          tooltip="Total annual spending excluding housing"
        />
        <SliderField
          label="Retirement Spending (% of current)"
          value={scenario.retirementExpensePercent}
          onChange={set('retirementExpensePercent')}
          min={40}
          max={120}
          tooltip="Most retirees spend 70-85% of pre-retirement expenses"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Inflation Rate"
            value={scenario.inflationRate}
            onChange={set('inflationRate')}
            suffix="%"
            min={0}
            max={10}
            step={0.1}
          />
          <InputField
            label="Healthcare (monthly)"
            value={scenario.healthcareMonthlyCost}
            onChange={set('healthcareMonthlyCost')}
            prefix={sym}
            tooltip="Additional healthcare costs in retirement"
          />
        </div>
      </Section>

      <Section title="Housing" subtitle="Rent or buy scenario" icon={Home}>
        <ToggleGroup
          label="Housing Type"
          value={scenario.housingType}
          onChange={set('housingType')}
          options={[
            { value: 'rent', label: 'Rent' },
            { value: 'buy', label: 'Buy / Own' },
          ]}
        />
        {scenario.housingType === 'rent' ? (
          <InputField
            label="Monthly Rent"
            value={scenario.monthlyRent}
            onChange={set('monthlyRent')}
            prefix={sym}
            tooltip="Current monthly rent - will increase with inflation"
          />
        ) : (
          <>
            <InputField label="Home Price" value={scenario.homePrice} onChange={set('homePrice')} prefix={sym} />
            <div className="grid grid-cols-2 gap-3">
              <SliderField
                label="Down Payment"
                value={scenario.downPaymentPercent}
                onChange={set('downPaymentPercent')}
                min={5}
                max={100}
                step={5}
              />
              <InputField
                label="Mortgage Rate"
                value={scenario.mortgageRate}
                onChange={set('mortgageRate')}
                suffix="%"
                min={0}
                max={15}
                step={0.1}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Mortgage Term"
                value={scenario.mortgageTerm}
                onChange={(v) => set('mortgageTerm')(Number(v))}
                options={[
                  { value: 15, label: '15 years' },
                  { value: 20, label: '20 years' },
                  { value: 25, label: '25 years' },
                  { value: 30, label: '30 years' },
                ]}
              />
              <InputField
                label="Property Tax Rate"
                value={scenario.propertyTaxRate}
                onChange={set('propertyTaxRate')}
                suffix="%"
                min={0}
                max={5}
                step={0.1}
              />
            </div>
            <SliderField
              label="Home Appreciation"
              value={scenario.homeAppreciation}
              onChange={set('homeAppreciation')}
              min={0}
              max={8}
              step={0.5}
              suffix="% / yr"
            />
          </>
        )}
      </Section>

      <Section title="Investments" subtitle="Savings & asset allocation" icon={TrendingUp}>
        <InputField
          label="Current Total Savings"
          value={scenario.currentSavings}
          onChange={set('currentSavings')}
          prefix={sym}
          tooltip="All investment accounts combined"
        />
        <InputField
          label="Monthly Contribution"
          value={scenario.monthlyContribution}
          onChange={set('monthlyContribution')}
          prefix={sym}
          tooltip="Total monthly savings across all accounts"
        />
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-slate-500">
            Account Allocation {isCanada ? '(RRSP / TFSA / Taxable)' : '(401k / Roth / Taxable)'}
          </p>
          <SliderField
            label={isCanada ? 'RRSP (tax-deferred)' : '401(k) (tax-deferred)'}
            value={scenario.taxDeferredPercent}
            onChange={(v) => {
              const remaining = 100 - v;
              const ratio = scenario.taxFreePercent + scenario.taxablePercent;
              if (ratio === 0) {
                onChange({ ...scenario, taxDeferredPercent: v, taxFreePercent: remaining / 2, taxablePercent: remaining / 2 });
              } else {
                onChange({
                  ...scenario,
                  taxDeferredPercent: v,
                  taxFreePercent: Math.round((scenario.taxFreePercent / ratio) * remaining),
                  taxablePercent: remaining - Math.round((scenario.taxFreePercent / ratio) * remaining),
                });
              }
            }}
          />
          <SliderField
            label={isCanada ? 'TFSA (tax-free)' : 'Roth IRA (tax-free)'}
            value={scenario.taxFreePercent}
            onChange={(v) => {
              const remaining = 100 - v;
              const ratio = scenario.taxDeferredPercent + scenario.taxablePercent;
              if (ratio === 0) {
                onChange({ ...scenario, taxFreePercent: v, taxDeferredPercent: remaining / 2, taxablePercent: remaining / 2 });
              } else {
                onChange({
                  ...scenario,
                  taxFreePercent: v,
                  taxDeferredPercent: Math.round((scenario.taxDeferredPercent / ratio) * remaining),
                  taxablePercent: remaining - Math.round((scenario.taxDeferredPercent / ratio) * remaining),
                });
              }
            }}
          />
          <SliderField
            label="Taxable Brokerage"
            value={scenario.taxablePercent}
            onChange={(v) => {
              const remaining = 100 - v;
              const ratio = scenario.taxDeferredPercent + scenario.taxFreePercent;
              if (ratio === 0) {
                onChange({ ...scenario, taxablePercent: v, taxDeferredPercent: remaining / 2, taxFreePercent: remaining / 2 });
              } else {
                onChange({
                  ...scenario,
                  taxablePercent: v,
                  taxDeferredPercent: Math.round((scenario.taxDeferredPercent / ratio) * remaining),
                  taxFreePercent: remaining - Math.round((scenario.taxDeferredPercent / ratio) * remaining),
                });
              }
            }}
          />
        </div>
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-slate-500">Asset Allocation</p>
          <SliderField
            label="Stocks"
            value={scenario.stockPercent}
            onChange={(v) => {
              const bondAndCash = 100 - v;
              const ratio = scenario.bondPercent + scenario.cashPercent;
              if (ratio === 0) {
                onChange({ ...scenario, stockPercent: v, bondPercent: Math.round(bondAndCash * 0.8), cashPercent: bondAndCash - Math.round(bondAndCash * 0.8) });
              } else {
                onChange({
                  ...scenario,
                  stockPercent: v,
                  bondPercent: Math.round((scenario.bondPercent / ratio) * bondAndCash),
                  cashPercent: bondAndCash - Math.round((scenario.bondPercent / ratio) * bondAndCash),
                });
              }
            }}
          />
          <SliderField
            label="Bonds"
            value={scenario.bondPercent}
            onChange={(v) => {
              const stockAndCash = 100 - v;
              const ratio = scenario.stockPercent + scenario.cashPercent;
              if (ratio === 0) {
                onChange({ ...scenario, bondPercent: v, stockPercent: Math.round(stockAndCash * 0.9), cashPercent: stockAndCash - Math.round(stockAndCash * 0.9) });
              } else {
                onChange({
                  ...scenario,
                  bondPercent: v,
                  stockPercent: Math.round((scenario.stockPercent / ratio) * stockAndCash),
                  cashPercent: stockAndCash - Math.round((scenario.stockPercent / ratio) * stockAndCash),
                });
              }
            }}
          />
          <SliderField label="Cash" value={scenario.cashPercent} onChange={() => {}} />
        </div>
      </Section>
    </div>
  );
}
