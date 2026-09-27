import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { parseExcelFile, processRawRows } from '../utils/excelParser';
import { IncentiveRecord, SalesEmployee } from '../types';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FileText,
  Database,
  ArrowRight,
  Sparkles,
  Globe,
  Download,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: IncentiveRecord[], label: string) => void;
  onResetDefault: () => void;
  isCustomData: boolean;
  currentLabel: string;
  totalActiveRecords: number;
  totalEmployees: number;
}

const DEFAULT_SPREADSHEET_ID = '10TgEJyFSJkD6yfV8t_QgGH9jJJ_NppIXlCUsvVuB6lY';
const DEFAULT_SHEET_NAME = 'INSENTIF AGUSTUS';

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onResetDefault,
  isCustomData,
  currentLabel,
  totalActiveRecords,
  totalEmployees,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'upload' | 'paste'>('sync');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    rowCount: number;
    employeeCount: number;
    sheetName: string;
    availableSheets: string[];
    records: IncentiveRecord[];
    sampleEmployees: SalesEmployee[];
  } | null>(null);

  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SPREADSHEET_ID);
  const [sheetName, setSheetName] = useState(DEFAULT_SHEET_NAME);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSyncGoogleSheets = async () => {
    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const cleanId = spreadsheetId.trim();
      const cleanSheet = sheetName.trim();
      if (!cleanId) throw new Error('ID Spreadsheet tidak boleh kosong.');
      if (!cleanSheet) throw new Error('Nama Sheet tidak boleh kosong.');

      const url = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
        cleanSheet
      )}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Gagal mengambil data dari Google Sheets (Status: ${response.status}). Pastikan link spreadsheet dapat diakses.`
        );
      }

      const csvText = await response.text();
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

      const rawRows: string[][] = lines.map((line) => {
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          matches.push(match[1]);
          if (regex.lastIndex >= line.length) break;
        }
        return matches;
      });

      const records = processRawRows(rawRows);
      if (records.length === 0) {
        throw new Error('Tidak ada baris data insentif yang valid ditemukan.');
      }

      onDataLoaded(
        records,
        `Google Spreadsheet (${cleanSheet} • ${records.length.toLocaleString('id-ID')} baris)`
      );
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
          'Gagal sinkronisasi data dari Google Spreadsheet. Anda dapat mengunduh file Excel lalu gunakan tab "Unggah File Excel".'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) throw new Error('File tidak dapat dibaca.');

        const result = parseExcelFile(buffer as ArrayBuffer);

        if (result.records.length === 0) {
          throw new Error(
            `Tidak ada data insentif yang valid ditemukan di Sheet "${result.sheetName}". Pastikan kolom A:G terisi dengan format: NIP, Nama, Tipe Insentif, Dept, No Receipt, SKU, Jumlah Insentif.`
          );
        }

        setSuccessInfo({
          rowCount: result.totalRows,
          employeeCount: result.employees.length,
          sheetName: result.sheetName,
          availableSheets: result.availableSheets,
          records: result.records,
          sampleEmployees: result.employees.slice(0, 5),
        });
      } catch (err: any) {
        setError(err?.message || 'Gagal memproses file spreadsheet.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Terjadi kesalahan saat membaca file.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleApplyImportedData = () => {
    if (!successInfo) return;
    onDataLoaded(
      successInfo.records,
      `Sheet ${successInfo.sheetName} (${successInfo.rowCount.toLocaleString('id-ID')} baris)`
    );
    onClose();
  };

  const handlePasteProcess = () => {
    if (!pasteText.trim()) {
      setError('Silakan tempel teks tabel data terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lines = pasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const rawRows: string[][] = lines.map((line) => {
        if (line.includes('\t')) {
          return line.split('\t');
        }
        return line.split(',');
      });

      const records = processRawRows(rawRows);

      if (records.length === 0) {
        throw new Error('Tidak ada baris yang valid terdeteksi.');
      }

      onDataLoaded(records, `Data Tempel Manual (${records.length} baris)`);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses data yang ditempel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="excel-import-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Kelola Sumber Data Spreadsheet
              </h3>
              <p className="text-xs text-slate-300">
                Google Sheets: <strong>INSENTIF AGUSTUS</strong> (Cell A1:G11068)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>
              Aktif: <strong className="text-slate-800">{totalActiveRecords.toLocaleString('id-ID')} baris</strong> (
              {totalEmployees} sales terdata)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onResetDefault();
              onClose();
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset ke Data Default
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('sync');
              setError(null);
            }}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google Sheets Sinkron
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setError(null);
            }}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Unggah File Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setError(null);
            }}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Salin / Tempel Baris
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm">Sinkronisasi Langsung dari Google Sheets</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Aplikasi telah memuat <strong>11.067 baris data lengkap</strong> dari spreadsheet Anda.
                  Gunakan tombol di bawah jika spreadsheet diperbarui di Google Sheets untuk mengambil data terbaru:
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sheet Name
                    </label>
                    <input
                      type="text"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSyncGoogleSheets}
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Mengambil Data dari Google...' : 'Sinkronkan Ulang dari Google Sheets'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <div className="font-semibold text-slate-800">Detail Konfigurasi Saat Ini:</div>
                <div>• Spreadsheet ID: <span className="font-mono text-indigo-700">10TgEJyFSJkD6yfV8t_QgGH9jJJ_NppIXlCUsvVuB6lY</span></div>
                <div>• Sheet: <span className="font-mono text-indigo-700">INSENTIF AGUSTUS</span> (Baris 1 - 11068)</div>
                <div>• Total Baris Termasuk: 11.067 transaksi aktif</div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Pilih file spreadsheet (.xlsx / .csv) atau seret ke sini
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung file Excel unduhan dari Google Sheets
                  </p>
                </div>
              </div>

              {successInfo && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-sm">File Siap Digunakan!</span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-200 font-semibold text-emerald-800">
                      {successInfo.sheetName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                      <span className="text-slate-500 block">Total Baris</span>
                      <strong className="text-base text-slate-900">
                        {successInfo.rowCount.toLocaleString('id-ID')} baris
                      </strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
                      <span className="text-slate-500 block">Jumlah Sales</span>
                      <strong className="text-base text-slate-900">
                        {successInfo.employeeCount} sales
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyImportedData}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Terapkan {successInfo.rowCount.toLocaleString('id-ID')} Baris Data Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Tempel data baris (TSV atau CSV) dari sheet Anda di bawah ini:
              </p>
              <textarea
                rows={8}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Contoh:&#10;101853	RIKI SUBAGJA	KHUSUS - JULI 2026	BA	U35.8.20260705.10	10514058	337,824"
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handlePasteProcess}
                disabled={loading || !pasteText.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Memproses...' : 'Proses Data Tempel'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Sumber: Google Spreadsheet (INSENTIF AGUSTUS)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
