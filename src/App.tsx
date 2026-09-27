import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getActiveRecords,
  saveCustomRecords,
  clearCustomRecords,
  getSalesEmployees,
  findSalesByNip,
  getOverallIncentiveSummary,
} from './data/incentives';
import { SalesEmployee, IncentiveRecord } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { DetailTable } from './components/DetailTable';
import { SlipGajiModal } from './components/SlipGajiModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Users, X, FileSpreadsheet, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';
import { formatRupiah } from './utils/numberFormat';

export default function App() {
  const [dataState, setDataState] = useState(() => getActiveRecords());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('portal_is_admin') === 'true';
  });
  const [currentEmployee, setCurrentEmployee] = useState<SalesEmployee | null>(null);
  const [showSlipGaji, setShowSlipGaji] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Compute employees whenever records change
  const employees = useMemo(() => {
    return getSalesEmployees(dataState.records);
  }, [dataState.records]);

  // Compute overall summary across all sales
  const overallSummary = useMemo(() => {
    return getOverallIncentiveSummary(dataState.records, employees);
  }, [dataState.records, employees]);

  // Restore session from sessionStorage or update currentEmployee if records change
  useEffect(() => {
    if (sessionStorage.getItem('portal_is_admin') === 'true') {
      setIsAdminLoggedIn(true);
      return;
    }

    const savedNip = sessionStorage.getItem('portal_sales_nip');
    if (savedNip) {
      const found = employees.find((e) => e.nip === savedNip);
      if (found) {
        setCurrentEmployee(found);
      }
    }
  }, [employees]);

  const handleLogin = (employee: SalesEmployee) => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('portal_is_admin');
    setCurrentEmployee(employee);
    sessionStorage.setItem('portal_sales_nip', employee.nip);
    setSelectedType(null);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('portal_is_admin', 'true');
    setCurrentEmployee(null);
    sessionStorage.removeItem('portal_sales_nip');
  };

  const handleLogout = () => {
    setCurrentEmployee(null);
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('portal_sales_nip');
    sessionStorage.removeItem('portal_is_admin');
    setShowSlipGaji(false);
    setSelectedType(null);
  };

  const handleSwitchSales = (employee: SalesEmployee) => {
    setCurrentEmployee(employee);
    sessionStorage.setItem('portal_sales_nip', employee.nip);
    setShowSwitchModal(false);
    setSelectedType(null);
  };

  const handleDataLoaded = useCallback((records: IncentiveRecord[], label: string) => {
    saveCustomRecords(records, label);
    const reloadedState = getActiveRecords();
    setDataState(reloadedState);
    // Refresh current employee if logged in
    if (currentEmployee) {
      const reloadedEmployees = getSalesEmployees(reloadedState.records);
      const reloaded = reloadedEmployees.find((e) => e.nip === currentEmployee.nip);
      if (reloaded) setCurrentEmployee(reloaded);
    }
  }, [currentEmployee]);

  const handleResetDefault = useCallback(() => {
    clearCustomRecords();
    const defaultState = getActiveRecords();
    setDataState(defaultState);
    if (currentEmployee) {
      const reloadedEmployees = getSalesEmployees(defaultState.records);
      const reloaded = reloadedEmployees.find((e) => e.nip === currentEmployee.nip);
      if (reloaded) setCurrentEmployee(reloaded);
    }
  }, [currentEmployee]);

  // 1. If ADMIN is logged in (mgr35)
  if (isAdminLoggedIn) {
    return (
      <>
        <AdminDashboard
          overallSummary={overallSummary}
          employees={employees}
          records={dataState.records}
          dataSourceLabel={dataState.sourceLabel}
          onLogout={handleLogout}
          onOpenImportModal={() => setShowImportModal(true)}
        />
        <ExcelImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onDataLoaded={handleDataLoaded}
          onResetDefault={handleResetDefault}
          isCustomData={dataState.isCustom}
          currentLabel={dataState.sourceLabel}
          totalActiveRecords={dataState.records.length}
          totalEmployees={employees.length}
        />
      </>
    );
  }

  // 2. If NOT logged in at all, show login screen
  if (!currentEmployee) {
    return (
      <>
        <LoginScreen
          employees={employees}
          onLogin={handleLogin}
          onAdminLogin={handleAdminLogin}
          onOpenImportModal={() => setShowImportModal(true)}
          dataSourceLabel={dataState.sourceLabel}
          totalRecordsCount={dataState.records.length}
          isCustomData={dataState.isCustom}
        />
        <ExcelImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onDataLoaded={handleDataLoaded}
          onResetDefault={handleResetDefault}
          isCustomData={dataState.isCustom}
          currentLabel={dataState.sourceLabel}
          totalActiveRecords={dataState.records.length}
          totalEmployees={employees.length}
        />
      </>
    );
  }

  // 3. If SALES employee is logged in
  return (
    <div id="app-root" className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header with Sales Name & NIP */}
      <Header
        employee={currentEmployee}
        onOpenSlipGaji={() => setShowSlipGaji(true)}
        onLogout={handleLogout}
        onSwitchSales={() => setShowSwitchModal(true)}
        onSwitchToAdmin={handleAdminLogin}
        onOpenImportModal={() => setShowImportModal(true)}
        dataSourceLabel={dataState.sourceLabel}
        isCustomData={dataState.isCustom}
        totalRecordsCount={dataState.records.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* Ringkasan dalam bentuk kotak per tipe insentif */}
        <SummaryCards
          typeSummaries={currentEmployee.typeSummaries}
          totalInsentif={currentEmployee.totalInsentif}
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />

        {/* Detail insentif yang mereka dapatkan (Cell A:G) */}
        <DetailTable
          records={currentEmployee.records}
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>
              Sheet: <strong>INSENTIF AGUSTUS</strong> (Cell A1:G11068) • {dataState.records.length.toLocaleString('id-ID')} baris data lengkap
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={handleAdminLogin}
              className="text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Portal Manajer (mgr35)</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Kelola / Sinkron Data
            </button>
          </div>
        </div>
      </footer>

      {/* Slip Gaji Modal */}
      {showSlipGaji && (
        <SlipGajiModal
          employee={currentEmployee}
          onClose={() => setShowSlipGaji(false)}
        />
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onDataLoaded={handleDataLoaded}
        onResetDefault={handleResetDefault}
        isCustomData={dataState.isCustom}
        currentLabel={dataState.sourceLabel}
        totalActiveRecords={dataState.records.length}
        totalEmployees={employees.length}
      />

      {/* Quick Switch Sales Dialog */}
      {showSwitchModal && (
        <div
          id="switch-sales-modal"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Ganti Akun Sales</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Pilih rekan sales lain ({employees.length} terdaftar) untuk melihat rincian akumulasi insentif dan slip gaji mereka:
            </p>
            <div className="overflow-y-auto space-y-1.5 divide-y divide-slate-100 flex-1 pr-1">
              {employees.map((emp) => (
                <button
                  key={emp.nip}
                  type="button"
                  onClick={() => handleSwitchSales(emp)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    currentEmployee.nip === emp.nip
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-mono text-xs text-indigo-700 font-bold">{emp.nip}</div>
                    <div className="text-sm font-medium">{emp.nama}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-700 text-sm">
                      {formatRupiah(emp.totalInsentif)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {emp.transactionCount} transaksi
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
