import { useState, useEffect, useCallback } from 'react';
import { Calculator, Download, Upload } from 'lucide-react';
import { createDefaultScenario, SCENARIO_COLORS, DEFAULT_EXPENSE_CATEGORIES } from './data/defaults';
import ScenarioManager from './components/ScenarioManager';
import InputPanel from './components/InputPanel';
import ResultsDashboard from './components/ResultsDashboard';

const STORAGE_KEY = 'retirement-planner-scenarios';

function migrateScenario(s) {
  if (!s.expenseCategories) {
    const monthly = Math.round((s.annualExpenses || 50000) / 12);
    s.expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      monthly: cat.id === 'exp-1' ? Math.round(monthly * 0.40) :
               cat.id === 'exp-2' ? Math.round(monthly * 0.15) :
               cat.id === 'exp-3' ? Math.round(monthly * 0.10) :
               cat.id === 'exp-4' ? Math.round(monthly * 0.06) :
               cat.id === 'exp-5' ? Math.round(monthly * 0.05) :
               cat.id === 'exp-6' ? Math.round(monthly * 0.08) :
               cat.id === 'exp-7' ? 0 :
               Math.round(monthly * 0.16),
      startAge: s.currentAge || 30,
      endAge: cat.endAge || s.lifeExpectancy || 90,
    }));
    delete s.annualExpenses;
    delete s.retirementExpensePercent;
    delete s.healthcareMonthlyCost;
  }
  delete s.housingType;
  delete s.monthlyRent;
  delete s.homePrice;
  delete s.downPaymentPercent;
  delete s.mortgageRate;
  delete s.mortgageTerm;
  delete s.propertyTaxRate;
  delete s.homeAppreciation;
  return s;
}

function loadScenarios() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(migrateScenario);
      }
    }
  } catch {}
  return [createDefaultScenario('Base Case', SCENARIO_COLORS[0])];
}

function saveScenarios(scenarios) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {}
}

export default function App() {
  const [scenarios, setScenarios] = useState(loadScenarios);
  const [activeId, setActiveId] = useState(scenarios[0]?.id);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    saveScenarios(scenarios);
  }, [scenarios]);

  const activeScenario = scenarios.find((s) => s.id === activeId) || scenarios[0];

  const updateScenario = useCallback((updated) => {
    setScenarios((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const addScenario = useCallback(() => {
    const idx = scenarios.length;
    const color = SCENARIO_COLORS[idx % SCENARIO_COLORS.length];
    const names = ['Base Case', 'Scenario B', 'Scenario C', 'Scenario D'];
    const newScenario = createDefaultScenario(names[idx] || `Scenario ${idx + 1}`, color);
    setScenarios((prev) => [...prev, newScenario]);
    setActiveId(newScenario.id);
    setCompareMode(false);
  }, [scenarios.length]);

  const removeScenario = useCallback((id) => {
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[0].id);
      if (next.length <= 1) setCompareMode(false);
      return next;
    });
  }, [activeId]);

  const renameScenario = useCallback((id, name) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const duplicateScenario = useCallback((id) => {
    if (scenarios.length >= 4) return;
    const source = scenarios.find((s) => s.id === id);
    if (!source) return;
    const idx = scenarios.length;
    const color = SCENARIO_COLORS[idx % SCENARIO_COLORS.length];
    const newScenario = {
      ...source,
      id: `scenario-${Date.now()}-dup`,
      name: `${source.name} (copy)`,
      color,
    };
    setScenarios((prev) => [...prev, newScenario]);
    setActiveId(newScenario.id);
  }, [scenarios]);

  const exportScenarios = useCallback(() => {
    const blob = new Blob([JSON.stringify(scenarios, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retirement-scenarios.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [scenarios]);

  const importScenarios = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            setScenarios(imported);
            setActiveId(imported[0].id);
            setCompareMode(false);
          }
        } catch {}
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary-500 rounded-lg p-1.5">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 leading-tight">Retirement Planner</h1>
                <p className="text-[10px] text-slate-400 leading-tight">Plan your financial future</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={importScenarios}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                type="button"
                onClick={exportScenarios}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="mb-4">
          <ScenarioManager
            scenarios={scenarios}
            activeId={activeId}
            compareMode={compareMode}
            onSelect={setActiveId}
            onAdd={addScenario}
            onRemove={removeScenario}
            onRename={renameScenario}
            onDuplicate={duplicateScenario}
            onToggleCompare={() => setCompareMode(!compareMode)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {!compareMode && (
            <aside className="w-full lg:w-[360px] flex-shrink-0">
              <div className="lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-88px)] lg:overflow-y-auto lg:pr-1 pb-4">
                <InputPanel
                  scenario={activeScenario}
                  onChange={updateScenario}
                />
              </div>
            </aside>
          )}

          <main className="flex-1 min-w-0">
            <ResultsDashboard
              scenarios={scenarios}
              activeScenarioId={activeId}
              compareMode={compareMode}
            />
          </main>
        </div>
      </div>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-slate-400 text-center">
            This tool provides estimates for educational purposes only. Consult a financial advisor for personalized advice.
            Tax calculations are approximations based on 2024 brackets.
          </p>
        </div>
      </footer>
    </div>
  );
}
