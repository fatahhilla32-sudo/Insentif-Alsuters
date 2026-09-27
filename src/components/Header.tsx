import React from 'react';
import { SalesEmployee } from '../types';
import { formatRupiah } from '../utils/numberFormat';
import {
  User,
  LogOut,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
  Database,
  ShieldAlert,
  Store,
  Wallet,
  Sparkles,
  Users,
} from 'lucide-react';

interface HeaderProps {
  employee: SalesEmployee;
  onOpenSlipGaji: () => void;
  onLogout: () => void;
  onSwitchSales: () => void;
  onSwitchToAdmin?: () => void;
  onOpenImportModal: () => void;
  dataSourceLabel: string;
  isCustomData: boolean;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  employee,
  onOpenSlipGaji,
  onLogout,
  onSwitchSales,
  onSwitchToAdmin,
  onOpenImportModal,
  dataSourceLabel,
  isCustomData,
  totalRecordsCount,
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top micro bar with deep midnight tone */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 sm:px-8 py-2 flex flex-wrap justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-100 tracking-wide">Portal Insentif Sales</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Sheet: <strong className="text-emerald-400">INSENTIF AGUSTUS</strong> + <strong className="text-amber-400">Bonus Store</strong>
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-200 font-medium transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sinkron Data</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onSwitchToAdmin && (
            <>
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Portal Manajer (mgr35)</span>
              </button>
              <span className="text-slate-700">|</span>
            </>
          )}
          <button
            type="button"
            onClick={onSwitchSales}
            className="hover:text-white transition-colors text-slate-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Ganti Sales</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={onLogout}
            className="hover:text-rose-400 transition-colors flex items-center gap-1 text-slate-300 cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Profile & Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: Sales Identity & Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-500/20 border border-indigo-400/30 flex-shrink-0">
              {employee.nama.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  NIP: {employee.nip}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Periode Agustus 2026
                </span>
                {employee.departments.length > 0 && employee.departments[0] !== '-' && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    Dept: {employee.departments.join(', ')}
                  </span>
                )}
                {employee.bonusStoreAmount > 0 ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                    <Store className="w-3 h-3 text-amber-700" />
                    Bonus Store: {formatRupiah(employee.bonusStoreAmount)}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Bonus Store: Rp 0
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                {employee.nama}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Total <strong className="text-slate-800 font-semibold">{employee.transactionCount} transaksi</strong> terhitung</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Terverifikasi
                </span>
                <span>•</span>
                <span className="text-slate-400 font-mono text-xs">
                  {totalRecordsCount.toLocaleString('id-ID')} total baris sheet
                </span>
              </p>
            </div>
          </div>

          {/* Right: Net Incentive Card & CTA Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-4 sm:p-5 rounded-2xl border border-indigo-900/60 shadow-lg text-white">
            <div className="sm:text-right pr-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                Total Diterima (Take Home Pay)
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400 mt-0.5">
                {formatRupiah(employee.totalTakeHomePay)}
              </div>
              <div className="text-[11px] text-slate-300 flex flex-wrap gap-2 justify-start sm:justify-end mt-1">
                <span>Insentif: <strong className="text-emerald-300 font-mono">{formatRupiah(employee.totalInsentif)}</strong></span>
                {employee.bonusStoreAmount > 0 && (
                  <span>• Bonus: <strong className="text-amber-300 font-mono">{formatRupiah(employee.bonusStoreAmount)}</strong></span>
                )}
              </div>
              {employee.totalNegative !== 0 && (
                <span className="text-[11px] text-rose-300 font-medium block text-left sm:text-right mt-0.5">
                  Termasuk potongan: {formatRupiah(employee.totalNegative)}
                </span>
              )}
            </div>

            <div className="sm:border-l sm:border-indigo-800/80 sm:pl-4 flex items-center gap-2">
              <button
                id="btn-open-slip-gaji"
                type="button"
                onClick={onOpenSlipGaji}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 shadow-md shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Lihat Slip Gaji</span>
              </button>

              <button
                type="button"
                onClick={onOpenImportModal}
                title="Kelola & Impor file spreadsheet Excel (.xlsx)"
                className="p-2.5 rounded-xl border border-indigo-700/60 hover:border-indigo-500 bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
