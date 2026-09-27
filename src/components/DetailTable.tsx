import React, { useState, useMemo, useCallback } from 'react';
import { IncentiveRecord } from '../types';
import { formatRupiah, formatNumber } from '../utils/numberFormat';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Store,
  Copy,
  Check,
  LayoutGrid,
  Table as TableIcon,
  BarChart3,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Eye,
  Info,
  Layers,
  Tag,
  Building2,
  Receipt,
  RotateCcw,
} from 'lucide-react';

interface DetailTableProps {
  records: IncentiveRecord[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  bonusStoreAmount?: number;
}

type ViewMode = 'table' | 'cards' | 'analytics';
type QuickValueFilter = 'all' | 'positive' | 'negative' | 'high_value' | 'has_bonus';

export const DetailTable: React.FC<DetailTableProps> = ({
  records,
  selectedType,
  onSelectType,
  bonusStoreAmount,
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'receipt' | 'sku' | 'dept' | 'type'>('all');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedMatchStatus, setSelectedMatchStatus] = useState<
    'ALL' | 'matched' | 'bonus_only' | 'agustus_only'
  >('ALL');
  const [quickValueFilter, setQuickValueFilter] = useState<QuickValueFilter>('all');
  const [sortField, setSortField] = useState<'jumlah' | 'receipt' | 'sku' | 'type' | 'bonus' | 'dept'>('jumlah');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Expanded row ID for accordion detail
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Multi-select row IDs
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Copy feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText((curr) => (curr === label ? null : curr));
    }, 2000);
  }, []);

  // Distinct departments
  const availableDepts = useMemo(() => {
    const depts = new Set<string>();
    records.forEach((r) => {
      if (r.departement && r.departement !== '-') depts.add(r.departement);
    });
    return Array.from(depts).sort();
  }, [records]);

  // Distinct incentive types with counts
  const distinctTypesWithCounts = useMemo(() => {
    const counts = new Map<string, { count: number; total: number }>();
    records.forEach((r) => {
      const t = r.tipeInsentif || '(Tanpa Tipe)';
      const existing = counts.get(t) || { count: 0, total: 0 };
      existing.count += 1;
      existing.total += r.jumlahInsentif;
      counts.set(t, existing);
    });
    return Array.from(counts.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      total: data.total,
    }));
  }, [records]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let list = [...records];

    // Filter by summary card selection
    if (selectedType) {
      list = list.filter((r) => (r.tipeInsentif || '(Tanpa Tipe)') === selectedType);
    }

    // Filter by department
    if (selectedDept !== 'ALL') {
      list = list.filter((r) => r.departement === selectedDept);
    }

    // Filter by matching status
    if (selectedMatchStatus !== 'ALL') {
      list = list.filter((r) => r.matchingStatus === selectedMatchStatus);
    }

    // Quick value filters
    if (quickValueFilter === 'positive') {
      list = list.filter((r) => r.jumlahInsentif > 0);
    } else if (quickValueFilter === 'negative') {
      list = list.filter((r) => r.jumlahInsentif < 0);
    } else if (quickValueFilter === 'high_value') {
      list = list.filter((r) => r.jumlahInsentif >= 50000);
    } else if (quickValueFilter === 'has_bonus') {
      list = list.filter((r) => r.bonusStoreAmount && r.bonusStoreAmount > 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        if (searchField === 'receipt') return r.noReceipt.toLowerCase().includes(q);
        if (searchField === 'sku') return r.sku.toLowerCase().includes(q);
        if (searchField === 'dept') return r.departement.toLowerCase().includes(q);
        if (searchField === 'type') return r.tipeInsentif.toLowerCase().includes(q);
        return (
          r.nip.toLowerCase().includes(q) ||
          r.nama.toLowerCase().includes(q) ||
          r.noReceipt.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.tipeInsentif.toLowerCase().includes(q) ||
          r.departement.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      let comp = 0;
      if (sortField === 'jumlah') {
        comp = a.jumlahInsentif - b.jumlahInsentif;
      } else if (sortField === 'bonus') {
        comp = (a.bonusStoreAmount || 0) - (b.bonusStoreAmount || 0);
      } else if (sortField === 'receipt') {
        comp = a.noReceipt.localeCompare(b.noReceipt);
      } else if (sortField === 'sku') {
        comp = a.sku.localeCompare(b.sku);
      } else if (sortField === 'type') {
        comp = a.tipeInsentif.localeCompare(b.tipeInsentif);
      } else if (sortField === 'dept') {
        comp = a.departement.localeCompare(b.departement);
      }
      return sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [
    records,
    selectedType,
    selectedDept,
    selectedMatchStatus,
    quickValueFilter,
    searchQuery,
    searchField,
    sortField,
    sortOrder,
  ]);

  // Calculations for filtered set
  const stats = useMemo(() => {
    let totalInsentif = 0;
    let totalBonus = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let negativeTotal = 0;
    let hasBonusCount = 0;

    filteredRecords.forEach((r) => {
      totalInsentif += r.jumlahInsentif;
      if (r.bonusStoreAmount && r.bonusStoreAmount > 0) {
        totalBonus += r.bonusStoreAmount;
        hasBonusCount += 1;
      }
      if (r.jumlahInsentif > 0) positiveCount += 1;
      if (r.jumlahInsentif < 0) {
        negativeCount += 1;
        negativeTotal += r.jumlahInsentif;
      }
    });

    return {
      count: filteredRecords.length,
      totalInsentif,
      totalBonus,
      totalNet: totalInsentif + totalBonus,
      positiveCount,
      negativeCount,
      negativeTotal,
      hasBonusCount,
      avgPerTx: filteredRecords.length > 0 ? Math.round(totalInsentif / filteredRecords.length) : 0,
    };
  }, [filteredRecords]);

  // Selected items calculation
  const selectedStats = useMemo(() => {
    if (selectedRowIds.size === 0) return null;
    let totalSelectedInsentif = 0;
    let totalSelectedBonus = 0;
    records.forEach((r) => {
      if (selectedRowIds.has(r.id)) {
        totalSelectedInsentif += r.jumlahInsentif;
        totalSelectedBonus += r.bonusStoreAmount || 0;
      }
    });
    return {
      count: selectedRowIds.size,
      totalInsentif: totalSelectedInsentif,
      totalBonus: totalSelectedBonus,
      totalTakeHome: totalSelectedInsentif + totalSelectedBonus,
    };
  }, [selectedRowIds, records]);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const effectivePageSize = pageSize === 0 ? Math.max(1, totalItems) : pageSize;
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    if (pageSize === 0) return filteredRecords;
    const start = (activePage - 1) * effectivePageSize;
    return filteredRecords.slice(start, start + effectivePageSize);
  }, [filteredRecords, activePage, effectivePageSize, pageSize]);

  // Toggle selection
  const toggleSelectAllPage = () => {
    const next = new Set(selectedRowIds);
    const allPageSelected = paginatedRecords.every((r) => next.has(r.id));
    if (allPageSelected) {
      paginatedRecords.forEach((r) => next.delete(r.id));
    } else {
      paginatedRecords.forEach((r) => next.add(r.id));
    }
    setSelectedRowIds(next);
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRowIds(next);
  };

  const handleSort = (field: 'jumlah' | 'receipt' | 'sku' | 'type' | 'bonus' | 'dept') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = (onlySelected = false) => {
    const listToExport = onlySelected
      ? records.filter((r) => selectedRowIds.has(r.id))
      : filteredRecords;

    const headers = [
      'NIP',
      'Nama Sales',
      'Tipe Insentif',
      'Departemen',
      'No Receipt',
      'SKU',
      'Jumlah Insentif (Agustus)',
      'Bonus Store (Rp)',
      'Total Baris',
      'Status Pencocokan',
    ];

    const rows = listToExport.map((r) => [
      `"${r.nip}"`,
      `"${r.nama.replace(/"/g, '""')}"`,
      `"${r.tipeInsentif.replace(/"/g, '""')}"`,
      `"${r.departement}"`,
      `"${r.noReceipt}"`,
      `"${r.sku}"`,
      r.jumlahInsentif,
      r.bonusStoreAmount || 0,
      r.jumlahInsentif + (r.bonusStoreAmount || 0),
      `"${r.matchingStatus}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rincian_insentif_${records[0]?.nip || 'sales'}_${onlySelected ? 'pilihan' : 'lengkap'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    onSelectType(null);
    setSelectedDept('ALL');
    setSelectedMatchStatus('ALL');
    setQuickValueFilter('all');
    setSearchQuery('');
    setSearchField('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedType !== null ||
    selectedDept !== 'ALL' ||
    selectedMatchStatus !== 'ALL' ||
    quickValueFilter !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <section
      id="detail-incentive-section"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
    >
      {/* 1. SECTION HEADER WITH CONTROLS & VIEW TOGGLE */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-200">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Rincian Transaksi Insentif & Bonus
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {stats.count} Transaksi
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cell A:G sheet <span className="font-semibold text-slate-700">INSENTIF AGUSTUS</span> + Kolom <span className="font-semibold text-amber-700">Bonus Store</span>
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions: View Mode Switcher & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Tabs */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartu Interaktif</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('analytics')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'analytics'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analisis Visual</span>
              </button>
            </div>

            {/* CSV Export Button */}
            <button
              id="btn-export-csv"
              type="button"
              onClick={() => handleExportCSV(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ekspor CSV ({stats.count})</span>
            </button>
          </div>
        </div>

        {/* 2. INTERACTIVE LIVE STATS TILES (CLICKABLE QUICK FILTERS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Tile 1: Total Insentif Penjualan */}
          <div
            onClick={() => {
              if (quickValueFilter === 'positive') setQuickValueFilter('all');
              else setQuickValueFilter('positive');
              setCurrentPage(1);
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer select-none group ${
              quickValueFilter === 'positive'
                ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium group-hover:text-emerald-700 transition-colors">Insentif Penjualan</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-1">
              {formatRupiah(stats.totalInsentif)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{stats.positiveCount} tx positif</span>
              {quickValueFilter === 'positive' && (
                <span className="text-emerald-700 font-bold">Filter Aktif</span>
              )}
            </div>
          </div>

          {/* Tile 2: Bonus Store */}
          <div
            onClick={() => {
              if (quickValueFilter === 'has_bonus') setQuickValueFilter('all');
              else setQuickValueFilter('has_bonus');
              setCurrentPage(1);
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer select-none group ${
              quickValueFilter === 'has_bonus'
                ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium group-hover:text-amber-800 transition-colors">Bonus Store</span>
              <Store className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-amber-800 mt-1">
              {formatRupiah(stats.totalBonus)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{stats.hasBonusCount} tx berbonus</span>
              {quickValueFilter === 'has_bonus' && (
                <span className="text-amber-800 font-bold">Filter Aktif</span>
              )}
            </div>
          </div>

          {/* Tile 3: Net Subtotal Filtered */}
          <div
            onClick={() => {
              setQuickValueFilter('all');
              setCurrentPage(1);
            }}
            className="p-3 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 hover:border-indigo-400 transition-all cursor-pointer select-none"
          >
            <div className="flex items-center justify-between text-[11px] text-indigo-700">
              <span className="font-semibold">Subtotal Filter Saat Ini</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-indigo-950 mt-1">
              {formatRupiah(stats.totalNet)}
            </div>
            <div className="text-[10px] text-indigo-600/80 mt-0.5 flex items-center justify-between">
              <span>Rata-rata: {formatRupiah(stats.avgPerTx)}/tx</span>
              <span>Total Dihitung</span>
            </div>
          </div>

          {/* Tile 4: Transaksi Minus / Retur */}
          <div
            onClick={() => {
              if (quickValueFilter === 'negative') setQuickValueFilter('all');
              else setQuickValueFilter('negative');
              setCurrentPage(1);
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer select-none group ${
              quickValueFilter === 'negative'
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20'
                : stats.negativeCount > 0
                ? 'bg-white border-rose-200 hover:border-rose-300 hover:shadow-2xs'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium group-hover:text-rose-700 transition-colors">Retur / Potongan Minus</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div
              className={`text-base sm:text-lg font-bold font-mono mt-1 ${
                stats.negativeTotal < 0 ? 'text-rose-600' : 'text-slate-400'
              }`}
            >
              {stats.negativeTotal !== 0 ? formatRupiah(stats.negativeTotal) : 'Rp 0'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{stats.negativeCount} tx potongan</span>
              {quickValueFilter === 'negative' && (
                <span className="text-rose-600 font-bold">Filter Aktif</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. SEARCH & ADVANCED FILTER CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          {/* Search Box with Field Selector */}
          <div className="sm:col-span-6 lg:col-span-5 flex rounded-xl shadow-2xs border border-slate-200/90 overflow-hidden bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
            <div className="pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari receipt, SKU, tipe, nama..."
              className="w-full pl-2.5 pr-2 py-2 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pr-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as any)}
              className="border-l border-slate-200 px-2 py-2 bg-slate-100/70 text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kolom</option>
              <option value="receipt">No. Receipt</option>
              <option value="sku">SKU</option>
              <option value="type">Tipe Insentif</option>
              <option value="dept">Departemen</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-3 lg:col-span-3">
            <select
              id="dept-filter-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full py-2 px-3 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Semua Departemen ({availableDepts.length})</option>
              {availableDepts.map((d) => (
                <option key={d} value={d}>
                  Departemen {d}
                </option>
              ))}
            </select>
          </div>

          {/* Match Status Filter */}
          <div className="sm:col-span-3 lg:col-span-4">
            <select
              id="match-status-filter"
              value={selectedMatchStatus}
              onChange={(e) => {
                setSelectedMatchStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="block w-full py-2 px-3 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Semua Status Pencocokan Sheet</option>
              <option value="matched">✓ Cocok di Keduanya (Matched)</option>
              <option value="bonus_only">⚠ Hanya di Bonus Store</option>
              <option value="agustus_only">ℹ Hanya di INSENTIF AGUSTUS</option>
            </select>
          </div>
        </div>

        {/* 4. QUICK FILTER PILLS & ACTIVE FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Tipe Insentif:
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectType(null);
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedType === null
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({records.length})
          </button>
          {distinctTypesWithCounts.map(({ type, count }) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelectType(isActive ? null : type);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{type}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Quick Value Filter Pills */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
            <button
              type="button"
              onClick={() => {
                setQuickValueFilter(quickValueFilter === 'high_value' ? 'all' : 'high_value');
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                quickValueFilter === 'high_value'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ★ &ge; Rp 50.000
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickValueFilter(quickValueFilter === 'negative' ? 'all' : 'negative');
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                quickValueFilter === 'negative'
                  ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ⚠ Minus / Retur
            </button>
          </div>

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 ml-auto transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. MULTI-SELECT FLOATING ACTION BAR (When rows selected) */}
      {selectedStats && (
        <div className="bg-indigo-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-md bg-indigo-800 text-indigo-200 font-mono font-bold text-xs">
              {selectedStats.count} Baris Dipilih
            </span>
            <div className="text-xs space-x-3">
              <span>
                Insentif Penjualan:{' '}
                <strong className="text-emerald-300 font-mono">
                  {formatRupiah(selectedStats.totalInsentif)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Bonus Store:{' '}
                <strong className="text-amber-300 font-mono">
                  {formatRupiah(selectedStats.totalBonus)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Total Terpilih:{' '}
                <strong className="text-white font-mono text-sm">
                  {formatRupiah(selectedStats.totalTakeHome)}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCSV(true)}
              className="px-3 py-1 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Terpilih CSV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const summaryText = `Ringkasan ${selectedStats.count} Transaksi Insentif:\n- Insentif: ${formatRupiah(
                  selectedStats.totalInsentif
                )}\n- Bonus Store: ${formatRupiah(
                  selectedStats.totalBonus
                )}\n- Total: ${formatRupiah(selectedStats.totalTakeHome)}`;
                handleCopy(summaryText, 'ringkasan_terpilih');
              }}
              className="px-3 py-1 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedText === 'ringkasan_terpilih' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Ringkasan</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelectedRowIds(new Set())}
              className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800 cursor-pointer"
              title="Batal pilih semua"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. MAIN CONTENT AREA BASED ON VIEW MODE */}

      {/* VIEW MODE 1: DENSE INTERACTIVE TABLE */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-700 font-bold uppercase tracking-wider select-none sticky top-0 z-10">
              <tr>
                {/* Select All Checkbox */}
                <th scope="col" className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedRecords.length > 0 &&
                      paginatedRecords.every((r) => selectedRowIds.has(r.id))
                    }
                    onChange={toggleSelectAllPage}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Pilih semua pada halaman ini"
                  />
                </th>
                <th scope="col" className="px-2 py-3 w-10 text-center text-slate-400">
                  #
                </th>
                <th scope="col" className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <span>NIP</span>
                    <span className="text-slate-400 font-normal">/ Sales</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortField === 'type' ? 'text-indigo-700 bg-indigo-50/60' : ''
                  }`}
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-1">
                    <span>Tipe Insentif</span>
                    {sortField === 'type' ? (
                      sortOrder === 'desc' ? (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 text-center w-16 cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortField === 'dept' ? 'text-indigo-700 bg-indigo-50/60' : ''
                  }`}
                  onClick={() => handleSort('dept')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Dept</span>
                    {sortField === 'dept' && (
                      sortOrder === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortField === 'receipt' ? 'text-indigo-700 bg-indigo-50/60' : ''
                  }`}
                  onClick={() => handleSort('receipt')}
                >
                  <div className="flex items-center gap-1">
                    <span>No. Receipt</span>
                    {sortField === 'receipt' ? (
                      sortOrder === 'desc' ? (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortField === 'sku' ? 'text-indigo-700 bg-indigo-50/60' : ''
                  }`}
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center gap-1">
                    <span>SKU</span>
                    {sortField === 'sku' ? (
                      sortOrder === 'desc' ? (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 text-right cursor-pointer hover:bg-slate-100/80 transition-colors ${
                    sortField === 'jumlah' ? 'text-indigo-700 bg-indigo-50/60' : ''
                  }`}
                  onClick={() => handleSort('jumlah')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Insentif Penjualan</span>
                    {sortField === 'jumlah' ? (
                      sortOrder === 'desc' ? (
                        <ArrowDown className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-indigo-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className={`px-3 py-3 text-right cursor-pointer hover:bg-amber-100/60 transition-colors bg-amber-50/50 ${
                    sortField === 'bonus' ? 'text-amber-900 bg-amber-100/80' : ''
                  }`}
                  onClick={() => handleSort('bonus')}
                >
                  <div className="flex items-center justify-end gap-1 text-amber-900 font-bold">
                    <Store className="w-3 h-3 text-amber-600" />
                    <span>Bonus Store</span>
                    {sortField === 'bonus' ? (
                      sortOrder === 'desc' ? (
                        <ArrowDown className="w-3 h-3 text-amber-700" />
                      ) : (
                        <ArrowUp className="w-3 h-3 text-amber-700" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-amber-600" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 py-3 text-center w-24">
                  Status
                </th>
                <th scope="col" className="px-2 py-3 w-10 text-center text-slate-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Tidak ada data transaksi yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Coba sesuaikan kata kunci pencarian, ubah filter departemen, atau klik tombol di bawah untuk menyetel ulang filter.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Semua Filter</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r, index) => {
                  const globalIndex = (activePage - 1) * effectivePageSize + index + 1;
                  const isNegative = r.jumlahInsentif < 0;
                  const isExpanded = expandedRowId === r.id;
                  const isSelected = selectedRowIds.has(r.id);

                  return (
                    <React.Fragment key={r.id || `rec-${index}`}>
                      <tr
                        onClick={() => setExpandedRowId(isExpanded ? null : r.id)}
                        className={`transition-colors cursor-pointer select-none group ${
                          isSelected
                            ? 'bg-indigo-50/80 hover:bg-indigo-100/80'
                            : isExpanded
                            ? 'bg-slate-50'
                            : r.isBonusStoreOnly
                            ? 'bg-amber-50/30 hover:bg-amber-50/60'
                            : isNegative
                            ? 'bg-rose-50/30 hover:bg-rose-50/60'
                            : index % 2 === 1
                            ? 'bg-slate-50/40 hover:bg-slate-100/70'
                            : 'bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td
                          className="px-3 py-2.5 text-center"
                          onClick={(e) => toggleSelectRow(r.id, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* Row Index */}
                        <td className="px-2 py-2.5 text-center text-slate-400 font-mono text-[11px]">
                          {globalIndex}
                        </td>

                        {/* NIP / Sales */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 text-xs">{r.nip}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{r.nama}</div>
                        </td>

                        {/* Tipe Insentif with Click-to-filter */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectType(r.tipeInsentif);
                            }}
                            title={`Filter tipe: ${r.tipeInsentif}`}
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                              r.isBonusStoreOnly
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : r.tipeInsentif === '(Tanpa Tipe)' || r.tipeInsentif === '1'
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50'
                            }`}
                          >
                            {r.tipeInsentif}
                          </button>
                        </td>

                        {/* Departemen with Click-to-filter */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (r.departement && r.departement !== '-') {
                                setSelectedDept(r.departement);
                              }
                            }}
                            title="Klik untuk filter departemen ini"
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {r.departement || '-'}
                          </button>
                        </td>

                        {/* No Receipt with Quick Copy */}
                        <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{r.noReceipt}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(r.noReceipt, `receipt-${r.id}`);
                              }}
                              title="Salin No. Receipt"
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer"
                            >
                              {copiedText === `receipt-${r.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* SKU with Quick Copy */}
                        <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{r.sku}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(r.sku, `sku-${r.id}`);
                              }}
                              title="Salin SKU"
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer"
                            >
                              {copiedText === `sku-${r.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Insentif Penjualan */}
                        <td
                          className={`px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap ${
                            isNegative
                              ? 'text-rose-600'
                              : r.jumlahInsentif > 0
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {r.isBonusStoreOnly ? '-' : formatRupiah(r.jumlahInsentif)}
                        </td>

                        {/* Bonus Store */}
                        <td className="px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap bg-amber-50/40 text-amber-900">
                          {r.bonusStoreAmount && r.bonusStoreAmount > 0
                            ? formatRupiah(r.bonusStoreAmount)
                            : '-'}
                        </td>

                        {/* Matching Status */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {r.matchingStatus === 'matched' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                              Cocok
                            </span>
                          )}
                          {r.matchingStatus === 'bonus_only' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                              Bonus Only
                            </span>
                          )}
                          {r.matchingStatus === 'agustus_only' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Agustus
                            </span>
                          )}
                        </td>

                        {/* Expand Chevron Icon */}
                        <td className="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            aria-label="Buka rincian baris"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* EXPANDABLE ROW ACCORDION DRAWER */}
                      {isExpanded && (
                        <tr className="bg-gradient-to-r from-indigo-50/50 via-slate-50 to-white border-b border-indigo-100">
                          <td colSpan={11} className="p-4 sm:p-5">
                            <div className="bg-white rounded-xl border border-indigo-200/80 p-4 shadow-sm space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                                    <Receipt className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                      <span>Rincian Transaksi: {r.noReceipt}</span>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                        ID #{globalIndex}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Atas nama: <strong>{r.nama}</strong> ({r.nip})
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(r.noReceipt, `expanded-receipt-${r.id}`)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    {copiedText === `expanded-receipt-${r.id}` ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Tersalin!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin No. Receipt</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery(r.noReceipt);
                                      setSearchField('receipt');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Search className="w-3.5 h-3.5" />
                                    <span>Cari Transaksi Serupa</span>
                                  </button>
                                </div>
                              </div>

                              {/* Key Value Details Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Informasi Produk & Unit
                                  </span>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">SKU Barang:</span>
                                    <span className="font-mono font-bold text-slate-800">{r.sku}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Departemen:</span>
                                    <span className="font-semibold text-slate-800">
                                      Dept {r.departement || '-'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Tipe Insentif:</span>
                                    <span className="font-semibold text-indigo-700">{r.tipeInsentif}</span>
                                  </div>
                                </div>

                                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Rincian Nilai Finansial
                                  </span>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Insentif Penjualan:</span>
                                    <span className="font-mono font-bold text-slate-900">
                                      {r.isBonusStoreOnly ? 'Rp 0' : formatRupiah(r.jumlahInsentif)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Bonus Store:</span>
                                    <span className="font-mono font-bold text-amber-800">
                                      {r.bonusStoreAmount ? formatRupiah(r.bonusStoreAmount) : 'Rp 0'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-slate-200">
                                    <span className="font-semibold text-slate-700">Total Transaksi Ini:</span>
                                    <span className="font-mono font-extrabold text-indigo-900 text-sm">
                                      {formatRupiah(r.jumlahInsentif + (r.bonusStoreAmount || 0))}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Sumber & Validasi Data
                                  </span>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status Pencocokan:</span>
                                    <span className="font-semibold text-slate-800">
                                      {r.matchingStatus === 'matched'
                                        ? 'Cocok di Kedua Sheet'
                                        : r.matchingStatus === 'bonus_only'
                                        ? 'Hanya ada di Bonus Store'
                                        : 'Hanya ada di Sheet Agustus'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Sheet Asal:</span>
                                    <span className="font-medium text-slate-700">
                                      {r.isBonusStoreOnly ? 'Bonus Store' : 'INSENTIF AGUSTUS'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1">
                                    <span className="text-slate-500">Aksi Cepat:</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSearchQuery(r.sku);
                                        setSearchField('sku');
                                      }}
                                      className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
                                    >
                                      Filter SKU "{r.sku}"
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE CARDS GRID */}
      {viewMode === 'cards' && (
        <div className="p-4 sm:p-6 bg-slate-50/60">
          {paginatedRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Tidak ada kartu transaksi yang cocok</p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedRecords.map((r, index) => {
                const globalIndex = (activePage - 1) * effectivePageSize + index + 1;
                const isNegative = r.jumlahInsentif < 0;
                const isSelected = selectedRowIds.has(r.id);

                return (
                  <div
                    key={r.id}
                    onClick={(e) => toggleSelectRow(r.id, e)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none group relative ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          #{globalIndex}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {r.tipeInsentif}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 font-medium">
                          Dept {r.departement || '-'}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Receipt & SKU */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">No. Receipt:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                          <span>{r.noReceipt}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(r.noReceipt, `card-receipt-${r.id}`);
                            }}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                            title="Salin No Receipt"
                          >
                            {copiedText === `card-receipt-${r.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">SKU:</span>
                        <span className="font-mono text-slate-700">{r.sku}</span>
                      </div>
                    </div>

                    {/* Financial Values */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Insentif Penjualan</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            isNegative ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {r.isBonusStoreOnly ? '-' : formatRupiah(r.jumlahInsentif)}
                        </span>
                      </div>
                      {r.bonusStoreAmount && r.bonusStoreAmount > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-amber-700 block font-medium">Bonus Store</span>
                          <span className="font-mono font-bold text-sm text-amber-800">
                            {formatRupiah(r.bonusStoreAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: VISUAL BREAKDOWN & ANALYTICS */}
      {viewMode === 'analytics' && (
        <div className="p-4 sm:p-6 bg-slate-50/50 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analytics Box 1: Breakdown by Incentive Type */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Distribusi per Tipe Insentif
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {distinctTypesWithCounts.length} tipe terdata
                </span>
              </div>

              <div className="space-y-3">
                {distinctTypesWithCounts.map(({ type, count, total }) => {
                  const pct =
                    stats.totalInsentif > 0
                      ? Math.max(0, Math.round((total / stats.totalInsentif) * 100))
                      : 0;

                  return (
                    <div
                      key={type}
                      onClick={() => onSelectType(selectedType === type ? null : type)}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{type}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-indigo-950">
                            {formatRupiah(total)}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            ({count} tx • {pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analytics Box 2: Breakdown by Department */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Distribusi per Departemen
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {availableDepts.length} departemen aktif
                </span>
              </div>

              <div className="space-y-3">
                {availableDepts.map((dept) => {
                  const deptRecords = filteredRecords.filter((r) => r.departement === dept);
                  const deptTotal = deptRecords.reduce((sum, r) => sum + r.jumlahInsentif, 0);
                  const pct =
                    stats.totalInsentif > 0
                      ? Math.max(0, Math.round((deptTotal / stats.totalInsentif) * 100))
                      : 0;

                  return (
                    <div
                      key={dept}
                      onClick={() => setSelectedDept(selectedDept === dept ? 'ALL' : dept)}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">Departemen {dept}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-800">
                            {formatRupiah(deptTotal)}
                          </span>
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            ({deptRecords.length} tx • {pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TABLE FOOTER WITH INTERACTIVE PAGINATION & SUMMARY */}
      <div className="p-4 border-t border-slate-200/90 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500">
            Menampilkan{' '}
            <strong className="text-slate-800">
              {totalItems === 0 ? 0 : (activePage - 1) * effectivePageSize + 1}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-800">
              {pageSize === 0 ? totalItems : Math.min(activePage * effectivePageSize, totalItems)}
            </strong>{' '}
            dari <strong className="text-slate-800">{totalItems}</strong> baris data
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">| Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
              <option value={0}>Semua Baris</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="text-right sm:pr-2">
            <span className="text-slate-400 text-[11px] block">Subtotal Insentif Filtered:</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {formatRupiah(stats.totalNet)}
            </span>
          </div>

          {pageSize !== 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={activePage <= 1}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white cursor-pointer font-mono text-[11px]"
                title="Halaman Pertama"
              >
                &laquo;
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={activePage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-1 font-semibold text-slate-700 font-mono text-xs">
                {activePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={activePage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={activePage >= totalPages}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white cursor-pointer font-mono text-[11px]"
                title="Halaman Terakhir"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
