import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck2,
  Lock,
  Printer,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import type { FineRecord } from '../types/library';
import { computeCashBreakdown, formatRupiah } from '../utils/libraryRules';

interface LaporanDendaViewProps {
  fines: FineRecord[];
  processedReturnsCount: number;
  activeLoansCount: number;
  shiftClosed: boolean;
  onCloseShiftCash: () => void;
  onOpenBeritaAcara: () => void;
  onGoToKatalog: () => void;
}

type FineFilterTab = 'all' | 'paid' | 'pending';

export const LaporanDendaView: React.FC<LaporanDendaViewProps> = ({
  fines,
  processedReturnsCount,
  activeLoansCount,
  shiftClosed,
  onCloseShiftCash,
  onOpenBeritaAcara,
  onGoToKatalog,
}) => {
  const [fineFilter, setFineFilter] = useState<FineFilterTab>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('Hari Ini (26 Nov 2026)');
  const [showReconcileModal, setShowReconcileModal] = useState(false);

  const totalFineAmount = useMemo(
    () => fines.reduce((acc, f) => acc + f.fineAmount, 0),
    [fines]
  );

  const paidFines = fines.filter((f) => f.status === 'Lunas Tunai');
  const pendingFines = fines.filter((f) => f.status === 'Tertunda');

  const visibleFines =
    fineFilter === 'all'
      ? fines
      : fineFilter === 'paid'
      ? paidFines
      : pendingFines;

  const cashBreakdown = useMemo(
    () => computeCashBreakdown(totalFineAmount),
    [totalFineAmount]
  );

  const lateCount = fines.length;
  const totalProcessedReturns = 15 + processedReturnsCount;
  const onTimeCount = Math.max(0, totalProcessedReturns - lateCount);
  const complianceRate =
    activeLoansCount + totalProcessedReturns > 0
      ? ((37 / 40) * 100).toFixed(1)
      : '92.5';

  const avgLateDays =
    fines.length > 0
      ? (
          fines.reduce((acc, f) => acc + f.overdueDays, 0) / fines.length
        ).toFixed(1)
      : '0.0';

  const handleDownloadCsv = () => {
    const header =
      'No Kwitansi,ID Transaksi,ID Anggota,Nama Peminjam,ID Buku,Judul Buku,Hari Terlambat,Denda (Rp),Status\n';
    const rows = fines
      .map(
        (f) =>
          `${f.receiptId},${f.transactionId},${f.memberId},"${f.memberName}",${f.bookId},"${f.bookTitle}",${f.overdueDays},${f.fineAmount},"${f.status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rekap-denda-pustakamodern-20261126.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCloseShiftClick = () => {
    if (!shiftClosed) {
      onCloseShiftCash();
    }
    setShowReconcileModal(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[#0D6E6E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D6E6E]" />
              Modul Akuntansi &amp; Log Sirkulasi
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-500">
              AUDIT-RUN: #20261126-D
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
            Laporan Ringkasan Denda &amp; Sirkulasi Harian
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500 max-w-2xl">
            Rekapitulasi penerimaan denda keterlambatan, tingkat kepatuhan
            pengembalian, dan aktivitas perputaran stok buku per 26 November 2026.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Pilih periode laporan"
              className="h-9 pl-8 pr-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0D6E6E]"
            >
              <option>Hari Ini (26 Nov 2026)</option>
              <option>Minggu Ini (20–26 Nov 2026)</option>
              <option>Bulan November 2026</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Rekap</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 px-4 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A] inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-teal-300" />
            <span>Cetak Laporan Kasir</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL DENDA DITERIMA
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D6E6E] flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatRupiah(totalFineAmount)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
              ↗ +12% dr kemarin
            </span>
            <span className="text-slate-500 tabular-nums">
              {fines.length} transaksi diselesaikan
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
              KEPATUHAN WAKTU
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D6E6E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {complianceRate}%
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0D6E6E] font-semibold">
              Sangat Baik
            </span>
            <span className="text-slate-500 tabular-nums">37 / 40 bebas denda</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
              PENGEMBALIAN DIPROSES
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalProcessedReturns}
            </span>
            <span className="text-xs font-medium text-slate-500">Buku</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Stok pulih atomik (BR-05/07)</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {onTimeCount} Tepat • {lateCount} Telat
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-wider text-slate-500 uppercase">
              PEMINJAMAN AKTIF
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {34 + activeLoansCount}
            </span>
            <span className="text-xs font-medium text-slate-500">Buku</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">
              Perputaran Sehat
            </span>
            <span className="text-slate-500">3 tempo esok hari</span>
          </div>
        </div>
      </div>

      {/* Middle 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Fines Table */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tabel Rincian Penerimaan Denda &amp; Keterlambatan
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Buku fisik diterima kembali di meja kasir sirkulasi dengan
                perhitungan tarif harian.
              </p>
            </div>
            <div className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9] self-start sm:self-auto shrink-0">
              {(
                [
                  { id: 'all', label: `Semua (${fines.length})` },
                  { id: 'paid', label: `Lunas Tunai (${paidFines.length})` },
                  { id: 'pending', label: `Tertunda (${pendingFines.length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFineFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    fineFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC]/80 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="py-2.5 px-4">NO. KWITANSI / TRANSAKSI</th>
                  <th className="py-2.5 px-4">PEMINJAM</th>
                  <th className="py-2.5 px-4">JUDUL BUKU</th>
                  <th className="py-2.5 px-4 text-right">TERLAMBAT / DENDA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {visibleFines.map((fine) => (
                  <tr key={fine.receiptId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {fine.receiptId}
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-400">
                        {fine.transactionId}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {fine.memberName}
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-400">
                        ID: {fine.memberId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {fine.bookTitle}
                      </div>
                      <div className="font-mono text-[10.5px] font-semibold text-[#0D6E6E]">
                        {fine.bookId}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold tabular-nums">
                        +{fine.overdueDays} hr • {formatRupiah(fine.fineAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-[#F8FAFC] border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D6E6E]" />
              <span>
                Seluruh {paidFines.length} transaksi denda lunas tervalidasi oleh
                Pustakawan Jaga: Siti R.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-medium text-slate-500">
                Total Penerimaan Kasir:
              </span>
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                {formatRupiah(totalFineAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Charts / Breakdowns */}
        <div className="lg:col-span-5 space-y-4">
          {/* Komposisi Pengembalian Hari Ini */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Komposisi Pengembalian Hari Ini
                </h3>
                <p className="text-[11px] text-slate-500">
                  {totalProcessedReturns} Eksemplar buku berhasil dipulihkan
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
              <div className="bg-[#0D6E6E] h-full" style={{ width: '80%' }} />
              <div className="bg-amber-400 h-full" style={{ width: '10%' }} />
              <div className="bg-rose-600 h-full" style={{ width: '10%' }} />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0D6E6E]" />
                  Tepat Waktu (Bebas Denda)
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {Math.max(0, onTimeCount - 2)} Trx (80%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Jatuh Tempo Hari Ini (H-0)
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  2 Trx (10%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Terlambat (Denda Diterima)
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {lateCount} Trx (10%)
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Rerata Keterlambatan Kasus Telat:
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {avgLateDays} Hari / Kasus
              </span>
            </div>
          </div>

          {/* Distribusi Pemulihan Stok Rak */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribusi Pemulihan Stok Rak
              </h3>
              <p className="text-[11px] text-slate-500">
                Perputaran fisik ke rak per 26 Nov 2026
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Rak A • Fiksi & Sastra Populer', count: 9, pct: 85 },
                { label: 'Rak B • Filsafat & Non-Fiksi', count: 5, pct: 55 },
                { label: 'Rak C • Sastra Klasik Indonesia', count: 4, pct: 45 },
                { label: 'Rak D • Sains & Ensiklopedia', count: 2, pct: 25 },
              ].map((rack) => (
                <div key={rack.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700">
                      {rack.label}
                    </span>
                    <span className="font-bold text-[#0D6E6E] tabular-nums">
                      +{rack.count} Eks
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0D6E6E]"
                      style={{ width: `${rack.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">
                Sinkronisasi Atomik BR-02 &amp; BR-05:
              </strong>{' '}
              Stok buku tersinkron otomatis pada database tanpa selisih antara
              pencatatan fisik dan digital.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dark Cash Reconciliation Bar */}
      <div className="rounded-2xl bg-[#0B1E33] text-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold">
                {shiftClosed
                  ? 'Buku Kas Sirkulasi Hari Ini Telah Ditutup & Disetor'
                  : 'Rekonsiliasi Kas Meja Sirkulasi Siap Ditutup'}
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {shiftClosed ? 'Terkunci & Balanced' : 'Tervalidasi 100%'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
              Kasir Meja Sirkulasi: <strong>Siti Rahmawati</strong> (Shift Pagi –
              Sore) • Saldo kas fisik diterima terhitung:{' '}
              <strong className="text-teal-300">
                {formatRupiah(totalFineAmount)}
              </strong>{' '}
              ({fines.length} transaksi). Seluruh saldo siap disetor ke buku besar
              kas bendahara perpustakaan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenBeritaAcara}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
          >
            Cek Berita Acara
          </button>
          <button
            type="button"
            onClick={handleCloseShiftClick}
            className="px-4 py-2.5 rounded-xl bg-[#7CE4C8] hover:bg-[#66D9BA] text-[#07241C] text-xs font-extrabold inline-flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>
              {shiftClosed
                ? 'Lihat Bukti Tutup Buku Kas'
                : 'Tutup Buku Kas Hari Ini'}
            </span>
          </button>
        </div>
      </div>

      {/* Reconciliation Modal (Screenshot 11) */}
      {showReconcileModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[2px] animate-backdrop-enter"
            onClick={() => setShowReconcileModal(false)}
          >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reconcile-modal-title"
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-modal-enter max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0D6E6E] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2
                      id="reconcile-modal-title"
                      className="text-base sm:text-lg font-extrabold text-slate-900"
                    >
                      Buku Kas Hari Ini Berhasil Ditutup &amp; Direkonsiliasi
                    </h2>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-[#0D6E6E]">
                      • STATUS: KAS DITUTUP (BALANCED / NIHIL SELISIH)
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Berita Acara Rekonsiliasi Kas Meja Sirkulasi{' '}
                      <strong className="font-mono text-slate-700">
                        #BA-20261126-KAS
                      </strong>{' '}
                      • Tanggal: 26 November 2026, 17:00 WIB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReconcileModal(false)}
                  aria-label="Tutup modal rekonsiliasi"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Section 1: Financial Verification */}
              <div className="rounded-xl border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    1. Rekapitulasi Keuangan &amp; Verifikasi Fisik Kasir
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0D6E6E] text-[10.5px] font-bold">
                    100% Cocok
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/70 p-3">
                    <div className="text-[10.5px] text-slate-500">
                      Total Denda di Sistem
                    </div>
                    <div className="mt-1 text-base font-extrabold text-slate-900 tabular-nums">
                      {formatRupiah(totalFineAmount)}
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {fines.length} Kwitansi terlambat
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/70 p-3">
                    <div className="text-[10.5px] text-slate-500">
                      Uang Kas Fisik Dihitung
                    </div>
                    <div className="mt-1 text-base font-extrabold text-[#0D6E6E] tabular-nums">
                      {formatRupiah(totalFineAmount)}
                    </div>
                    <div className="text-[10.5px] text-[#0D6E6E] mt-0.5">
                      Kas laci terhitung lengkap
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-3">
                    <div className="text-[10.5px] text-emerald-700">
                      Selisih Kas (Variance)
                    </div>
                    <div className="mt-1 text-base font-extrabold text-[#0D6E6E] tabular-nums">
                      Rp 0 (Nihil)
                    </div>
                    <div className="text-[10.5px] text-emerald-700 mt-0.5">
                      Tepat &amp; seimbang 100%
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-slate-500 font-medium">
                      Rincian Uang Tunai di Laci Kasir:
                    </span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      Total: {cashBreakdown.totalNotes} Lembar Uang Kertas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cashBreakdown.denominations.map((den) => (
                      <div
                        key={den.value}
                        className="rounded-lg bg-[#F8FAFC] border border-slate-200/80 px-2.5 py-2 flex items-center justify-between text-[11px] tabular-nums"
                      >
                        <span className="text-slate-500">
                          {den.count}× {den.label}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatRupiah(den.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2 & 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/90 p-4 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">
                    2. Rekapitulasi Sirkulasi Shift
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Buku Dikembalikan:</span>
                    <strong className="tabular-nums">
                      {totalProcessedReturns} Eksemplar
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Pemulihan Rak:</span>
                    <strong className="text-[#0D6E6E]">• 100% Masuk Rak</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peminjaman Aktif Berjalan:</span>
                    <strong className="tabular-nums">
                      {34 + activeLoansCount} Eksemplar
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Kwitansi Terbit:</span>
                    <strong className="font-mono text-[#0D6E6E]">
                      KWT-018 s/d {String(77 + Math.max(0, fines.length - 5)).padStart(3, '0')}
                    </strong>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/90 p-4 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">
                    3. Otorisasi &amp; Saksi Berita Acara
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Petugas Kasir Penutup:</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        Siti Rahmawati
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Pustakawan Utama
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Saksi / Verifikator:</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        Hendra Wijaya
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Kepala Unit Sirkulasi
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 rounded-lg bg-[#F8FAFC] border border-slate-200 px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Tanda Tangan Digital</span>
                    <span className="font-mono font-bold text-[#0D6E6E]">
                      VALIDATED_OK
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-sky-50/70 border border-sky-200/80 p-3 text-[11px] text-slate-700 leading-relaxed">
                <strong>Jaminan Kepatuhan Akuntansi Perpustakaan:</strong> Dengan
                penutupan buku ini, transaksi denda per tanggal 26 Nov 2026 dikunci
                secara permanen. Dana tunai sebesar{' '}
                <strong>{formatRupiah(totalFineAmount)}</strong> segera diserahkan ke
                Bendahara Umum Perpustakaan.
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowReconcileModal(false);
                  onGoToKatalog();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Selesai (Kembali ke Dashboard)</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Salinan Digital (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReconcileModal(false);
                    onOpenBeritaAcara();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A] inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-300" />
                  <span>Cetak Berita Acara &amp; Setor</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
