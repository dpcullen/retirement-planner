import { useState, useEffect } from 'react';
import { User, DollarSign, TrendingUp, MapPin, Receipt, Plus, X } from 'lucide-react';
import { Card, SectionHeader, InputField, SelectField, ToggleGroup, SliderField } from './ui';
import { LOCATIONS } from '../data/defaults';
import { formatCurrencyFull } from '../utils/formatters';

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

function CompactNumberInput({ value, onChange, prefix, className = '' }) {
  const [localValue, setLocalValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setLocalValue(String(value));
  }, [value, isFocused]);

  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <span className="absolute left-2 text-slate-400 text-xs pointer-events-none">{prefix}</span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={isFocused ? localValue : value}
        onFocus={(e) => { setIsFocused(true); e.target.select(); }}
        onBlur={() => { setIsFocused(false); onChange(parseFloat(localValue) || 0); }}
        onChange={(e) => setLocalValue(e.target.value)}
        className={`w-full rounded border border-slate-200 bg-white py-1.5 text-xs text-slate-700
          focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400
          ${prefix ? 'pl-5 pr-1.5' : 'px-1.5'} text-right`}
      />
    </div>
  );
}

function ExpenseCategoryRow({ cat, currencySymbol, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 group">
      <input
        type="text"
        value={cat.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        className="flex-1 min-w-0 text-xs font-medium text-slate-700 bg-transparent border-none outline-none truncate"
        placeholder="Category name"
      />
      <CompactNumberInput
        value={cat.monthly}
        onChange={(v) => onUpdate('monthly', v)}
        prefix={currencySymbol}
        className="w-20 flex-shrink-0"
      />
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <CompactNumberInput
          value={cat.startAge}
          onChange={(v) => onUpdate('startAge', v)}
          className="w-10"
        />
        <span className="text-[10px] text-slate-300">to</span>
        <CompactNumberInput
          value={cat.endAge}
          onChange={(v) => onUpdate('endAge', v)}
          className="w-10"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function InputPanel({ scenario, onChange }) {
  const loc = LOCATIONS[scenario.location] || LOCATIONS.seattle;
  const isCanada = loc.country === 'CA';
  const sym = loc.symbol;

  function set(field) {
    return (value) => onChange({ ...scenario, [field]: value });
  }

  function updateCategory(index, field, value) {
    const updated = [...scenario.expenseCategories];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...scenario, expenseCategories: updated });
  }

  function removeCategory(index) {
    const updated = scenario.expenseCategories.filter((_, i) => i !== index);
    onChange({ ...scenario, expenseCategories: updated });
  }

  function addCategory() {
    const newCat = {
      id: `exp-${Date.now()}`,
      name: 'New expense',
      monthly: 0,
      startAge: scenario.currentAge,
      endAge: scenario.lifeExpectancy,
    };
    onChange({ ...scenario, expenseCategories: [...scenario.expenseCategories, newCat] });
  }

  const currentTotal = (scenario.expenseCategories || [])
    .filter(cat => scenario.currentAge >= cat.startAge && scenario.currentAge <= cat.endAge)
    .reduce((sum, cat) => sum + cat.monthly, 0);

  const retirementTotal = (scenario.expenseCategories || [])
    .filter(cat => scenario.retirementAge >= cat.startAge && scenario.retirementAge <= cat.endAge)
    .reduce((sum, cat) => sum + cat.monthly, 0);

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

      <Section title="Expenses" subtitle="Monthly costs by category" icon={Receipt} defaultOpen={true}>
        <SliderField
          label="Inflation Rate"
          value={scenario.inflationRate}
          onChange={set('inflationRate')}
          min={0}
          max={10}
          step={0.5}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">/month</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-[88px] text-center">Ages</span>
              <span className="w-3.5" />
            </div>
          </div>

          {(scenario.expenseCategories || []).map((cat, i) => (
            <ExpenseCategoryRow
              key={cat.id}
              cat={cat}
              currencySymbol={sym}
              onUpdate={(field, value) => updateCategory(i, field, value)}
              onRemove={() => removeCategory(i)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addCategory}
          className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600 font-medium px-2 py-1.5 rounded-lg hover:bg-primary-50 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add category
        </button>

        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Now (age {scenario.currentAge})</span>
            <span className="font-semibold text-slate-700">{formatCurrencyFull(currentTotal, sym)}/mo &middot; {formatCurrencyFull(currentTotal * 12, sym)}/yr</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">At retirement (age {scenario.retirementAge})</span>
            <span className="font-semibold text-slate-700">{formatCurrencyFull(retirementTotal, sym)}/mo &middot; {formatCurrencyFull(retirementTotal * 12, sym)}/yr</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            Before inflation. Amounts grow at {scenario.inflationRate}% per year.
          </p>
        </div>
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
