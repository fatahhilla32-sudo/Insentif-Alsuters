import React from 'react';
import { IncentiveTypeSummary } from '../types';
import { formatRupiah, formatNumber } from '../utils/numberFormat';
import {
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Check,
  Sparkles,
  TrendingUp,
  Receipt,
  RotateCcw,
} from 'lucide-react';

interface SummaryCardsProps {
  typeSummaries: IncentiveTypeSummary[];
  totalInsentif: number;
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

// Visual color palette assignments for various incentive types
const COLOR_VARIANTS = [
  {
    border: 'hover:border-indigo-400',
    activeBg: 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20',
    bar: 'bg-indigo-600',
    badge: 'bg-indigo-100/80 text-indigo-700',
    accentText: 'text-indigo-900',
  },
  {
    border: 'hover:border-emerald-400',
    activeBg: 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20',
    bar: 'bg-emerald-600',
    badge: 'bg-emerald-100/80 text-emerald-800',
    accentText: 'text-emerald-950',
  },
  {
    border: 'hover:border-violet-400',
    activeBg: 'bg-violet-50/80 border-violet-500 ring-2 ring-violet-500/20',
    bar: 'bg-violet-600',
    badge: 'bg-violet-100/80 text-violet-700',
    accentText: 'text-violet-950',
  },
  {
    border: 'hover:border-amber-400',
    activeBg: 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20',
    bar: 'bg-amber-500',
    badge: 'bg-amber-100/80 text-amber-800',
    accentText: 'text-amber-950',
  },
  {
    border: 'hover:border-sky-400',
    activeBg: 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20',
    bar: 'bg-sky-600',
    badge: 'bg-sky-100/80 text-sky-800',
    accentText: 'text-sky-950',
  },
  {
    border: 'hover:border-teal-400',
    activeBg: 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20',
    bar: 'bg-teal-600',
    badge: 'bg-teal-100/80 text-teal-800',
    accentText: 'text-teal-950',
  },
];

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  typeSummaries,
  totalInsentif,
  selectedType,
  onSelectType,
}) => {
  return (
    <section id="incentive-summary-section" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Ringkasan Insentif per Kategori
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                {typeSummaries.length} Tipe
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Klik pada salah satu kotak kategori untuk memfilter tabel detail secara langsung.
            </p>
          </div>
        </div>

        {selectedType && (
          <button
            type="button"
            onClick={() => onSelectType(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all cursor-pointer w-fit shadow-2xs"
          >
            <span>Filter Aktif: <strong>{selectedType}</strong></span>
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500 ml-1" />
            <span>Setel Ulang</span>
          </button>
        )}
      </div>

      {/* Grid of Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {typeSummaries.map((summary, idx) => {
          const isSelected = selectedType === summary.type;
          const percentage =
            totalInsentif > 0
              ? Math.max(0, Math.round((summary.total / totalInsentif) * 100))
              : 0;
          const variant = COLOR_VARIANTS[idx % COLOR_VARIANTS.length];

          return (
            <div
              key={summary.type}
              id={`summary-box-${summary.type.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
              onClick={() => onSelectType(isSelected ? null : summary.type)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? variant.activeBg + ' shadow-md scale-[1.01]'
                  : `bg-white border-slate-200/90 ${variant.border} hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-indigo-700 transition-colors line-clamp-1">
                  {summary.type}
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${variant.badge}`}>
                  {summary.count} tx
                </span>
              </div>

              {/* Amount Display */}
              <div className="mt-2.5">
                <div className={`text-xl font-extrabold font-mono tracking-tight ${variant.accentText}`}>
                  {formatRupiah(summary.total)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span className="font-medium text-slate-600">Kontribusi {percentage}%</span>
                  {summary.negativeTotal !== 0 && (
                    <span className="text-rose-600 font-semibold text-[11px]">
                      Minus: {formatRupiah(summary.negativeTotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected ? 'bg-indigo-600' : variant.bar
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                />
              </div>

              {/* Filter helper hint */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  <Filter className="w-3 h-3" />
                  <span>{isSelected ? 'Sedang difilter' : 'Klik untuk filter'}</span>
                </span>
                {isSelected ? (
                  <span className="text-indigo-700 font-bold flex items-center gap-0.5 bg-indigo-100/70 px-1.5 py-0.2 rounded-md">
                    <Check className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    Pilih &rarr;
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
