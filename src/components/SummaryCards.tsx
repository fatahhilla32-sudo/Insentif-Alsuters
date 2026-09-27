import React from 'react';
import { IncentiveTypeSummary } from '../types';
import { formatRupiah } from '../utils/numberFormat';
import { Layers, ArrowDownRight, ArrowUpRight, Filter, Check } from 'lucide-react';

interface SummaryCardsProps {
  typeSummaries: IncentiveTypeSummary[];
  totalInsentif: number;
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  typeSummaries,
  totalInsentif,
  selectedType,
  onSelectType,
}) => {
  return (
    <section id="incentive-summary-section" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Ringkasan Akumulasi Insentif per Tipe
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {typeSummaries.length} Tipe Terdata
          </span>
        </div>
        {selectedType && (
          <button
            type="button"
            onClick={() => onSelectType(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors w-fit"
          >
            <span>Filter Aktif: <strong>{selectedType}</strong></span>
            <span className="text-slate-400 ml-1">✕ Reset Filter</span>
          </button>
        )}
      </div>

      {/* Grid of Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {typeSummaries.map((summary) => {
          const isSelected = selectedType === summary.type;
          const percentage =
            totalInsentif > 0
              ? Math.max(0, Math.round((summary.total / totalInsentif) * 100))
              : 0;

          return (
            <div
              key={summary.type}
              id={`summary-box-${summary.type.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
              onClick={() => onSelectType(isSelected ? null : summary.type)}
              className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 group-hover:text-indigo-700 transition-colors line-clamp-1">
                  {summary.type}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold flex-shrink-0">
                  {summary.count} tx
                </span>
              </div>

              {/* Amount Display */}
              <div className="mt-2.5">
                <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {formatRupiah(summary.total)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>Kontribusi {percentage}%</span>
                  {summary.negativeTotal !== 0 && (
                    <span className="text-rose-600 font-medium text-[11px]">
                      Minus: {formatRupiah(summary.negativeTotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected ? 'bg-indigo-600' : 'bg-slate-400 group-hover:bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                />
              </div>

              {/* Filter helper hint */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  <Filter className="w-3 h-3" />
                  <span>{isSelected ? 'Sedang difilter' : 'Klik untuk filter detail'}</span>
                </span>
                {isSelected && (
                  <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Aktif</span>
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
