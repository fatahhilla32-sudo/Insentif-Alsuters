import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Link2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Users,
  Search,
} from 'lucide-react';
import { ValidationSummary } from '../types';
import { formatRupiah, formatNumber } from '../utils/numberFormat';

interface ValidationSummaryCardProps {
  summary: ValidationSummary;
  onRefreshBonusStore?: () => void;
  isSyncing?: boolean;
}

export const ValidationSummaryCard: React.FC<ValidationSummaryCardProps> = ({
  summary,
  onRefreshBonusStore,
  isSyncing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'bonusOnly' | 'agustusOnly'>('bonusOnly');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBonusOnly = summary.bonusStoreOnlyNips.filter((nip) =>
    nip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="validation-summary-panel"
      className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-800/60 rounded-xl p-4 sm:p-5 shadow-lg text-white mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/50">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Link2 className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Ringkasan Validasi Penggabungan Data
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                NIP String Matched
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Sheet <span className="font-semibold text-white">INSENTIF AGUSTUS</span> digabungkan dengan sheet{' '}
              <span className="font-semibold text-amber-300">"Bonus Store"</span> (Range Dinamis: 'Bonus Store'!A1:Z)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshBonusStore && (
            <button
              type="button"
              onClick={onRefreshBonusStore}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-xs font-semibold text-white border border-indigo-500/40 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Ulang Sheet'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail Validasi'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4 Primary Validation Counters as requested */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>1. Baris Asli AGUSTUS</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {formatNumber(summary.agustusRowCount)}{' '}
            <span className="text-xs font-normal text-slate-300">baris</span>
          </div>
          <p className="text-[11px] text-blue-300/90 mt-1">
            {summary.agustusUniqueNipCount} NIP Sales Unik
          </p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>2. Baris Bonus Store</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {formatNumber(summary.bonusStoreRowCount)}{' '}
            <span className="text-xs font-normal text-slate-300">baris</span>
          </div>
          <p className="text-[11px] text-amber-300/90 mt-1">
            {summary.bonusStoreUniqueNipCount} NIP Sales Unik
          </p>
        </div>

        <div className="bg-slate-800/70 border border-emerald-700/50 rounded-lg p-3 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>3. Berhasil Dicocokkan</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 tracking-tight">
            {formatNumber(summary.matchedNipCount)}{' '}
            <span className="text-xs font-normal text-emerald-200">NIP</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1">
            Total Bonus: {formatRupiah(summary.totalBonusStoreMatched)}
          </p>
        </div>

        <div className="bg-slate-800/70 border border-amber-700/50 rounded-lg p-3 bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span>4. NIP Tidak Cocok</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 tracking-tight">
            {summary.bonusStoreOnlyNips.length + summary.agustusOnlyNips.length}{' '}
            <span className="text-xs font-normal text-amber-200">NIP</span>
          </div>
          <p className="text-[11px] text-amber-300/90 mt-1">
            {summary.bonusStoreOnlyNips.length} Store-Only • {summary.agustusOnlyNips.length} Agustus-Only
          </p>
        </div>
      </div>

      {/* Header Columns Detection Badge */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-indigo-900/60 text-xs text-slate-300">
        <span className="font-semibold text-indigo-300 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Header Terdeteksi dari Sheet "Bonus Store":
        </span>
        {summary.bonusStoreHeaders.map((hdr) => (
          <span
            key={hdr}
            className="px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 font-mono text-[11px]"
          >
            {hdr}
          </span>
        ))}
        <span className="text-slate-400 text-[11px] ml-auto">
          Perlakuan NIP: String comparison (mendukung alfanumerik seperti E03638, X078342)
        </span>
      </div>

      {/* Expandable Drilldown for Unmatched NIPs */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-indigo-800/60 bg-slate-950/50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('bonusOnly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'bonusOnly'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Hanya di Bonus Store ({summary.bonusStoreOnlyNips.length} NIP)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('agustusOnly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'agustusOnly'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Hanya di INSENTIF AGUSTUS ({summary.agustusOnlyNips.length} NIP)
              </button>
            </div>

            {activeTab === 'bonusOnly' && (
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari NIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {activeTab === 'bonusOnly' ? (
            <div>
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-200 mb-3">
                <span className="font-bold">Ketentuan 5 terpenuhi:</span> Sebanyak{' '}
                <span className="font-semibold text-white">{summary.bonusStoreOnlyNips.length} NIP</span> yang ada di
                sheet "Bonus Store" tetapi tidak ada di INSENTIF AGUSTUS{' '}
                <span className="underline">tetap ditampilkan dan dicatat sebagai baris terpisah</span> dengan tanda
                khusus <span className="bg-amber-900/60 text-amber-300 px-1 py-0.5 rounded font-mono">Bonus Store Only</span>,
                dengan insentif penjualan Rp 0 dan nominal bonus store tetap tercatat lengkap.
              </div>
              <div className="max-h-48 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {filteredBonusOnly.map((nip) => (
                    <div
                      key={nip}
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700/80 text-center text-xs font-mono text-amber-300"
                    >
                      {nip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg text-xs text-blue-200 mb-3">
                <span className="font-bold">Ketentuan 6 terpenuhi:</span> Sebanyak{' '}
                <span className="font-semibold text-white">{summary.agustusOnlyNips.length} NIP</span> berikut terdaftar
                di INSENTIF AGUSTUS namun tidak memiliki data di sheet "Bonus Store". Baris transaksi tetap utuh dan kolom
                tambahan Bonus Store diisi <span className="font-mono bg-blue-900/60 px-1 py-0.5 rounded">Rp 0 / Kosong</span>.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.agustusOnlyNips.map((nip) => (
                  <div
                    key={nip}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs text-slate-400">NIP Sales</div>
                      <div className="text-sm font-mono font-bold text-white">{nip}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50 font-medium">
                        Bonus Store: Rp 0
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
