import React, { useState } from 'react';
import { SalesEmployee } from '../types';
import {
  Lock,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
  Database,
  ShieldAlert,
  User,
} from 'lucide-react';

interface LoginScreenProps {
  employees: SalesEmployee[];
  onLogin: (employee: SalesEmployee) => void;
  onAdminLogin: () => void;
  onOpenImportModal: () => void;
  dataSourceLabel: string;
  totalRecordsCount: number;
  isCustomData: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  employees,
  onLogin,
  onAdminLogin,
  onOpenImportModal,
  dataSourceLabel,
  totalRecordsCount,
  isCustomData,
}) => {
  const [loginMode, setLoginMode] = useState<'sales' | 'admin'>('sales');

  // Sales credentials - default empty
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');

  // Admin credentials - default empty
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedNip = nip.trim();
    const trimmedPass = password.trim();

    // Check if user accidentally typed admin username here
    if (trimmedNip.toLowerCase() === 'mgr35') {
      if (trimmedPass === '123456') {
        onAdminLogin();
        return;
      } else {
        setErrorMessage('Password admin salah!');
        return;
      }
    }

    if (!trimmedNip) {
      setErrorMessage('Silakan masukkan NIP Anda.');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage('Silakan masukkan password (3 digit terakhir NIP).');
      return;
    }

    const employee = employees.find((emp) => emp.nip === trimmedNip);

    if (!employee) {
      setErrorMessage(
        `NIP "${trimmedNip}" tidak ditemukan dalam data saat ini. Anda dapat mengunggah file spreadsheet Excel (.xlsx) lengkap untuk memuat seluruh data.`
      );
      return;
    }

    // Password must match the last 3 digits of the NIP
    const expectedPassword = employee.defaultPassword;
    if (trimmedPass !== expectedPassword) {
      setErrorMessage('Password salah! Silakan masukkan 3 digit terakhir NIP Anda.');
      return;
    }

    onLogin(employee);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = adminUsername.trim().toLowerCase();
    const trimmedPass = adminPassword.trim();

    if (!trimmedUser) {
      setErrorMessage('Silakan masukkan username admin.');
      return;
    }

    if (trimmedUser !== 'mgr35') {
      setErrorMessage('Username admin tidak terdaftar.');
      return;
    }

    if (trimmedPass !== '123456') {
      setErrorMessage('Password admin salah!');
      return;
    }

    onAdminLogin();
  };

  return (
    <div id="login-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Top Banner Info */}
      <div className="max-w-xl mx-auto w-full px-4 mb-4">
        <div className="bg-white border border-indigo-100 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">
                Sheet: <span className="text-emerald-700 font-bold">INSENTIF AGUSTUS</span> (Cell A1:G11068)
              </div>
              <div className="text-slate-500 text-[11px]">
                {totalRecordsCount.toLocaleString('id-ID')} baris data lengkap • {employees.length} sales terdaftar
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Kelola / Sinkron</span>
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Portal Insentif Sales
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Sheet Insentif Periode Agustus 2026 • Verifikasi & Rekapitulasi Komisi
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200 overflow-hidden">
          {/* Mode Tabs: Sales vs Admin */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                setLoginMode('sales');
                setErrorMessage(null);
              }}
              className={`py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                loginMode === 'sales'
                  ? 'bg-white border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Login Sales (NIP)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setErrorMessage(null);
              }}
              className={`py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                loginMode === 'admin'
                  ? 'bg-white border-amber-500 text-amber-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Login Manajer / Admin</span>
            </button>
          </div>

          <div className="py-7 px-6 sm:px-8">
            {/* Error Message */}
            {errorMessage && (
              <div
                id="login-error-alert"
                className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* TAB 1: SALES LOGIN */}
            {loginMode === 'sales' ? (
              <form onSubmit={handleSalesSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nip-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    NIP Sales
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <input
                      id="nip-input"
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="Masukkan NIP sales"
                      autoComplete="username"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-mono tracking-wider transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Masukkan Nomor Induk Pegawai (NIP) Anda.
                  </p>
                </div>

                <div>
                  <label htmlFor="password-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password (3 Digit Terakhir NIP)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      maxLength={10}
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-mono tracking-wider transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Password adalah 3 digit terakhir NIP Anda.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    id="btn-submit-login"
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    <span>Masuk ke Dashboard Sales</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: ADMIN LOGIN */
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    Akses khusus manajer untuk melihat <strong>seluruh rekapan insentif</strong> dan rincian transaksi seluruh sales.
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-user-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Username Manajer / Admin
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                    </div>
                    <input
                      id="admin-user-input"
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Masukkan username manajer"
                      autoComplete="username"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm font-mono tracking-wider transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-pass-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password Admin
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="admin-pass-input"
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan password admin"
                      autoComplete="current-password"
                      className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-sm font-mono tracking-wider transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-admin-login"
                    type="submit"
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors cursor-pointer"
                  >
                    <span>Masuk Dashboard Manajer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Portal Rekapitulasi Insentif • Sheet INSENTIF AGUSTUS (Cell A1:G11068)
        </p>
      </div>
    </div>
  );
};
