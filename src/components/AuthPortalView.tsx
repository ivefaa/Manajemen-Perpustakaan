import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  X,
} from 'lucide-react';
import type {
  AuthScreenMode,
  StaffAccount,
  StaffRole,
} from '../types/library';
import {
  authenticateStaff,
  evaluatePasswordPolicy,
  isValidIdentifierFormat,
  lookupAccountByIdentifier,
} from '../utils/authRules';
import { BrandLogo } from './BrandLogo';

interface AuthPortalViewProps {
  mode: Exclude<AuthScreenMode, 'authenticated'>;
  accounts: StaffAccount[];
  recoveryTargetId: string;
  onChangeMode: (mode: Exclude<AuthScreenMode, 'authenticated'>) => void;
  onSetRecoveryTargetId: (id: string) => void;
  onLoginSuccess: (account: StaffAccount) => void;
  onPasswordUpdated: (accountId: string, newPassword: string) => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  mode,
  accounts,
  recoveryTargetId,
  onChangeMode,
  onSetRecoveryTargetId,
  onLoginSuccess,
  onPasswordUpdated,
}) => {
  // Login & Re-login state
  const [selectedRole, setSelectedRole] = useState<StaffRole>('pustakawan');
  const [identifier, setIdentifier] = useState('PST-2026-088');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [reloginBannerOpen, setReloginBannerOpen] = useState(true);

  // Recovery Step 1 state
  const [lookupMethod, setLookupMethod] = useState<'email' | 'nip'>('email');
  const [recoveryInput, setRecoveryInput] = useState(
    'siti.rahmawati@pustakamodern.id'
  );
  const [deliveryChannel, setDeliveryChannel] = useState<'email' | 'otp'>(
    'email'
  );
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recovery Step 2 state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoutOtherTerminals, setLogoutOtherTerminals] = useState(true);
  const [sendAuditEmail, setSendAuditEmail] = useState(true);
  const [step2SubmitAttempted, setStep2SubmitAttempted] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [recentlyUpdatedPassword, setRecentlyUpdatedPassword] = useState('');

  const recoveryAccount =
    lookupAccountByIdentifier(accounts, recoveryTargetId) || accounts[0];

  const foundStep1Account = lookupAccountByIdentifier(accounts, recoveryInput);
  const policyEval = evaluatePasswordPolicy(
    newPassword,
    confirmPassword,
    recoveryAccount.passwordHistory
  );

  // Login password strength bar helper
  const loginStrengthEval = evaluatePasswordPolicy(
    password,
    password,
    []
  );

  // Countdown for Password Updated Modal
  useEffect(() => {
    if (!successModalOpen) return;
    setRedirectCountdown(3);
    const timer = window.setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setSuccessModalOpen(false);
          setReloginBannerOpen(true);
          setIdentifier(recoveryAccount.id);
          setPassword(recentlyUpdatedPassword);
          setSelectedRole(
            recoveryAccount.role === 'sysadmin' ? 'sysadmin' : 'pustakawan'
          );
          onChangeMode('relogin-success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [
    successModalOpen,
    onChangeMode,
    recoveryAccount.id,
    recoveryAccount.role,
    recentlyUpdatedPassword,
  ]);

  const handleQuickFill = (acc: StaffAccount) => {
    setSelectedRole(acc.role === 'sysadmin' ? 'sysadmin' : 'pustakawan');
    setIdentifier(acc.id);
    setPassword(acc.password);
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authenticateStaff({
      accounts,
      identifier,
      password,
      selectedRole,
    });
    if (!res.success || !res.account) {
      setLoginError(res.error || 'Otentikasi gagal.');
      return;
    }
    setLoginError(null);
    onLoginSuccess(res.account);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundStep1Account) {
      setStep1Error(
        'NIP atau alamat email kedinasan tidak terdaftar di direktori staf.'
      );
      return;
    }
    setStep1Error(null);
    onSetRecoveryTargetId(foundStep1Account.id);
    setNewPassword('');
    setConfirmPassword('');
    setStep2SubmitAttempted(false);
    onChangeMode('recovery-step2');
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2SubmitAttempted(true);
    if (!policyEval.canSubmit) {
      return;
    }
    onPasswordUpdated(recoveryAccount.id, newPassword);
    setRecentlyUpdatedPassword(newPassword);
    setSuccessModalOpen(true);
  };

  const handleImmediateRelogin = () => {
    setSuccessModalOpen(false);
    setReloginBannerOpen(true);
    setIdentifier(recoveryAccount.id);
    setPassword(recentlyUpdatedPassword);
    setSelectedRole(
      recoveryAccount.role === 'sysadmin' ? 'sysadmin' : 'pustakawan'
    );
    onChangeMode('relogin-success');
  };

  const handleDirectIntoDesk = () => {
    setSuccessModalOpen(false);
    const updatedAcc =
      accounts.find((a) => a.id === recoveryAccount.id) || recoveryAccount;
    onLoginSuccess(updatedAcc);
  };

  const showStep2ValidationError =
    (step2SubmitAttempted || newPassword.length > 0 || confirmPassword.length > 0) &&
    !policyEval.canSubmit &&
    (step2SubmitAttempted ||
      (newPassword.length > 0 && !policyEval.isValidPolicy) ||
      (confirmPassword.length > 0 && !policyEval.isConfirmMatch));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Security Header */}
      <header className="min-h-16 py-2.5 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-3 sticky top-0 z-30">
        <button
          type="button"
          onClick={() => onChangeMode('login')}
          className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E] rounded-lg"
        >
          <BrandLogo size="md" />
          <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-x-2">
            <span className="text-[14px] sm:text-[14.5px] font-bold tracking-tight text-slate-900 truncate">
              PustakaModern V1.0
            </span>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">
              •
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
              Portal Keamanan &amp; Sirkulasi
            </span>
          </div>
        </button>

        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] sm:text-[11.5px] font-semibold text-[#0D6E6E] whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="sm:hidden">TLS 1.3 Aktif</span>
          <span className="hidden sm:inline">Sistem Enkripsi TLS 1.3 Aktif</span>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 flex flex-col justify-center">
        {/* ================= MODE 1: STANDARD LOGIN PORTAL ================= */}
        {mode === 'login' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-page-in">
            {/* Left Info & Quick Access Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[#0D6E6E] text-[10.5px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    TERMINAL AKSES RESMI
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    v1.0.4-LTS
                  </span>
                </div>

                <div>
                  <div className="text-[10.5px] font-bold tracking-wider uppercase text-[#0D6E6E]">
                    PUSTAKAMODERN FRAMEWORK
                  </div>
                  <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight text-slate-900 leading-snug mt-1">
                    Portal Akses Sirkulasi &amp; Administrasi
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    Pusat autentikasi tunggal bagi petugas perpustakaan, staf
                    katalogisasi, dan administrator basis data sirkulasi buku.
                  </p>
                </div>

                {/* Crisp Vector Library Hero Graphic */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0B1E33] via-[#132E4A] to-[#0D6E6E] p-4 text-white border border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-teal-300">
                        ARSIP &amp; PENGETAHUAN
                      </span>
                      <div className="text-sm font-bold leading-snug">
                        Integritas Data Sirkulasi Real-time
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Sinkronisasi stok atomik &amp; audit kasir harian
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <BookOpen className="w-8 h-8 text-teal-300" />
                    </div>
                  </div>
                </div>

                {/* Live Health Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3">
                    <div className="text-[11px] text-slate-500">
                      Server Sirkulasi
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Online (18ms)</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3">
                    <div className="text-[11px] text-slate-500">
                      Database Koleksi
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Database className="w-3.5 h-3.5 text-[#0D6E6E]" />
                      <span>100% Sinkron</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Click Quick Access Profiles */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0D6E6E]" />
                    <h2 className="text-xs font-bold text-slate-900">
                      Akses Cepat Pengujian (1-Klik)
                    </h2>
                  </div>
                  <span className="text-[10.5px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Uji Coba Cepat
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500">
                  Pilih profil kredensial di bawah untuk mengisi form login
                  secara otomatis:
                </p>

                <div className="space-y-2.5">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-teal-50/40 hover:border-[#0D6E6E]/50 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 shrink-0">
                          {acc.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {acc.fullName}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                acc.role === 'sysadmin'
                                  ? 'bg-[#0B1E33] text-white'
                                  : 'bg-emerald-100 text-[#0D6E6E]'
                              }`}
                            >
                              {acc.role === 'sysadmin'
                                ? 'SysAdmin'
                                : 'Pustakawan'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                            {acc.id} • Sandi: {acc.password}
                          </div>
                        </div>
                      </div>
                      <LogIn className="w-4 h-4 text-slate-400 group-hover:text-[#0D6E6E] shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* RBAC Security Box */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D6E6E] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Protokol Keamanan RBAC Ketat
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Sesi kedaluwarsa otomatis dalam 30 menit ketidakaktifan.
                    Pelanggaran aturan akses diproses sesuai BR-01 hingga BR-07.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Login Form Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                    PILIH RUANG KERJA
                  </span>
                  <span className="text-[11px] font-semibold text-[#0D6E6E]">
                    Role-Based Access Control
                  </span>
                </div>

                {/* Role Tabs */}
                <div
                  role="tablist"
                  aria-label="Pilih Ruang Kerja Login"
                  className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/70 gap-1"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedRole !== 'sysadmin'}
                    onClick={() => {
                      setSelectedRole('pustakawan');
                      setLoginError(null);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                      selectedRole !== 'sysadmin'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0D6E6E]" />
                    <span>Pustakawan / Layanan</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedRole === 'sysadmin'}
                    onClick={() => {
                      setSelectedRole('sysadmin');
                      setLoginError(null);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                      selectedRole === 'sysadmin'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UserCog className="w-3.5 h-3.5 text-[#0D6E6E]" />
                    <span>Administrator Sistem</span>
                  </button>
                </div>

                {/* Access Scope Notice */}
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Cakupan Akses:
                    </span>{' '}
                    {selectedRole === 'sysadmin'
                      ? 'Konfigurasi RBAC, Audit Basis Data, Kebijakan Keamanan, serta Otoritas Penuh Sirkulasi.'
                      : 'Sirkulasi Pinjam-Kembali, Katalog Inventaris, Registrasi Eksemplar, Penanganan Denda Harian.'}
                  </div>
                </div>

                {loginError && (
                  <div
                    role="alert"
                    className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 flex items-start gap-2.5 text-xs text-rose-800 animate-slide-down"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Identifier Field */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="login-identifier"
                      className="text-xs font-bold text-slate-800"
                    >
                      ID Petugas Sirkulasi / NIP
                    </label>
                    {isValidIdentifierFormat(identifier) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D6E6E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Format Terverifikasi
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="PST-2026-088 atau email@pustakamodern.id"
                      className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15 transition-all"
                    />
                    {isValidIdentifierFormat(identifier) && (
                      <Check className="w-4 h-4 text-[#0D6E6E] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Gunakan NIP terdaftar (misal{' '}
                    <span className="font-mono font-semibold text-slate-700">
                      PST-2026-088
                    </span>
                    ) atau email{' '}
                    <span className="font-mono text-slate-600">
                      @pustakamodern.id
                    </span>
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="text-xs font-bold text-slate-800"
                    >
                      Kata Sandi / Kunci Akses
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D6E6E]">
                      <Lock className="w-3 h-3" />
                      Enkripsi SHA-256 Aktif
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="Masukkan kata sandi (contoh: Pustaka#2026)"
                      className="w-full h-11 pl-10 pr-11 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={
                        showLoginPassword
                          ? 'Sembunyikan kata sandi'
                          : 'Tampilkan kata sandi'
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Strength Bar + Forgot Password */}
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="grid grid-cols-4 gap-1.5 w-32">
                        {[1, 2, 3, 4].map((seg) => (
                          <span
                            key={seg}
                            className={`h-1.5 rounded-full transition-colors ${
                              password.length === 0
                                ? 'bg-slate-200'
                                : seg <= loginStrengthEval.scoreOutOf4
                                  ? loginStrengthEval.scoreOutOf4 >= 3
                                    ? 'bg-[#0D6E6E]'
                                    : 'bg-amber-500'
                                  : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        Tingkat Keamanan:{' '}
                        <strong className="text-slate-700">
                          {password.length === 0
                            ? 'Menunggu Input'
                            : loginStrengthEval.strengthLabel}
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const match = lookupAccountByIdentifier(
                          accounts,
                          identifier
                        );
                        setRecoveryInput(
                          match?.email || accounts[0].email
                        );
                        setLookupMethod('email');
                        setStep1Error(null);
                        onChangeMode('recovery-step1');
                      }}
                      className="text-xs font-bold text-[#0D6E6E] hover:underline whitespace-nowrap"
                    >
                      Lupa Sandi?
                    </button>
                  </div>
                </div>

                {/* Remember Terminal Checkbox */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0D6E6E] focus:ring-[#0D6E6E]"
                    />
                    <span>Pertahankan sesi di terminal ini (8 jam)</span>
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    TERMINAL-01
                  </span>
                </div>

                {/* Primary Login Submit */}
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>Masuk ke Meja Layanan Perpustakaan</span>
                  <ArrowRight className="w-4 h-4 text-teal-300" />
                </button>

                {/* Standards Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Standar Sirkulasi ISO 27001 &amp; ISO 21127 CIDOC CRM
                  </span>
                  <span className="font-mono font-semibold text-slate-500">
                    ENC: AES-GCM-256
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODE 2: RECOVERY STEP 1 ================= */}
        {mode === 'recovery-step1' && (
          <div className="space-y-5 animate-page-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onChangeMode('login')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6E6E] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Portal Login</span>
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-[#0D6E6E]" />
                Zona Otentikasi Terproteksi RBAC
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Instructions & Quick Copy */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0B1E33] text-white text-[10.5px] font-bold tracking-wider uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                      PROTOKOL PEMULIHAN RESMI
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      v1.0.4-LTS
                    </span>
                  </div>

                  <div>
                    <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">
                      Pemulihan Akses Akun Petugas Perpustakaan
                    </h1>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Layanan terpusat bagi pustakawan dan administrator untuk
                      mengatur ulang kata sandi atau memulihkan token otentikasi
                      terminal meja sirkulasi.
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {[
                      {
                        num: '01',
                        title: 'Verifikasi Identitas Resmi',
                        desc: 'Masukkan NIP petugas resmi atau email kedinasan terdaftar yang tercatat dalam direktori staf perpustakaan.',
                      },
                      {
                        num: '02',
                        title: 'Tautan Reset & Kode Pengaman',
                        desc: 'Sistem mengirimkan instruksi bertanda tangan digital atau kode verifikasi OTP 6-digit ke kanal komunikasi kedinasan.',
                      },
                      {
                        num: '03',
                        title: 'Pembuatan Kunci Kredensial Baru',
                        desc: 'Tetapkan kata sandi baru yang memenuhi standar keamanan RBAC (Role-Based Access Control) PustakaModern.',
                      },
                    ].map((step) => (
                      <div key={step.num} className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-700 shrink-0">
                          {step.num}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {step.title}
                          </div>
                          <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helpdesk Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Helpdesk IT Perpustakaan Siaga (Ekstensi 4022)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0D6E6E] text-[10.5px] font-semibold">
                        Operasional 07:30 - 21:00
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
                      Jika akun terkunci karena salah sandi 5 kali berturut-turut
                      pada terminal peminjaman, hubungi Administrator Sistem
                      langsung untuk reset manual via konsol internal.
                    </p>
                  </div>
                </div>

                {/* Quick Copy Staff Profiles */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold tracking-wider uppercase text-slate-500">
                      PROFIL PETUGAS (UJI COBA CEPAT)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D6E6E]">
                      <Copy className="w-3 h-3" />
                      1-Klik Salin
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setRecoveryInput(
                            lookupMethod === 'email' ? acc.email : acc.id
                          );
                          setCopiedId(acc.id);
                          setStep1Error(null);
                          window.setTimeout(() => setCopiedId(null), 1500);
                        }}
                        className="p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-[#0D6E6E]/50 hover:bg-teal-50/35 transition-all flex items-center justify-between gap-2.5 text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#0B1E33] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {acc.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {acc.fullName}
                            </div>
                            <div className="text-[10.5px] font-mono text-slate-500 truncate">
                              {copiedId === acc.id
                                ? 'Disalin ke formulir'
                                : `NIP: ${acc.id}`}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Recovery Step 1 Form */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
                  <form onSubmit={handleStep1Submit} className="space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D6E6E] flex items-center justify-center">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-extrabold text-slate-900">
                          Formulir Pemulihan
                        </h2>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#0D6E6E] text-[11px] font-bold">
                        Langkah 1 dari 2
                      </span>
                    </div>

                    {/* Email vs NIP Toggle */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLookupMethod('email');
                          if (foundStep1Account) {
                            setRecoveryInput(foundStep1Account.email);
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          lookupMethod === 'email'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Email Kedinasan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLookupMethod('nip');
                          if (foundStep1Account) {
                            setRecoveryInput(foundStep1Account.id);
                          }
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          lookupMethod === 'nip'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        NIP / ID Petugas
                      </button>
                    </div>

                    {/* Recovery Identifier Input */}
                    <div>
                      <label
                        htmlFor="recovery-identifier"
                        className="block text-xs font-bold text-slate-800 mb-1.5"
                      >
                        {lookupMethod === 'email'
                          ? 'Alamat Email Kedinasan'
                          : 'NIP / ID Petugas Sirkulasi'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="recovery-identifier"
                          type="text"
                          value={recoveryInput}
                          onChange={(e) => {
                            setRecoveryInput(e.target.value);
                            setStep1Error(null);
                          }}
                          placeholder={
                            lookupMethod === 'email'
                              ? 'siti.rahmawati@pustakamodern.id'
                              : 'PST-2026-088'
                          }
                          className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                        />
                        {recoveryInput && (
                          <button
                            type="button"
                            onClick={() => setRecoveryInput('')}
                            aria-label="Bersihkan kolom identitas"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {foundStep1Account ? (
                        <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200/80 px-3 py-2 flex items-center gap-2 text-xs font-semibold text-[#0D6E6E]">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            Akun Ditemukan • {foundStep1Account.fullName} (
                            {foundStep1Account.roleLabel} Aktif)
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-500">
                          Masukkan email dinas atau NIP yang terdaftar di sistem.
                        </div>
                      )}
                    </div>

                    {step1Error && (
                      <div
                        role="alert"
                        className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{step1Error}</span>
                      </div>
                    )}

                    {/* Delivery Channel Radios */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-bold text-slate-800">
                        Metode Pengiriman Tautan / Kode Reset
                      </div>

                      <label
                        className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          deliveryChannel === 'email'
                            ? 'bg-emerald-50/40 border-[#0D6E6E]'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="deliveryChannel"
                            checked={deliveryChannel === 'email'}
                            onChange={() => setDeliveryChannel('email')}
                            className="text-[#0D6E6E] focus:ring-[#0D6E6E]"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              Kirim Tautan Reset via Email Dinas
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {foundStep1Account?.email ||
                                'siti.rahmawati@pustakamodern.id'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                          15 Menit
                        </span>
                      </label>

                      <label
                        className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          deliveryChannel === 'otp'
                            ? 'bg-emerald-50/40 border-[#0D6E6E]'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="deliveryChannel"
                            checked={deliveryChannel === 'otp'}
                            onChange={() => setDeliveryChannel('otp')}
                            className="text-[#0D6E6E] focus:ring-[#0D6E6E]"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Kirim Kode OTP via WhatsApp / SMS</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Nomor Resmi:{' '}
                              {foundStep1Account?.maskedPhone ||
                                '0812-****-4821'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#0D6E6E] whitespace-nowrap">
                          Instant
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Kirim Instruksi Pemulihan Akses</span>
                      <ArrowRight className="w-4 h-4 text-teal-300" />
                    </button>

                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                      <button
                        type="button"
                        onClick={() => onChangeMode('login')}
                        className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Ingat kata sandi Anda?{' '}
                          <strong className="text-[#0D6E6E]">
                            Kembali ke Login
                          </strong>
                        </span>
                      </button>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0D6E6E]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Helpdesk IT Ext. 4022
                      </span>
                    </div>
                  </form>
                </div>

                {/* ISO Notice */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-start gap-3 text-[11.5px] text-slate-600">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">
                      Standar Keamanan Perpustakaan ISO 27001:
                    </strong>{' '}
                    Tautan pemulihan hanya berlaku 1 kali dan otomatis
                    kedaluwarsa dalam rentang 15 menit demi mencegah eskalasi
                    hak istimewa sirkulasi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 3: RECOVERY STEP 2 (NEW PASSWORD & VALIDATION) ================= */}
        {mode === 'recovery-step2' && (
          <div className="space-y-5 animate-page-in">
            {/* Sub-header Breadcrumb & Session Timer */}
            <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeMode('recovery-step1')}
                  className="inline-flex items-center gap-1.5 font-bold text-[#0D6E6E] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Langkah 1 (Verifikasi Identitas)</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-semibold text-slate-600">
                  Penetapan Kredensial Baru
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <span>Sesi Aktif: 11m 27s</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 font-mono font-semibold text-slate-700">
                  Token: #TK-9921-AZ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Staff Verification & NIST Audit Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0B1E33] text-white text-[10.5px] font-bold tracking-wider uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                      PROTOKOL PEMULIHAN RESMI
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      v1.0.4-LTS
                    </span>
                  </div>

                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                      Penetapan Kunci Akses &amp; Kata Sandi Baru
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Kredensial baru akan langsung disinkronkan ke seluruh
                      terminal meja sirkulasi perpustakaan secara terenkripsi
                      end-to-end.
                    </p>
                  </div>

                  {/* Verified Staff Box */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/90 p-3.5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                        IDENTITAS STAF TERVERIFIKASI
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-[#0D6E6E]">
                        <CheckCircle2 className="w-3 h-3" />
                        OTP Sah &amp; Tervalidasi
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#0B1E33] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {recoveryAccount.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            {recoveryAccount.fullName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10.5px] font-bold text-slate-600">
                            {recoveryAccount.id}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5">
                          {recoveryAccount.roleLabel} (
                          {recoveryAccount.stationLabel})
                        </div>
                        <div className="text-[11px] font-medium text-[#0D6E6E] mt-0.5">
                          {recoveryAccount.email}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Tiket Otorisasi:{' '}
                        <strong className="font-mono text-slate-800">
                          #OTP-882194
                        </strong>
                      </span>
                      <span className="font-bold text-[#0D6E6E]">
                        Tervalidasi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit Kebijakan Kata Sandi Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#0D6E6E]" />
                      <h2 className="text-xs font-bold text-slate-900">
                        Audit Kebijakan Kata Sandi
                      </h2>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10.5px] font-semibold text-slate-600">
                      NIST SP 800-63B
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {[
                      {
                        label: 'Minimal 8 Karakter (Rekomendasi 12+)',
                        ok: policyEval.checks.minLength,
                        failBadge: `Gagal (${newPassword.length} Kar.)`,
                      },
                      {
                        label: 'Kombinasi Huruf Besar & Kecil (A-Z, a-z)',
                        ok: policyEval.checks.upperAndLower,
                        failBadge: 'Belum Kombinasi',
                      },
                      {
                        label: 'Mengandung Angka (0-9)',
                        ok: policyEval.checks.hasDigit,
                        failBadge: 'Tidak Ada',
                      },
                      {
                        label: 'Simbol Khusus (!@#$%^&*)',
                        ok: policyEval.checks.hasSpecialChar,
                        failBadge: 'Tidak Ada',
                      },
                      {
                        label: 'Tidak sama dengan 3 kata sandi terakhir',
                        ok: policyEval.checks.notInHistory,
                        failBadge: 'Sama Riwayat',
                      },
                    ].map((rule) => {
                      const activeInput = newPassword.length > 0 || step2SubmitAttempted;
                      return (
                        <li
                          key={rule.label}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-colors ${
                            !activeInput
                              ? 'bg-slate-50/70 border-slate-200/70 text-slate-600'
                              : rule.ok
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-rose-50/80 border-rose-200 text-rose-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {!activeInput ? (
                              <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                            ) : rule.ok ? (
                              <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span className="truncate font-medium">
                              {rule.label}
                            </span>
                          </div>
                          {activeInput && (
                            <span
                              className={`text-[10.5px] font-bold whitespace-nowrap ${
                                rule.ok ? 'text-[#0D6E6E]' : 'text-rose-600'
                              }`}
                            >
                              {rule.ok ? 'Lolos' : rule.failBadge}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {/* Entropy Gauge */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-3.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        ENTROPI KUNCI TERDETEKSI
                      </div>
                      <div
                        className={`text-xl font-extrabold tabular-nums mt-0.5 ${
                          policyEval.entropyBits >= 45
                            ? 'text-[#0D6E6E]'
                            : newPassword.length > 0
                              ? 'text-rose-600'
                              : 'text-slate-700'
                        }`}
                      >
                        {policyEval.entropyBits} bits
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Ambang minimum meja sirkulasi: 45 bits
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-extrabold tabular-nums ${
                        policyEval.entropyBits >= 45
                          ? 'border-[#0D6E6E] text-[#0D6E6E] bg-emerald-50'
                          : newPassword.length > 0
                            ? 'border-rose-500 text-rose-600 bg-rose-50'
                            : 'border-slate-200 text-slate-500 bg-white'
                      }`}
                    >
                      {policyEval.entropyPercent}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Right New Password Card */}
              <div className="lg:col-span-7 space-y-4">
                {showStep2ValidationError && (
                  <div
                    role="alert"
                    className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 animate-slide-down"
                  >
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-extrabold text-rose-800">
                        Validasi Gagal: Kata sandi terlalu lemah atau
                        konfirmasi kata sandi tidak cocok.
                      </div>
                      <p className="text-rose-700 mt-1">
                        Sistem sirkulasi menolak penyimpanan. Silakan penuhi
                        kriteria kompleksitas NIST SP 800-63B dan pastikan kedua
                        kolom kata sandi bernilai identik.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
                  <form onSubmit={handleStep2Submit} className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0B1E33] text-white flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-teal-300" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">
                            Buat Kata Sandi Baru
                          </h2>
                          <p className="text-[11.5px] text-slate-500">
                            Langkah terakhir untuk mengaktifkan kembali terminal
                            Anda
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#0D6E6E] text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Langkah 2 dari 2 (Final)
                      </span>
                    </div>

                    {/* New Password Input */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="new-password-input"
                          className="text-xs font-bold text-slate-800"
                        >
                          Kata Sandi Baru <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Enkripsi SHA-256 Client-Side
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="new-password-input"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter dengan huruf besar, angka & simbol"
                          className={`w-full h-11 pl-10 pr-11 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                            newPassword.length > 0 && !policyEval.isValidPolicy
                              ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                              : 'border-slate-200 bg-white focus:border-[#0D6E6E] focus:ring-[#0D6E6E]/15'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((p) => !p)}
                          aria-label={
                            showNewPassword
                              ? 'Sembunyikan kata sandi baru'
                              : 'Tampilkan kata sandi baru'
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Strength Meter Card */}
                      <div className="mt-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">
                            Kekuatan Kunci:
                          </span>
                          <span
                            className={`font-bold ${
                              policyEval.scoreOutOf4 >= 4
                                ? 'text-[#0D6E6E]'
                                : policyEval.scoreOutOf4 === 3
                                  ? 'text-teal-700'
                                  : newPassword.length > 0
                                    ? 'text-rose-600'
                                    : 'text-slate-500'
                            }`}
                          >
                            {newPassword.length === 0
                              ? 'Belum Diisi'
                              : policyEval.scoreOutOf4 >= 4
                                ? 'Sangat Kuat (Kompilasi Standar)'
                                : `${policyEval.strengthLabel} (Skor ${policyEval.scoreOutOf4}/4)`}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((seg) => (
                            <span
                              key={seg}
                              className={`h-1.5 rounded-full transition-colors ${
                                newPassword.length === 0
                                  ? 'bg-slate-200'
                                  : seg <= policyEval.scoreOutOf4
                                    ? policyEval.scoreOutOf4 >= 3
                                      ? 'bg-[#0D6E6E]'
                                      : 'bg-rose-500'
                                    : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        {newPassword.length > 0 && !policyEval.isValidPolicy ? (
                          <div className="text-[11px] text-rose-700">
                            Saran sistem: Hindari kata umum seperti &ldquo;rahasia&rdquo;. Gunakan frasa sandi kuat (misal:{' '}
                            <span className="font-mono font-bold">
                              Bintang#Pustaka89!
                            </span>
                            ).
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#0D6E6E]">
                            {policyEval.isValidPolicy
                              ? 'Kekuatan kata sandi memenuhi seluruh standar operasional sistem sirkulasi terpusat.'
                              : 'Kombinasikan huruf besar, huruf kecil, angka, dan simbol.'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirm New Password Input */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="confirm-password-input"
                          className="text-xs font-bold text-slate-800"
                        >
                          Konfirmasi Kata Sandi Baru{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        {confirmPassword.length > 0 && (
                          <span
                            className={`text-[11px] font-bold ${
                              policyEval.isConfirmMatch
                                ? 'text-[#0D6E6E]'
                                : 'text-rose-600'
                            }`}
                          >
                            {policyEval.isConfirmMatch
                              ? '✓ Kata sandi cocok'
                              : '✕ Tidak Cocok'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="confirm-password-input"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ketik ulang kata sandi baru"
                          className={`w-full h-11 pl-10 pr-11 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                            confirmPassword.length > 0 &&
                            !policyEval.isConfirmMatch
                              ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200'
                              : 'border-slate-200 bg-white focus:border-[#0D6E6E] focus:ring-[#0D6E6E]/15'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          aria-label={
                            showConfirmPassword
                              ? 'Sembunyikan konfirmasi kata sandi'
                              : 'Tampilkan konfirmasi kata sandi'
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {confirmPassword.length > 0 && (
                        <div
                          className={`mt-2 rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2 ${
                            policyEval.isConfirmMatch
                              ? 'bg-emerald-50 border border-emerald-200 text-[#0D6E6E]'
                              : 'bg-rose-50 border border-rose-200 text-rose-700'
                          }`}
                        >
                          {policyEval.isConfirmMatch ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>
                                Kedua kata sandi sesuai. Siap disimpan ke basis
                                data aman.
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>
                                Konfirmasi kata sandi tidak cocok dengan kata
                                sandi baru.
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Security Options */}
                    <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3.5 space-y-3">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={logoutOtherTerminals}
                          onChange={(e) =>
                            setLogoutOtherTerminals(e.target.checked)
                          }
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0D6E6E] focus:ring-[#0D6E6E]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Keluarkan akun dari semua terminal sirkulasi lain
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Memutuskan token aktif di Meja Peminjaman Lantai 1
                            &amp; Gedung Arsip B secara otomatis.
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendAuditEmail}
                          onChange={(e) => setSendAuditEmail(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0D6E6E] focus:ring-[#0D6E6E]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Kirim salinan log audit pergantian kata sandi ke
                            email dinas
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Bukti resmi perubahan sandi dikirimkan ke{' '}
                            <span className="font-mono text-slate-700">
                              {recoveryAccount.email}
                            </span>
                            .
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={!policyEval.canSubmit}
                        className={`flex-1 h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                          policyEval.canSubmit
                            ? 'bg-[#0B1E33] hover:bg-[#132C4A] text-white cursor-pointer shadow-sm'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Simpan Kata Sandi &amp; Masuk ke Meja Layanan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeMode('login')}
                        className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                      >
                        Batal &amp; Keluar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 4: POST-RESET RE-LOGIN ================= */}
        {mode === 'relogin-success' && (
          <div className="space-y-5 animate-page-in">
            {reloginBannerOpen && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0D6E6E] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-emerald-950">
                      Kata sandi Anda telah berhasil diubah!
                    </div>
                    <div className="text-emerald-800 mt-0.5">
                      Silakan masuk kembali menggunakan kredensial baru Anda
                      untuk memvalidasi akses meja sirkulasi.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[11px] font-bold text-[#0D6E6E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Sesi Enkripsi Siap
                  </span>
                  <button
                    type="button"
                    onClick={() => setReloginBannerOpen(false)}
                    aria-label="Tutup pemberitahuan"
                    className="p-1 text-emerald-700 hover:text-emerald-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Dark Terminal Summary Card */}
              <div className="lg:col-span-5 rounded-2xl bg-[#0B1E33] text-white p-6 flex flex-col justify-between space-y-6 shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-white/10 font-mono text-[11px] font-semibold text-teal-300">
                      TRM-DESK-A // v1.0.4-LTS
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10.5px] font-semibold text-slate-300">
                      TLS 1.3 Strict
                    </span>
                  </div>

                  <div>
                    <div className="text-[10.5px] font-bold tracking-wider uppercase text-teal-400">
                      • STASIUN KERJA SIRKULASI TERPUSAT
                    </div>
                    <h1 className="text-[22px] font-extrabold tracking-tight mt-1 leading-snug">
                      Portal Autentikasi Pengelola Koleksi
                    </h1>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      Otorisasi akses staf bertingkat untuk peminjaman,
                      pengembalian otomatis, dan kurasi katalog berbasis standar
                      CIDOC-CRM.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Node Sirkulasi</span>
                        <span className="text-emerald-400 font-mono">18ms</span>
                      </div>
                      <div className="mt-1 text-xs font-bold">
                        ONLINE • Laten Rendah
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Sinkronisasi Katalog</span>
                        <span className="text-teal-300 font-bold">100%</span>
                      </div>
                      <div className="mt-1 text-xs font-bold">
                        Tervalidasi ISO 27001
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Reset Profile Box */}
                <div className="rounded-xl bg-white text-slate-900 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={recoveryAccount.avatarUrl}
                        alt={recoveryAccount.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold truncate">
                          {recoveryAccount.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {recoveryAccount.roleLabel}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#0D6E6E] text-[10.5px] font-bold whitespace-nowrap">
                      • Sandi Baru Aktif
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-800">
                      ID: {recoveryAccount.id}
                    </span>
                    <span className="text-[11px] text-[#0D6E6E] font-semibold">
                      Baru saja diganti
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickFill(recoveryAccount)}
                    className="w-full py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-bold text-[#0D6E6E] transition-colors cursor-pointer"
                  >
                    Terapkan Kredensial Baru (1-Klik)
                  </button>
                </div>
              </div>

              {/* Right Operational Re-login Card */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <div className="text-[10.5px] font-bold tracking-wider uppercase text-slate-500 mb-2">
                      PILIH RUANG KERJA OPERASIONAL
                    </div>
                    <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 gap-1">
                      {(
                        [
                          { id: 'pustakawan', label: 'Pustakawan' },
                          { id: 'supervisor', label: 'Supervisor' },
                          { id: 'sysadmin', label: 'Sysadmin' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(tab.id);
                            setLoginError(null);
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            selectedRole === tab.id
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loginError && (
                    <div
                      role="alert"
                      className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-xs text-rose-800 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="relogin-id"
                        className="text-xs font-bold text-slate-800"
                      >
                        NIP / ID Petugas Sirkulasi *
                      </label>
                      <span className="text-[11px] font-semibold text-[#0D6E6E]">
                        Format Valid
                      </span>
                    </div>
                    <input
                      id="relogin-id"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="relogin-password"
                        className="text-xs font-bold text-slate-800"
                      >
                        Kata Sandi Baru *
                      </label>
                      <span className="text-[11px] font-semibold text-[#0D6E6E]">
                        • Kredensial Baru Terverifikasi
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        id="relogin-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-11 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((p) => !p)}
                        aria-label="Toggle tampilan kata sandi"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#0D6E6E] font-semibold">
                        Tingkat Keamanan: {loginStrengthEval.strengthLabel} (
                        {password.length} Karakter)
                      </span>
                      <button
                        type="button"
                        onClick={() => onChangeMode('recovery-step1')}
                        className="text-slate-500 hover:text-[#0D6E6E] font-semibold"
                      >
                        Bantuan Masuk?
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0D6E6E]"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">
                        Pertahankan sesi di terminal ini (8 jam)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Otomatis terhubung ke Shift Meja Sirkulasi A hingga
                        pukul 17:00 WIB.
                      </div>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Masuk ke Meja Layanan Perpustakaan</span>
                    <ArrowRight className="w-4 h-4 text-teal-300" />
                  </button>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Kepatuhan: ISO/IEC 27001 • CIDOC CRM Library Standard
                    </span>
                    <span className="font-mono">IP Terminal: 192.168.10.42</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Institutional Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-3.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>
            © 2026 PustakaModern. Hak Cipta Dilindungi Undang-Undang.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Pusat Bantuan &amp; Helpdesk: ext. 4022</span>
          <span>•</span>
          <span className="text-[#0D6E6E] font-semibold">
            helpdesk@pustakamodern.id
          </span>
        </div>
      </footer>

      {/* ================= PORTALED PASSWORD SUCCESS MODAL ================= */}
      {successModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px] animate-backdrop-enter">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-updated-title"
              className="w-full max-w-md bg-white rounded-2xl border-t-4 border-t-[#0D6E6E] border border-slate-200 shadow-2xl overflow-hidden animate-modal-enter"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#0D6E6E] flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>

                <div>
                  <h2
                    id="password-updated-title"
                    className="text-xl font-extrabold text-slate-900"
                  >
                    Kata Sandi Berhasil Diperbarui!
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Kredensial keamanan untuk akun{' '}
                    <strong className="text-slate-900">
                      {recoveryAccount.fullName} ({recoveryAccount.id})
                    </strong>{' '}
                    telah tersimpan aman dengan enkripsi ganda{' '}
                    <span className="font-mono font-bold text-[#0D6E6E] bg-teal-50 px-1.5 py-0.5 rounded">
                      Argon2id + SHA-256
                    </span>
                    .
                  </p>
                </div>

                {/* Security Audit Receipt Box */}
                <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/90 p-3.5 text-left space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                    <span>LEMBAR AUDIT TRANSAKSI KEAMANAN</span>
                    <span className="text-[#0D6E6E]">• Terverifikasi</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <div className="text-slate-400">ID &amp; Nama Petugas</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {recoveryAccount.id} ({recoveryAccount.fullName})
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Waktu Sinkronisasi</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        26 Nov 2026, 15:42 WIB
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Status Terminal Aktif</div>
                      <div className="font-bold text-amber-700 mt-0.5">
                        {logoutOtherTerminals
                          ? 'Sesi lama diputus paksa (Logged Out)'
                          : 'Terminal aktif dipertahankan'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Notifikasi Bukti Audit</div>
                      <div className="font-bold text-slate-800 mt-0.5 truncate">
                        {sendAuditEmail
                          ? recoveryAccount.email
                          : 'Log internal tersimpan'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Countdown Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11.5px] text-slate-600">
                    <span>
                      Mengalihkan ke Portal Login dalam{' '}
                      <strong className="tabular-nums text-slate-900">
                        {redirectCountdown}
                      </strong>{' '}
                      detik...
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {redirectCountdown}.0s
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#0D6E6E] transition-all duration-700"
                      style={{
                        width: `${((4 - redirectCountdown) / 3) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleImmediateRelogin}
                    className="flex-1 h-10 px-4 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Buka Portal Login Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectIntoDesk}
                    className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    Meja Sirkulasi
                  </button>
                </div>
              </div>

              <div className="px-6 py-2.5 bg-[#F8FAFC] border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                <span>Hash Protokol: Blake2b-Digest-OK</span>
                <span>Otentikasi Aman PustakaModern v1.0</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
