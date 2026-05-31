import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon: Icon, isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-t-xl"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-primary-500" />}
        <div className="text-left">
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

export function InputField({ label, value, onChange, type = 'number', prefix, suffix, tooltip, min, max, step, className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        {tooltip && (
          <div className="relative">
            <Info
              className="w-3.5 h-3.5 text-slate-300 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap z-50 max-w-[240px] whitespace-normal">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          min={min}
          max={max}
          step={step || 1}
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all
            ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, tooltip }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        {tooltip && (
          <div className="relative group">
            <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
          </div>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700
          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ToggleGroup({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-all
              ${value === opt.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '%', displayValue }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs font-semibold text-primary-600">
          {displayValue || `${value}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

export function StatCard({ label, value, subtitle, color = 'primary', icon: Icon }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-700 border-primary-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.primary}`}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 opacity-60" />}
        <p className="text-xs font-medium opacity-70">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  );
}
