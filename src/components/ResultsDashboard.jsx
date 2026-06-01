import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Wallet, TrendingUp, Clock, AlertTriangle, ShieldCheck, PiggyBank } from 'lucide-react';
import { Card, StatCard } from './ui';
import { formatCurrency, formatCurrencyFull, formatPercent } from '../utils/formatters';
import { LOCATIONS } from '../data/defaults';
import { runProjection } from '../engine/retirementEngine';

function ChartCard({ title, children }) {
  return (
    <Card className="p-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      {children}
    </Card>
  );
}

function CustomTooltip({ active, payload, label, symbol }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">Age {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-medium text-slate-700">{formatCurrencyFull(entry.value, symbol)}</span>
        </div>
      ))}
    </div>
  );
}

function SingleScenarioView({ scenario }) {
  const loc = LOCATIONS[scenario.location] || LOCATIONS.seattle;
  const sym = loc.symbol;

  const result = useMemo(() => runProjection(scenario), [scenario]);
  const { yearlyData, summary } = result;

  const readinessColor = summary.fundedPercentage >= 100 ? 'emerald' :
    summary.fundedPercentage >= 75 ? 'amber' : 'rose';
  const readinessIcon = summary.fundedPercentage >= 100 ? ShieldCheck : AlertTriangle;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          label="Savings at Retirement"
          value={formatCurrency(summary.retirementSavings, sym)}
          subtitle={`Age ${scenario.retirementAge}`}
          color="primary"
          icon={PiggyBank}
        />
        <StatCard
          label="Monthly Income (4% Rule)"
          value={formatCurrency(summary.monthlyRetirementIncome * 12, sym)}
          subtitle={`${formatCurrencyFull(summary.monthlyRetirementIncome, sym)}/month from investments`}
          color="emerald"
          icon={Wallet}
        />
        <StatCard
          label="Retirement Readiness"
          value={`${summary.fundedPercentage}%`}
          subtitle={summary.moneyRunsOutAge
            ? `Money runs out at age ${summary.moneyRunsOutAge}`
            : `Funded through age ${scenario.lifeExpectancy}`}
          color={readinessColor}
          icon={readinessIcon}
        />
        <StatCard
          label="Years Funded"
          value={`${summary.yearsFunded} years`}
          subtitle={`Retirement age ${scenario.retirementAge} to ${scenario.retirementAge + summary.yearsFunded}`}
          color="primary"
          icon={Clock}
        />
        <StatCard
          label="Effective Tax Rate"
          value={formatPercent(summary.currentEffectiveTaxRate)}
          subtitle={`In ${loc.name}`}
          color="amber"
          icon={TrendingUp}
        />
        <StatCard
          label="Annual Income Gap"
          value={summary.incomeGap > 0 ? formatCurrency(summary.incomeGap, sym) : 'None'}
          subtitle={summary.incomeGap > 0 ? 'Shortfall at retirement' : 'Fully funded at retirement'}
          color={summary.incomeGap > 0 ? 'rose' : 'emerald'}
          icon={summary.incomeGap > 0 ? AlertTriangle : ShieldCheck}
        />
      </div>

      <ChartCard title="Net Worth Over Time">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={yearlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              tickFormatter={(v) => formatCurrency(v, sym)}
            />
            <Tooltip content={<CustomTooltip symbol={sym} />} />
            <ReferenceLine x={scenario.retirementAge} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: 'Retirement', fontSize: 11, fill: '#d97706' }} />
            <Area type="monotone" dataKey="totalNetWorth" name="Net Worth" stroke="#3b82f6" fill="url(#netWorthGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Account Balances Over Time">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={yearlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="tdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="tfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v, sym)} />
            <Tooltip content={<CustomTooltip symbol={sym} />} />
            <ReferenceLine x={scenario.retirementAge} stroke="#f59e0b" strokeDasharray="6 3" />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="taxDeferredBalance" name={LOCATIONS[scenario.location]?.country === 'CA' ? 'RRSP' : '401(k)'} stackId="1" stroke="#6366f1" fill="url(#tdGrad)" />
            <Area type="monotone" dataKey="taxFreeBalance" name={LOCATIONS[scenario.location]?.country === 'CA' ? 'TFSA' : 'Roth IRA'} stackId="1" stroke="#10b981" fill="url(#tfGrad)" />
            <Area type="monotone" dataKey="taxableBalance" name="Taxable" stackId="1" stroke="#f59e0b" fill="url(#txGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Annual Income vs. Expenses">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={yearlyData.filter((_, i) => i % 2 === 0)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v, sym)} />
            <Tooltip content={<CustomTooltip symbol={sym} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine x={scenario.retirementAge} stroke="#f59e0b" strokeDasharray="6 3" />
            <Bar dataKey="grossIncome" name="Income" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[2, 2, 0, 0]} opacity={0.7} />
            <Bar dataKey="totalTax" name="Taxes" fill="#f59e0b" radius={[2, 2, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ComparisonView({ scenarios }) {
  const results = useMemo(
    () => scenarios.map((s) => ({ scenario: s, result: runProjection(s) })),
    [scenarios]
  );

  const mergedData = useMemo(() => {
    if (results.length === 0) return [];
    const maxLen = Math.max(...results.map((r) => r.result.yearlyData.length));
    const merged = [];
    for (let i = 0; i < maxLen; i++) {
      const point = { age: results[0].result.yearlyData[i]?.age || i };
      results.forEach(({ scenario, result }) => {
        const d = result.yearlyData[i];
        if (d) {
          point[`${scenario.name}_netWorth`] = d.totalNetWorth;
        }
      });
      merged.push(point);
    }
    return merged;
  }, [results]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {results.map(({ scenario, result }) => {
          const loc = LOCATIONS[scenario.location] || LOCATIONS.seattle;
          return (
            <Card key={scenario.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }} />
                <h4 className="text-sm font-semibold text-slate-700">{scenario.name}</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Retirement Savings</span>
                  <span className="font-semibold">{formatCurrency(result.summary.retirementSavings, loc.symbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Income</span>
                  <span className="font-semibold">{formatCurrency(result.summary.monthlyRetirementIncome * 12, loc.symbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Readiness</span>
                  <span className={`font-bold ${result.summary.fundedPercentage >= 100 ? 'text-emerald-600' : result.summary.fundedPercentage >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {result.summary.fundedPercentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Rate</span>
                  <span className="font-semibold">{formatPercent(result.summary.currentEffectiveTaxRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold">{loc.name}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ChartCard title="Net Worth Comparison">
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={mergedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="age" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => formatCurrency(v, '$')} />
            <Tooltip content={<CustomTooltip symbol="$" />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {results.map(({ scenario }) => (
              <Area
                key={scenario.id}
                type="monotone"
                dataKey={`${scenario.name}_netWorth`}
                name={scenario.name}
                stroke={scenario.color}
                fill={scenario.color}
                fillOpacity={0.08}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export default function ResultsDashboard({ scenarios, activeScenarioId, compareMode }) {
  if (compareMode && scenarios.length > 1) {
    return <ComparisonView scenarios={scenarios} />;
  }

  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  if (!scenario) return null;

  return <SingleScenarioView scenario={scenario} />;
}
