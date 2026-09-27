import React, { useState, useMemo } from 'react';
import { SalesEmployee, OverallIncentiveSummary, IncentiveRecord } from '../types';
import { formatRupiah, formatNumber } from '../utils/numberFormat';
import { DetailTable } from './DetailTable';
import { SummaryCards } from './SummaryCards';
import { SlipGajiModal } from './SlipGajiModal';
import { ValidationSummaryCard } from './ValidationSummaryCard';
import {
  ShieldAlert,
  Users,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Download,
  Search,
  ArrowUpDown,
  Filter,
  FileText,
  Eye,
  LogOut,
  ChevronRight,
  Sparkles,
  Building2,
  PieChart,
  Calendar,
  X,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  CheckCircle2,
  AlertTriangle,
  Wallet,
} from 'lucide-react';

interface AdminDashboardProps {
  overallSummary: OverallIncentiveSummary;
  employees: SalesEmployee[];
  records: IncentiveRecord[];
  dataSourceLabel: string;
  onLogout: () => void;
  onOpenImportModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  overallSummary,
  employees,
  records,
  dataSourceLabel,
  onLogout,
  onOpenImportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedMatchStatus, setSelectedMatchStatus] = useState<
    'ALL' | 'matched' | 'bonus_only' | 'agustus_only'
  >('ALL');
  const [sortBy, setSortBy] = useState<
    'takehome_desc' | 'total_desc' | 'bonus_desc' | 'total_asc' | 'name_asc' | 'tx_desc'
  >('takehome_desc');

  // Selected sales for detail view or slip gaji modal
  const [inspectingEmployee, setInspectingEmployee] = useState<SalesEmployee | null>(null);
  const [slipGajiEmployee, setSlipGajiEmployee] = useState<SalesEmployee | null>(null);
  const [inspectingTypeFilter, setInspectingTypeFilter] = useState<string | null>(null);

  // Unique departments
  const availableDepts = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((emp) => {
      emp.departments.forEach((d) => {
        if (d && d !== '-') depts.add(d);
      });
    });
    return Array.from(depts).sort();
  }, [employees]);

  // Filtered and sorted employees
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          emp.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.nip.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'ALL' || emp.departments.includes(selectedDept);
        const matchesStatus =
          selectedMatchStatus === 'ALL' || emp.matchingStatus === selectedMatchStatus;
        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'takehome_desc') return b.totalTakeHomePay - a.totalTakeHomePay;
        if (sortBy === 'total_desc') return b.totalInsentif - a.totalInsentif;
        if (sortBy === 'bonus_desc') return b.bonusStoreAmount - a.bonusStoreAmount;
        if (sortBy === 'total_asc') return a.totalTakeHomePay - b.totalTakeHomePay;
        if (sortBy === 'name_asc') return a.nama.localeCompare(b.nama);
        if (sortBy === 'tx_desc') return b.transactionCount - a.transactionCount;
        return 0;
      });
  }, [employees, searchQuery, selectedDept, selectedMatchStatus, sortBy]);

  // Export summary table to CSV
  const handleExportSummaryCSV = () => {
    const headers = [
      'Peringkat',
      'NIP',
      'Nama Sales',
      'Departemen',
      'Total Transaksi',
      'Insentif Penjualan (Agustus)',
      'Bonus Store (Rp)',
      'Grand Total (Take Home Pay)',
      'Total Positif',
      'Total Potongan Minus',
      'Status Pencocokan',
      'Rincian Tipe',
    ];

    const rows = filteredEmployees.map((emp, index) => [
      index + 1,
      `"${emp.nip}"`,
      `"${emp.nama.replace(/"/g, '""')}"`,
      `"${emp.departments.join(', ')}"`,
      emp.transactionCount,
      emp.totalInsentif,
      emp.bonusStoreAmount,
      emp.totalTakeHomePay,
      emp.totalPositive,
      emp.totalNegative,
      `"${emp.matchingStatus}"`,
      `"${emp.typeSummaries.map((t) => `${t.type}: ${t.total}`).join('; ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `rekap_insentif_dan_bonus_store_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="admin-dashboard-root"
      className="min-h-screen bg-slate-50/80 flex flex-col font-sans antialiased text-slate-800"
    >
      {/* Top micro bar with deep midnight tone */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 sm:px-8 py-2 flex flex-wrap justify-between items-center gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <span className="font-bold text-amber-300">PORTAL MANAJER / ADMINISTRATOR</span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            User ID: <strong className="text-white font-mono">mgr35</strong> • Sheet:{' '}
            <strong className="text-emerald-400">INSENTIF AGUSTUS</strong> (Cell A1:G11068) + <strong className="text-amber-400">Bonus Store</strong> (A1:Z Dinamis)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="hover:text-white transition-colors text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kelola / Sinkron Data</span>
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

      {/* Admin Hero Header */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Role: Administrator / Manager (mgr35)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Periode Agustus 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Data Digabungkan & Tervalidasi
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Rekapitulasi Insentif Sales & Bonus Store
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span>
                  Total <strong>{overallSummary.totalEmployees}</strong> orang sales terdata
                </span>
                <span>•</span>
                <span>
                  <strong>{overallSummary.totalTransactions.toLocaleString('id-ID')}</strong> baris
                  transaksi (Cell A:G)
                </span>
                <span>•</span>
                <span className="text-slate-600">
                  Sheet INSENTIF AGUSTUS + Sheet Bonus Store (gid 1621745252)
                </span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportSummaryCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Ekspor Rekap CSV</span>
              </button>
              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Sinkron Spreadsheet</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* VALIDATION SUMMARY CARD: Ringkasan validasi penggabungan data INSENTIF AGUSTUS + Bonus Store */}
        <ValidationSummaryCard
          summary={overallSummary.validationSummary}
          onRefreshBonusStore={onOpenImportModal}
        />

        {/* Top 4 KPI Metrics including Bonus Store and Grand Total */}
        <section aria-labelledby="kpi-metrics-title">
          <h2 id="kpi-metrics-title" className="sr-only">
            Statistik Utama Perusahaan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Grand Total Take Home Pay */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-700 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Grand Total Diterima
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-2xl sm:text-3xl text-amber-300">
                {formatRupiah(overallSummary.totalTakeHomePay)}
              </div>
              <div className="mt-2 text-xs text-indigo-200/90 flex items-center justify-between">
                <span>Insentif + Bonus Store</span>
                <span className="text-emerald-400 font-semibold">Take Home Pay</span>
              </div>
            </div>

            {/* Total Insentif Penjualan Agustus */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Insentif Penjualan (Netto)
                </span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-2xl sm:text-3xl text-emerald-700">
                {formatRupiah(overallSummary.totalInsentif)}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Sheet INSENTIF AGUSTUS</span>
                <span className="text-emerald-600 font-medium">11.067 Baris</span>
              </div>
            </div>

            {/* Total Bonus Store */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Bonus Store
                </span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-2xl sm:text-3xl text-amber-700">
                {formatRupiah(overallSummary.totalBonusStore)}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Sheet Bonus Store</span>
                <span className="text-amber-600 font-semibold">219 Penerima</span>
              </div>
            </div>

            {/* Potongan Minus Penjualan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Potongan Minus Penjualan
                </span>
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-2xl sm:text-3xl text-rose-600">
                {formatRupiah(overallSummary.totalNegative)}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                <span>Retur / Penyesuaian</span>
                <span className="text-rose-600 font-medium">Mengurangi Total</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section Breakdown per Tipe & Departemen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Breakdown per Tipe Insentif Penjualan */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Distribusi Akumulasi per Tipe Insentif
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {overallSummary.typeSummaries.length} Tipe Terdata
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {overallSummary.typeSummaries.map((typeStat) => {
                const percentage =
                  overallSummary.totalInsentif > 0
                    ? ((typeStat.total / overallSummary.totalInsentif) * 100).toFixed(1)
                    : '0';

                return (
                  <div
                    key={typeStat.type}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700 uppercase tracking-wide truncate max-w-[170px]">
                        {typeStat.type}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">{percentage}%</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="font-mono font-bold text-base text-slate-900">
                        {formatRupiah(typeStat.total)}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {typeStat.count.toLocaleString('id-ID')} tx
                      </div>
                    </div>

                    {typeStat.negativeTotal !== 0 && (
                      <div className="text-[11px] text-rose-600 font-mono pt-1 border-t border-slate-200 flex justify-between">
                        <span>Potongan minus:</span>
                        <span>{formatRupiah(typeStat.negativeTotal)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown per Departemen */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Ringkasan per Departemen</h3>
            </div>
            <p className="text-xs text-slate-500">
              Distribusi perolehan insentif dan jumlah personel sales:
            </p>

            <div className="space-y-3">
              {overallSummary.departmentSummaries.map((dept) => {
                const deptPercent =
                  overallSummary.totalInsentif > 0
                    ? ((dept.total / overallSummary.totalInsentif) * 100).toFixed(1)
                    : '0';

                return (
                  <div
                    key={dept.department}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs font-mono">
                        Dept: {dept.department}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {dept.employeeCount} sales • {deptPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold text-base text-slate-900">
                        {formatRupiah(dept.total)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {dept.count.toLocaleString('id-ID')} transaksi
                      </div>
                    </div>

                    {/* Simple progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(5, parseFloat(deptPercent)))}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabel Seluruh Insentif Sales */}
        <section
          aria-labelledby="sales-list-title"
          className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
        >
          {/* Controls Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 id="sales-list-title" className="text-lg font-bold text-slate-900">
                  Daftar Insentif Seluruh Sales ({filteredEmployees.length} Sales)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan insentif penjualan, bonus store gabungan, dan grand total. Klik tombol{' '}
                  <strong>"Detail"</strong> untuk membuka rincian transaksi Cell A:G.
                </p>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Total Ditampilkan: <strong className="text-slate-800">{filteredEmployees.length}</strong>{' '}
                / {employees.length}
              </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedMatchStatus('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedMatchStatus === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Sales ({employees.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedMatchStatus('matched')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedMatchStatus === 'matched'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                ✓ Cocok di Keduanya ({overallSummary.validationSummary.matchedNipCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedMatchStatus('bonus_only')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedMatchStatus === 'bonus_only'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                ⚠ Hanya di Bonus Store ({overallSummary.validationSummary.bonusStoreOnlyNips.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedMatchStatus('agustus_only')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedMatchStatus === 'agustus_only'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                ℹ Hanya di Agustus ({overallSummary.validationSummary.agustusOnlyNips.length})
              </button>
            </div>

            {/* Search, Filter & Sort bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIP atau Nama sales..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Departemen</option>
                  {availableDepts.map((d) => (
                    <option key={d} value={d}>
                      Departemen: {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="relative">
                <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="takehome_desc">Grand Total Tertinggi</option>
                  <option value="total_desc">Insentif Penjualan Tertinggi</option>
                  <option value="bonus_desc">Bonus Store Tertinggi</option>
                  <option value="name_asc">Nama Sales (A-Z)</option>
                  <option value="tx_desc">Transaksi Terbanyak</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDept('ALL');
                    setSelectedMatchStatus('ALL');
                    setSortBy('takehome_desc');
                  }}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">NIP</th>
                  <th className="py-3 px-3">Nama Sales</th>
                  <th className="py-3 px-3">Dept</th>
                  <th className="py-3 px-3 text-center">Tx</th>
                  <th className="py-3 px-3 text-right">Insentif Penjualan</th>
                  <th className="py-3 px-3 text-right bg-amber-50/40">Bonus Store</th>
                  <th className="py-3 px-3 text-right bg-indigo-50/50">Grand Total (Take Home)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp, index) => {
                  return (
                    <tr
                      key={emp.nip}
                      className={`hover:bg-indigo-50/50 transition-colors group ${
                        emp.isBonusStoreOnly ? 'bg-amber-50/25' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        {emp.nip}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{emp.nama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Password default: {emp.defaultPassword}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold text-[11px]">
                          {emp.departments.length > 0 && emp.departments[0] !== '-'
                            ? emp.departments.join(', ')
                            : '-'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {emp.transactionCount}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          {emp.isBonusStoreOnly ? '-' : formatRupiah(emp.totalInsentif)}
                        </div>
                        {emp.totalNegative !== 0 && (
                          <div className="text-[10px] text-rose-600 font-mono">
                            Minus: {formatRupiah(emp.totalNegative)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap bg-amber-50/40">
                        <div className="font-mono font-bold text-amber-800">
                          {emp.bonusStoreAmount > 0 ? formatRupiah(emp.bonusStoreAmount) : '-'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap bg-indigo-50/50">
                        <div className="font-mono font-black text-sm text-indigo-950">
                          {formatRupiah(emp.totalTakeHomePay)}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {emp.matchingStatus === 'matched' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            Cocok
                          </span>
                        )}
                        {emp.matchingStatus === 'bonus_only' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                            Bonus Only
                          </span>
                        )}
                        {emp.matchingStatus === 'agustus_only' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Agustus Only
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingEmployee(emp);
                              setInspectingTypeFilter(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Lihat seluruh rincian transaksi Cell A:G"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSlipGajiEmployee(emp)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Lihat Slip Gaji Resmi"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Tidak ditemukan data sales dengan kriteria pencarian "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Dashboard Administrator / Manager • Akumulasi Seluruh Sales (Sheet INSENTIF AGUSTUS +
            Bonus Store)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Grand Total: {formatRupiah(overallSummary.totalTakeHomePay)}</span>
            <span>•</span>
            <span>{overallSummary.totalEmployees} Orang Sales</span>
          </div>
        </div>
      </footer>

      {/* MODAL: DETAIL INSENTIF SALES TERPILIH */}
      {inspectingEmployee && (
        <div
          id="admin-inspect-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-200">
                    NIP: {inspectingEmployee.nip}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Dept: {inspectingEmployee.departments.join(', ') || '-'}
                  </span>
                  {inspectingEmployee.matchingStatus === 'matched' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ✓ Matched
                    </span>
                  )}
                  {inspectingEmployee.matchingStatus === 'bonus_only' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      ⚠ Bonus Store Only
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Rincian Insentif: {inspectingEmployee.nama}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSlipGajiEmployee(inspectingEmployee)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Slip Gaji</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingEmployee(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Grand Total banner for inspected sales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <div>
                  <span className="text-slate-400 text-xs font-medium block">
                    Insentif Penjualan (Agustus):
                  </span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {formatRupiah(inspectingEmployee.totalInsentif)}
                  </span>
                </div>
                <div>
                  <span className="text-amber-700 text-xs font-semibold block">
                    Bonus Store (Sheet Bonus Store):
                  </span>
                  <span className="text-lg font-bold font-mono text-amber-800">
                    {formatRupiah(inspectingEmployee.bonusStoreAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-700 text-xs font-bold uppercase block">
                    Total Diterima (Take Home Pay):
                  </span>
                  <span className="text-xl font-black font-mono text-indigo-950">
                    {formatRupiah(inspectingEmployee.totalTakeHomePay)}
                  </span>
                </div>
              </div>

              {/* Summary Cards per tipe insentif untuk sales ini */}
              <SummaryCards
                typeSummaries={inspectingEmployee.typeSummaries}
                totalInsentif={inspectingEmployee.totalInsentif}
                selectedType={inspectingTypeFilter}
                onSelectType={setInspectingTypeFilter}
              />

              {/* Detail Table transaksi Cell A:G */}
              <DetailTable
                records={inspectingEmployee.records}
                selectedType={inspectingTypeFilter}
                onSelectType={setInspectingTypeFilter}
                bonusStoreAmount={inspectingEmployee.bonusStoreAmount}
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
              <div>
                Total {inspectingEmployee.transactionCount} baris transaksi untuk NIP{' '}
                {inspectingEmployee.nip}
              </div>
              <button
                type="button"
                onClick={() => setInspectingEmployee(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Gaji Modal */}
      {slipGajiEmployee && (
        <SlipGajiModal
          employee={slipGajiEmployee}
          onClose={() => setSlipGajiEmployee(null)}
        />
      )}
    </div>
  );
};
