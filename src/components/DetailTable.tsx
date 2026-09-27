import React, { useState, useMemo } from 'react';
import { IncentiveRecord } from '../types';
import { formatRupiah } from '../utils/numberFormat';
import {
  Search,
  ArrowUpDown,
  Download,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Store,
} from 'lucide-react';

interface DetailTableProps {
  records: IncentiveRecord[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  bonusStoreAmount?: number;
}

export const DetailTable: React.FC<DetailTableProps> = ({
  records,
  selectedType,
  onSelectType,
  bonusStoreAmount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedMatchStatus, setSelectedMatchStatus] = useState<'ALL' | 'matched' | 'bonus_only' | 'agustus_only'>('ALL');
  const [sortField, setSortField] = useState<'jumlah' | 'receipt' | 'sku' | 'type' | 'bonus'>('jumlah');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Available departments
  const availableDepts = useMemo(() => {
    const depts = new Set<string>();
    records.forEach((r) => {
      if (r.departement && r.departement !== '-') depts.add(r.departement);
    });
    return Array.from(depts).sort();
  }, [records]);

  // Check if dataset has any bonus store records
  const hasBonusStoreData = useMemo(() => {
    return records.some((r) => r.bonusStoreAmount !== undefined && r.bonusStoreAmount > 0);
  }, [records]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let list = [...records];

    // Filter by summary card selection
    if (selectedType) {
      list = list.filter((r) => (r.tipeInsentif || '(Tanpa Tipe)') === selectedType);
    }

    // Filter by department dropdown
    if (selectedDept !== 'ALL') {
      list = list.filter((r) => r.departement === selectedDept);
    }

    // Filter by matching status
    if (selectedMatchStatus !== 'ALL') {
      list = list.filter((r) => r.matchingStatus === selectedMatchStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.nip.toLowerCase().includes(q) ||
          r.nama.toLowerCase().includes(q) ||
          r.noReceipt.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          r.tipeInsentif.toLowerCase().includes(q) ||
          r.departement.toLowerCase().includes(q)
      );
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
      }
      return sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [records, selectedType, selectedDept, selectedMatchStatus, searchQuery, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, activePage, pageSize]);

  const filteredTotal = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.jumlahInsentif, 0);
  }, [filteredRecords]);

  const handleSort = (field: 'jumlah' | 'receipt' | 'sku' | 'type' | 'bonus') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'NIP',
      'Nama Sales',
      'Tipe Insentif',
      'Departement',
      'No Receipt',
      'SKU',
      'Jumlah Insentif (Agustus)',
      'Bonus Store (Rp)',
      'Status Pencocokan',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.nip}"`,
      `"${r.nama.replace(/"/g, '""')}"`,
      `"${r.tipeInsentif.replace(/"/g, '""')}"`,
      `"${r.departement}"`,
      `"${r.noReceipt}"`,
      `"${r.sku}"`,
      r.jumlahInsentif,
      r.bonusStoreAmount || 0,
      `"${r.matchingStatus}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi_insentif_${records[0]?.nip || 'detail'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="detail-incentive-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Detail Transaksi Insentif & Kolom Bonus Store
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan data transaksi penjualan (Cell A:G) lengkap dengan kolom tambahan dari sheet{' '}
              <strong className="text-amber-700">"Bonus Store"</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor CSV ({filteredRecords.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search Box */}
          <div className="sm:col-span-4 lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
              placeholder="Cari NIP, nama, receipt, SKU, tipe..."
              className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-4 lg:col-span-4">
            <select
              id="dept-filter-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="ALL">Semua Departemen ({availableDepts.length})</option>
              {availableDepts.map((d) => (
                <option key={d} value={d}>
                  Dept {d}
                </option>
              ))}
            </select>
          </div>

          {/* Match Status Filter */}
          <div className="sm:col-span-4 lg:col-span-4">
            <select
              id="match-status-filter"
              value={selectedMatchStatus}
              onChange={(e) => {
                setSelectedMatchStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="block w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
            >
              <option value="ALL">Semua Status Pencocokan</option>
              <option value="matched">✓ Cocok di Keduanya (Matched)</option>
              <option value="bonus_only">⚠ Hanya di Bonus Store</option>
              <option value="agustus_only">ℹ Hanya di INSENTIF AGUSTUS</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedType || selectedDept !== 'ALL' || selectedMatchStatus !== 'ALL' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter Aktif:
            </span>
            {selectedType && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-medium">
                Tipe: {selectedType}
                <button
                  type="button"
                  onClick={() => onSelectType(null)}
                  className="hover:text-indigo-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedDept !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                Dept: {selectedDept}
                <button
                  type="button"
                  onClick={() => setSelectedDept('ALL')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedMatchStatus !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                Status: {selectedMatchStatus}
                <button
                  type="button"
                  onClick={() => setSelectedMatchStatus('ALL')}
                  className="hover:text-amber-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                Pencarian: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                onSelectType(null);
                setSelectedDept('ALL');
                setSelectedMatchStatus('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-3 py-3 w-10 text-center text-slate-400">
                #
              </th>
              <th scope="col" className="px-3 py-3">
                <div className="flex items-center gap-1">
                  <span>NIP</span>
                  <span className="text-slate-400 font-normal">/ Nama</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 select-none"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  <span>Tipe Insentif</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-center w-16">
                Dept
              </th>
              <th
                scope="col"
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 select-none"
                onClick={() => handleSort('receipt')}
              >
                <div className="flex items-center gap-1">
                  <span>No. Receipt</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 select-none"
                onClick={() => handleSort('sku')}
              >
                <div className="flex items-center gap-1">
                  <span>SKU</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right cursor-pointer hover:text-indigo-600 select-none"
                onClick={() => handleSort('jumlah')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Insentif Penjualan</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-right cursor-pointer hover:text-indigo-600 select-none bg-amber-50/60"
                onClick={() => handleSort('bonus')}
              >
                <div className="flex items-center justify-end gap-1 text-amber-900 font-bold">
                  <Store className="w-3 h-3 text-amber-600" />
                  <span>Bonus Store (Rp)</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-600" />
                </div>
              </th>
              <th scope="col" className="px-3 py-3 text-center w-28">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Tidak ada data yang cocok</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba sesuaikan kata kunci pencarian atau filter tipe insentif Anda.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r, index) => {
                const globalIndex = (activePage - 1) * pageSize + index + 1;
                const isNegative = r.jumlahInsentif < 0;

                return (
                  <tr
                    key={r.id || `rec-${index}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      r.isBonusStoreOnly
                        ? 'bg-amber-50/30'
                        : isNegative
                        ? 'bg-rose-50/30'
                        : index % 2 === 1
                        ? 'bg-slate-50/40'
                        : 'bg-white'
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center text-slate-400 font-mono text-[11px]">
                      {globalIndex}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-xs">{r.nip}</div>
                      <div className="text-[11px] text-slate-500">{r.nama}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          r.isBonusStoreOnly
                            ? 'bg-amber-100 text-amber-800'
                            : r.tipeInsentif === '(Tanpa Tipe)' || r.tipeInsentif === '1'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {r.tipeInsentif}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700 text-[11px] font-semibold">
                        {r.departement || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                      {r.noReceipt}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                      {r.sku}
                    </td>
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
                    <td className="px-3 py-2.5 text-right font-mono font-bold whitespace-nowrap bg-amber-50/40 text-amber-900">
                      {r.bonusStoreAmount && r.bonusStoreAmount > 0
                        ? formatRupiah(r.bonusStoreAmount)
                        : '-'}
                    </td>
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
                          Agustus Only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination & Totals */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Menampilkan{' '}
            <strong className="text-slate-800">
              {totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-800">
              {Math.min(activePage * pageSize, totalItems)}
            </strong>{' '}
            dari <strong className="text-slate-800">{totalItems}</strong> baris
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">| Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 bg-white border border-slate-200 rounded-md text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="text-right sm:pr-4">
            <span className="text-slate-400 text-[11px] block">Subtotal Insentif Filter:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatRupiah(filteredTotal)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={activePage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700 font-mono">
              {activePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={activePage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
