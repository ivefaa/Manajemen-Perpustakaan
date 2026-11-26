import React, { useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Save,
  ShieldCheck,
  Sliders,
  Users,
} from 'lucide-react';
import type { SystemSecuritySettings } from '../data/authData';
import type { StaffAccount } from '../types/library';
import { formatRupiah } from '../utils/libraryRules';

interface PengaturanViewProps {
  currentAccount: StaffAccount;
  settings: SystemSecuritySettings;
  onUpdateSettings: (next: SystemSecuritySettings) => void;
  onOpenSecurityPasswordFlow: () => void;
  onLogout: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  currentAccount,
  settings,
  onUpdateSettings,
  onOpenSecurityPasswordFlow,
  onLogout,
}) => {
  const [draft, setDraft] = useState<SystemSecuritySettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(draft);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Konfigurasi &amp; Akun /{' '}
            <span className="text-[#0D6E6E]">
              Pengaturan Sistem &amp; Hak Akses
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Pengaturan Sistem &amp; Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur parameter aturan sirkulasi (BR-01 s/d BR-07), kebijakan sesi
            terminal, dan matriks otoritas pengguna.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSecurityPasswordFlow}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#0D6E6E]" />
            <span>Ubah Kata Sandi</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Terminal</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-[#0D6E6E] flex items-center gap-2 animate-slide-down"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Konfigurasi sistem dan kebijakan keamanan terminal berhasil
            disimpan.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Circulation & Security Parameters */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0D6E6E]" />
              <h2 className="text-sm font-extrabold text-slate-900">
                Kebijakan Operasional &amp; Sesi Terminal
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0D6E6E] text-[10.5px] font-bold">
              ISO 27001
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="setting-fine-rate"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Tarif Denda / Hari (Rp)
              </label>
              <input
                id="setting-fine-rate"
                type="number"
                min={500}
                step={500}
                value={draft.dailyFineRate}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    dailyFineRate: Math.max(500, Number(e.target.value) || 1000),
                  }))
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold tabular-nums focus:outline-none focus:border-[#0D6E6E]"
              />
              <div className="text-[10.5px] text-slate-400 mt-1">
                Aktif: {formatRupiah(draft.dailyFineRate)}/hari
              </div>
            </div>

            <div>
              <label
                htmlFor="setting-loan-days"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Durasi Pinjam (Hari)
              </label>
              <input
                id="setting-loan-days"
                type="number"
                min={1}
                max={30}
                value={draft.defaultLoanDays}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    defaultLoanDays: Math.max(
                      1,
                      Math.min(30, Number(e.target.value) || 7)
                    ),
                  }))
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold tabular-nums focus:outline-none focus:border-[#0D6E6E]"
              />
            </div>

            <div>
              <label
                htmlFor="setting-timeout"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Timeout Sesi (Menit)
              </label>
              <input
                id="setting-timeout"
                type="number"
                min={5}
                max={120}
                value={draft.sessionTimeoutMinutes}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    sessionTimeoutMinutes: Math.max(
                      5,
                      Math.min(120, Number(e.target.value) || 30)
                    ),
                  }))
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold tabular-nums focus:outline-none focus:border-[#0D6E6E]"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              {
                key: 'enforceTwoFactor' as const,
                title: 'Wajibkan Verifikasi OTP saat Reset Kata Sandi',
                desc: 'Mengirimkan tiket otorisasi ke email kedinasan atau WhatsApp terdaftar.',
              },
              {
                key: 'autoLockCashDrawer' as const,
                title: 'Kunci Laci Kasir Otomatis Setelah Tutup Buku',
                desc: 'Memerlukan otorisasi ulang PIN kasir untuk membuka rekonsiliasi shift baru.',
              },
              {
                key: 'requireOverdueReceiptPrint' as const,
                title: 'Wajib Cetak / Catat Kwitansi Pembayaran Denda',
                desc: 'Sesuai BR-07: setiap pelunasan denda terlambat harus menghasilkan KWT unik.',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft[item.key]}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [item.key]: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0D6E6E]"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5 text-teal-300" />
              <span>Simpan Kebijakan Sistem</span>
            </button>
          </div>
        </form>

        {/* Right: RBAC Matrix */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0D6E6E]" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  Matriks Hak Akses (Role-Based Access Control)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Masuk sebagai: <strong>{currentAccount.roleLabel}</strong>
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[10.5px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">Modul Layanan</th>
                    <th className="py-2.5 px-3 text-center">Pustakawan</th>
                    <th className="py-2.5 px-3 text-center">Supervisor</th>
                    <th className="py-2.5 px-3 text-center">SysAdmin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      module: 'Katalog & Detail Buku',
                      p: true,
                      s: true,
                      a: true,
                    },
                    {
                      module: 'Peminjaman & Pengembalian Atomik',
                      p: true,
                      s: true,
                      a: true,
                    },
                    {
                      module: 'Registrasi Buku Baru (FR-01)',
                      p: true,
                      s: true,
                      a: true,
                    },
                    {
                      module: 'Tutup Buku Kas & Berita Acara',
                      p: true,
                      s: true,
                      a: true,
                    },
                    {
                      module: 'Reset Sandi Darurat & RBAC',
                      p: false,
                      s: true,
                      a: true,
                    },
                  ].map((row) => (
                    <tr key={row.module}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {row.module}
                      </td>
                      {[row.p, row.s, row.a].map((allowed, idx) => (
                        <td key={idx} className="py-2.5 px-3 text-center">
                          {allowed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-[#0D6E6E]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D6E6E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">
                Audit Enkripsi &amp; Integritas Terminal Aktif
              </div>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Seluruh pertukaran kredensial menggunakan TLS 1.3 dengan
                penyimpanan hash Argon2id + SHA-256. Gunakan tombol{' '}
                <strong>Keluar Terminal</strong> saat berpindah tugas antar
                shift.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
