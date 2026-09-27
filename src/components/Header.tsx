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
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top micro bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Portal Insentif Sales</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Sheet: <strong className="text-white">INSENTIF AGUSTUS</strong> + <strong className="text-amber-300">Bonus Store</strong>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-200 font-medium underline underline-offset-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Kelola / Sinkron Data</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onSwitchToAdmin && (
            <>
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Portal Manajer (mgr35)</span>
              </button>
              <span className="text-slate-600">|</span>
            </>
          )}
          <button
            type="button"
            onClick={onSwitchSales}
            className="hover:text-white transition-colors text-slate-300 underline underline-offset-2 cursor-pointer"
          >
            Ganti Sales
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={onLogout}
            className="hover:text-rose-400 transition-colors flex items-center gap-1 text-slate-300 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Profile & Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          {/* Left: Sales Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md shadow-indigo-100 flex-shrink-0">
              {employee.nama.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  NIP: {employee.nip}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Periode Agustus 2026
                </span>
                {employee.departments.length > 0 && employee.departments[0] !== '-' && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    Dept: {employee.departments.join(', ')}
                  </span>
                )}
                {employee.bonusStoreAmount > 0 ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Store className="w-3 h-3 text-amber-700" />
                    Bonus Store: {formatRupiah(employee.bonusStoreAmount)}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Bonus Store: Rp 0
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {employee.nama}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Total {employee.transactionCount} transaksi terhitung</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Status: Terverifikasi</span>
                <span>•</span>
                <span className="text-slate-400 font-mono text-xs">
                  {totalRecordsCount.toLocaleString('id-ID')} total baris sheet
                </span>
              </p>
            </div>
          </div>

          {/* Right: Net Incentive & Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
            <div className="sm:text-right pr-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Diterima (Take Home Pay)
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-indigo-950">
                {formatRupiah(employee.totalTakeHomePay)}
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 justify-end mt-0.5">
                <span>Insentif: <strong className="text-emerald-700 font-mono">{formatRupiah(employee.totalInsentif)}</strong></span>
                {employee.bonusStoreAmount > 0 && (
                  <span>• Bonus Store: <strong className="text-amber-700 font-mono">{formatRupiah(employee.bonusStoreAmount)}</strong></span>
                )}
              </div>
              {employee.totalNegative !== 0 && (
                <span className="text-[10px] text-rose-600 block text-right mt-0.5">
                  Termasuk potongan minus: {formatRupiah(employee.totalNegative)}
                </span>
              )}
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-3 flex items-center gap-2">
              <button
                id="btn-open-slip-gaji"
                type="button"
                onClick={onOpenSlipGaji}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Slip Gaji</span>
              </button>

              <button
                type="button"
                onClick={onOpenImportModal}
                title="Kelola & Impor file spreadsheet Excel (.xlsx)"
                className="p-2.5 rounded-xl border border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
