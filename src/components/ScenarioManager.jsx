import { Plus, X, GitCompare, Copy } from 'lucide-react';
import { SCENARIO_COLORS } from '../data/defaults';

export default function ScenarioManager({
  scenarios,
  activeId,
  compareMode,
  onSelect,
  onAdd,
  onRemove,
  onRename,
  onDuplicate,
  onToggleCompare,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {scenarios.map((s) => (
        <div
          key={s.id}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all
            ${activeId === s.id && !compareMode
              ? 'bg-white shadow-sm border-2 text-slate-800'
              : 'bg-white/60 border border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm'}`}
          style={activeId === s.id && !compareMode ? { borderColor: s.color } : {}}
          onClick={() => onSelect(s.id)}
        >
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
          <input
            type="text"
            value={s.name}
            onChange={(e) => onRename(s.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent border-none outline-none text-sm font-medium w-24 min-w-0"
            style={{ color: 'inherit' }}
          />
          {scenarios.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(s.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(s.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-primary-500"
            title="Duplicate scenario"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {scenarios.length < 4 && (
        <button
          type="button"
          onClick={() => onAdd()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 border border-dashed border-slate-300 hover:border-primary-400 hover:text-primary-500 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      )}

      {scenarios.length > 1 && (
        <button
          type="button"
          onClick={onToggleCompare}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ml-auto
            ${compareMode
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare</span>
        </button>
      )}
    </div>
  );
}
