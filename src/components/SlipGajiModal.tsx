import React from 'react';
import { SalesEmployee } from '../types';
import { formatRupiah } from '../utils/numberFormat';
import { terbilang } from '../utils/terbilang';
import {
  Printer,
  X,
  FileText,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Store,
} from 'lucide-react';

interface SlipGajiModalProps {
  employee: SalesEmployee;
  onClose: () => void;
}

export const SlipGajiModal: React.FC<SlipGajiModalProps> = ({ employee, onClose }) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  // Find any negative records
  const negativeRecords = employee.records.filter((r) => r.jumlahInsentif < 0);

  const grandTotalTakeHome = employee.totalTakeHomePay;

  return (
    <div
      id="slip-gaji-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static"
    >
      <div
        id="slip-gaji-container"
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-full"
      >
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">Dokumen Slip Insentif & Bonus Store</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-print-slip"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Slip (Print)</span>
            </button>
            <button
              id="btn-close-slip-top"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 print:p-4">
          {/* Slip Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    R
                  </div>
                  <h3 className="font-extrabold text-xl tracking-tight text-slate-900 uppercase">
                    PT RETAIL INDONESIA
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Divisi Penjualan & Distribusi Retail • Departemen Kompensasi & Insentif
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md">
                  SLIP RESMI INSENTIF & BONUS
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  No: SLP/AGT26/{employee.nip}
                </p>
                <p className="text-xs text-slate-500">Tgl Cetak: {currentDate}</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-wide">
                SLIP RINCIAN INSENTIF SALES & BONUS STORE
              </h1>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-widest mt-0.5">
                PERIODE: AGUSTUS 2026
              </p>
            </div>
          </div>

          {/* Employee Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="block text-slate-500 font-medium">NIP Sales</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{employee.nip}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Nama Sales</span>
              <span className="font-bold text-slate-900 text-sm">{employee.nama}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Departemen Terkait</span>
              <span className="font-medium text-slate-800">
                {employee.departments.length > 0 ? employee.departments.join(', ') : '-'}
              </span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Jumlah Transaksi</span>
              <span className="font-bold text-slate-900">{employee.transactionCount} Transaksi</span>
            </div>
          </div>

          {/* Breakdown Table Per Tipe Insentif Penjualan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                A. Akumulasi Insentif Penjualan (Sheet INSENTIF AGUSTUS)
              </h4>
              <span className="text-[11px] text-slate-500">
                (Cell A1:G11068 • Termasuk tipe kosong & "1")
              </span>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th scope="col" className="px-3.5 py-2.5 text-left w-10">No</th>
                    <th scope="col" className="px-3.5 py-2.5 text-left">Tipe Insentif</th>
                    <th scope="col" className="px-3.5 py-2.5 text-center w-24">Jumlah Tx</th>
                    <th scope="col" className="px-3.5 py-2.5 text-right">Positif (+)</th>
                    <th scope="col" className="px-3.5 py-2.5 text-right">Minus (-)</th>
                    <th scope="col" className="px-3.5 py-2.5 text-right">Subtotal Insentif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employee.typeSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3.5 py-3 text-center text-slate-400 italic">
                        Tidak ada transaksi penjualan langsung di sheet INSENTIF AGUSTUS
                      </td>
                    </tr>
                  ) : (
                    employee.typeSummaries.map((item, idx) => (
                      <tr key={item.type} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="px-3.5 py-2 text-slate-400 text-center">{idx + 1}</td>
                        <td className="px-3.5 py-2 font-medium text-slate-800">{item.type}</td>
                        <td className="px-3.5 py-2 text-center text-slate-600 font-mono">{item.count}</td>
                        <td className="px-3.5 py-2 text-right font-mono text-emerald-700">
                          {formatRupiah(item.positiveTotal)}
                        </td>
                        <td className="px-3.5 py-2 text-right font-mono text-rose-600">
                          {item.negativeTotal !== 0 ? formatRupiah(item.negativeTotal) : '-'}
                        </td>
                        <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">
                          {formatRupiah(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="px-3.5 py-2.5 text-left uppercase">
                      Subtotal Insentif Penjualan
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-mono">
                      {employee.transactionCount}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-emerald-800">
                      {formatRupiah(employee.totalPositive)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-rose-700">
                      {employee.totalNegative !== 0 ? formatRupiah(employee.totalNegative) : 'Rp 0'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-indigo-900 font-extrabold">
                      {formatRupiah(employee.totalInsentif)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section B: Bonus Store */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>B. Bonus Store (Sheet "Bonus Store" • gid: 1621745252)</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Pencocokan NIP: String text equality
              </span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>Bonus Kinerja Store</span>
                    {employee.bonusStoreAmount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Terdaftar di Bonus Store
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
                        Tidak Ada di Sheet Bonus Store (Rp 0)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {employee.bonusStoreData?.nama
                      ? `Nama di sheet Bonus Store: ${employee.bonusStoreData.nama}`
                      : 'NIP tidak tercantum di sheet Bonus Store'}
                  </p>
                </div>
                <div className="text-right font-mono text-base font-bold text-amber-900">
                  {formatRupiah(employee.bonusStoreAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Negative adjustments note if any */}
          {negativeRecords.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
              <div className="flex items-center gap-2 text-rose-800 font-semibold mb-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Rincian Penyesuaian Pengurangan (Minus Insentif):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {negativeRecords.map((neg) => (
                  <li key={neg.id}>
                    Receipt <strong>{neg.noReceipt}</strong> (SKU: {neg.sku}, Dept: {neg.departement}, Tipe: {neg.tipeInsentif}):{' '}
                    <span className="font-bold text-rose-600 font-mono">
                      {formatRupiah(neg.jumlahInsentif)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-500 mt-2 italic">
                * Sesuai ketentuan, insentif dengan nilai minus tetap dimasukkan dan secara otomatis mengurangi total keseluruhan insentif yang didapatkan.
              </p>
            </div>
          )}

          {/* Final Take-Home Total Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border-2 border-indigo-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                  TOTAL KESELURUHAN DITERIMA (TAKE HOME PAY)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Subtotal Insentif Penjualan ({formatRupiah(employee.totalInsentif)}) + Bonus Store ({formatRupiah(employee.bonusStoreAmount)})
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Terbilang: <span className="font-semibold italic text-slate-900">{terbilang(grandTotalTakeHome)}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono tracking-tight">
                  {formatRupiah(grandTotalTakeHome)}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium flex items-center justify-end gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Tervalidasi Sistem Payroll</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures for formal slip */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 print:pt-4">
            <div>
              <p className="font-medium text-slate-500">Disiapkan Oleh,</p>
              <p className="text-[11px] text-slate-400">Departemen Payroll & Finance</p>
              <div className="h-16 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-36">
                Bagian Keuangan & Kompensasi
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Diterima Oleh,</p>
              <p className="text-[11px] text-slate-400">Sales Representative</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">Tanda Tangan Sales</span>
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-36">
                {employee.nama}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
