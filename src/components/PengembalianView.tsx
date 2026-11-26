import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Gauge,
  History,
  MonitorCheck,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { LoanTransaction, ReturnHistoryItem } from '../types/library';
import { formatRupiah } from '../utils/libraryRules';

interface PengembalianViewProps {
  activeLoans: LoanTransaction[];
  returnHistory: ReturnHistoryItem[];
  returnedTodayBaselineOffset: number;
  activeLoansBaselineOffset: number;
  onProcessReturn: (transactionId: string) => {
    success: boolean;
    returnedRecord?: ReturnHistoryItem;
  };
  onGoToKatalog: () => void;
}

type ReturnFilterTab = 'all' | 'urgent' | 'today' | 'week';

export const PengembalianView: React.FC<PengembalianViewProps> = ({
  activeLoans,
  returnHistory,
  returnedTodayBaselineOffset,
  activeLoansBaselineOffset,
  onProcessReturn,
  onGoToKatalog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<ReturnFilterTab>('all');
  const [modalRecord, setModalRecord] = useState<ReturnHistoryItem | null>(null);

  const urgentCount = activeLoans.filter(
    (l) => l.overdueDays > 0 || l.isDueToday
  ).length;

  const filteredLoans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeLoans.filter((loan) => {
      const matchesQuery =
        !q ||
        loan.id.toLowerCase().includes(q) ||
        loan.memberId.toLowerCase().includes(q) ||
        loan.memberName.toLowerCase().includes(q) ||
        loan.bookId.toLowerCase().includes(q) ||
        loan.bookTitle.toLowerCase().includes(q);

      const matchesTab =
        filterTab === 'all' ||
        (filterTab === 'urgent' && (loan.overdueDays > 0 || loan.isDueToday)) ||
        (filterTab === 'today' && loan.borrowDate === '2026-11-26') ||
        (filterTab === 'week' && loan.overdueDays === 0);

      return matchesQuery && matchesTab;
    });
  }, [activeLoans, searchQuery, filterTab]);

  const handleReturnClick = (loan: LoanTransaction) => {
    const res = onProcessReturn(loan.id);
    if (res.success && res.returnedRecord) {
      setModalRecord(res.returnedRecord);
    }
  };

  const totalActiveDisplay = activeLoansBaselineOffset + activeLoans.length;
  const totalReturnedTodayDisplay =
    returnedTodayBaselineOffset + returnHistory.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-[#0D6E6E] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D6E6E]" />
            MODUL SIRKULASI (FR-06)
          </div>
          <h1 className="mt-1 text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
            Pengembalian Buku
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
            Kelola pengembalian eksemplar buku aktif dan perbarui stok secara otomatis.
          </p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs self-start sm:self-auto">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D6E6E] flex items-center justify-center">
            <MonitorCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              SISTEM SINKRONISASI
            </div>
            <div className="text-xs font-bold text-[#0D6E6E]">
              • Stok Otomatis (BR-05/BR-07)
            </div>
          </div>
        </div>
      </div>

      {/* Due Soon Alert Banner */}
      {urgentCount > 0 && (
        <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-slide-down">
          <div className="flex items-start sm:items-center gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold">
                Peringatan Tenggat Sirkulasi (Due Soon Alert):
              </span>{' '}
              {urgentCount} transaksi memerlukan pengembalian segera atau telah melewati
              batas tempo peminjaman.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilterTab('urgent')}
            className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[11px] font-bold text-amber-800 hover:bg-amber-100/60 whitespace-nowrap self-start sm:self-auto transition-colors"
          >
            Tampilkan Jatuh Tempo ({urgentCount})
          </button>
        </div>
      )}

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              PEMINJAMAN AKTIF
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalActiveDisplay}
            </span>
            <span className="text-xs font-medium text-slate-500">
              eksemplar berjalan
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-amber-700">
            • Memerlukan pengembalian
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              DIKEMBALIKAN HARI INI
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#0D6E6E] tabular-nums">
              {totalReturnedTodayDisplay}
            </span>
            <span className="text-xs font-medium text-slate-500">
              buku (stok pulih)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-700">
            ↗ 100% terekam akurat
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              RATA-RATA WAKTU TRANSAKSI
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              &lt; 45
            </span>
            <span className="text-xs font-medium text-slate-500">
              detik / pengembalian
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            ✓ Sesuai target sirkulasi (&lt; 1 mnt)
          </div>
        </div>
      </div>

      {/* Active Borrowings Table Card */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Anggota, Nama Peminjam, atau ID Buku.."
              aria-label="Cari transaksi peminjaman aktif"
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: `Semua Aktif (${activeLoans.length})` },
                { id: 'urgent', label: `Jatuh Tempo (${urgentCount})` },
                { id: 'today', label: 'Dipinjam Hari Ini' },
                { id: 'week', label: 'Dipinjam Minggu Ini' },
              ] as const
            ).map((tab) => {
              const active = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#0B1E33] text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {filteredLoans.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
            <div className="mt-2 text-sm font-bold text-slate-900">
              Tidak ada transaksi peminjaman aktif yang cocok
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Semua pinjaman pada filter ini telah dikembalikan atau coba ubah kata kunci.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC]/80 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="py-3 px-4">ID TRANSAKSI</th>
                  <th className="py-3 px-4">PEMINJAM</th>
                  <th className="py-3 px-4">BUKU DIPINJAM</th>
                  <th className="py-3 px-4">TANGGAL PINJAM</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">AKSI SIRKULASI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLoans.map((loan) => {
                  const isOverdue = loan.overdueDays > 0;
                  const isDueToday = Boolean(loan.isDueToday);

                  return (
                    <tr
                      key={loan.id}
                      className={`transition-colors ${
                        isOverdue
                          ? 'bg-rose-50/30 hover:bg-rose-50/60'
                          : isDueToday
                          ? 'bg-amber-50/30 hover:bg-amber-50/60'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {loan.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {loan.memberName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {loan.memberId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {loan.bookTitle}
                        </div>
                        <div className="font-mono text-[11px] font-semibold text-[#0D6E6E]">
                          {loan.bookId} • {loan.bookShelf}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{loan.borrowDateLabel}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Tempo: {loan.dueDateLabel}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Terlambat {loan.overdueDays} Hari
                          </span>
                        ) : isDueToday ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Jatuh Tempo Hari Ini (H-0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Dipinjam
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleReturnClick(loan)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs transition-all active:scale-[0.97] ${
                            isOverdue
                              ? 'bg-[#B91C1C] hover:bg-[#991B1B]'
                              : isDueToday
                              ? 'bg-amber-700 hover:bg-amber-800'
                              : 'bg-[#0D6E6E] hover:bg-[#095454]'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            {isOverdue || isDueToday
                              ? 'Kembalikan Segera'
                              : 'Kembalikan'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-[#F8FAFC] border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D6E6E]" />
            <span>
              Aturan BR-05 &amp; BR-07: Stok bertambah atomik &amp; riwayat transaksi
              terjaga permanen.
            </span>
          </div>
          <span>Menampilkan data peminjaman aktif</span>
        </div>
      </div>

      {/* Riwayat Pengembalian Terakhir */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D6E6E] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Riwayat Pengembalian Terakhir
              </h2>
              <p className="text-[11px] text-slate-500">
                Transaksi selesai dengan stok yang telah dipulihkan
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
            Log Real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC]/80 text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                <th className="py-2.5 px-4">ID TRANSAKSI</th>
                <th className="py-2.5 px-4">PEMINJAM</th>
                <th className="py-2.5 px-4">BUKU &amp; EKSEMPLAR</th>
                <th className="py-2.5 px-4">TANGGAL KEMBALI</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4 text-right">EFEK STOK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {returnHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                    {item.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">
                      {item.memberName}
                    </span>{' '}
                    <span className="font-mono text-[11px] text-slate-400">
                      ({item.memberId})
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">
                      {item.bookTitle}
                    </span>{' '}
                    <span className="font-mono text-[11px] text-slate-400">
                      ({item.bookId})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    ✓ {item.returnTimestampLabel}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.finePaid > 0
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.finePaid > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                      {item.complianceStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#0D6E6E] whitespace-nowrap">
                    {item.stockEffectLabel}
                    {item.finePaid > 0 && (
                      <span className="ml-2 text-rose-700">
                        • {formatRupiah(item.finePaid)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Result Modal (Supports Overdue, On-Time H-0, and Standard On-Time) */}
      {modalRecord &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[2px] animate-backdrop-enter"
            onClick={() => setModalRecord(null)}
          >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            {modalRecord.finePaid > 0 ? (
              /* OVERDUE MODAL (Screenshot 8) */
              <>
                <div className="bg-[#991B1B] px-5 py-4 text-white flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          id="return-modal-title"
                          className="text-base font-bold leading-tight"
                        >
                          Pengembalian Terlambat Diproses!
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-white text-[#991B1B] text-[10px] font-extrabold tracking-wider">
                          OVERDUE
                        </span>
                      </div>
                      <p className="text-xs text-rose-100 mt-0.5">
                        Status: Selesai dengan Penyelesaian Denda Keterlambatan Fisik
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalRecord(null)}
                    aria-label="Tutup modal pengembalian"
                    className="p-1 rounded-lg text-rose-100 hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Fine Calculation Box */}
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          Terlambat {modalRecord.overdueDays} Hari (Batas Tempo: 19
                          Nov 2026)
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-rose-700 leading-relaxed">
                        Perhitungan denda:{' '}
                        <strong className="font-mono">
                          {modalRecord.overdueDays} hari × Rp 1.000 / hari
                        </strong>{' '}
                        sesuai ketentuan regulasi perpustakaan.
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Denda Telah Dibayar Tunai di Meja Sirkulasi</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-rose-200 px-4 py-2.5 text-center shrink-0">
                      <div className="text-[9.5px] font-bold tracking-wider text-slate-400 uppercase">
                        TOTAL DENDA KASIR
                      </div>
                      <div className="mt-0.5 text-xl font-extrabold text-[#B91C1C] tabular-nums">
                        {formatRupiah(modalRecord.finePaid)}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                        No: {modalRecord.receiptId}
                      </div>
                    </div>
                  </div>

                  {/* Circulation Detail Box */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase">
                        RINGKASAN RINCIAN SIRKULASI
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-800">
                        {modalRecord.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[11px] text-slate-500">Peminjam</div>
                        <div className="font-bold text-slate-900">
                          {modalRecord.memberName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Nomor Anggota: {modalRecord.memberId}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500">
                          Waktu Pengembalian Aktual
                        </div>
                        <div className="font-bold text-slate-900">
                          26 November 2026
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Pukul 15:45 WIB • Petugas: Siti R.
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {modalRecord.bookTitle}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Kode: <span className="font-mono">{modalRecord.bookId}</span>{' '}
                          • Durasi tercatat: {7 + modalRecord.overdueDays} hari
                          (Standar: 7 hari)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Recovery Box */}
                  <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0D6E6E]">
                        Pemulihan Stok Otomatis (BR-05 &amp; BR-07)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0D6E6E] text-white font-mono text-[10px] font-bold">
                        Status Sync: OK
                      </span>
                    </div>
                    <div className="bg-white rounded-xl border border-emerald-100 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="text-slate-400 line-through">
                          {modalRecord.previousAvailableStock} Eks
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-[#0D6E6E]">
                          {modalRecord.newAvailableStock} Eks Tersedia (+1)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">
                        Lokasi: {modalRecord.bookShelf}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Kwitansi Denda &amp; Bukti Kembali</span>
                  </button>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setModalRecord(null);
                        onGoToKatalog();
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Lihat di Katalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalRecord(null)}
                      className="px-4 py-2 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A]"
                    >
                      ✓ Selesai
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ON-TIME RETURN MODAL (Screenshots 7 & 9) */
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#0D6E6E] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        id="return-modal-title"
                        className="text-base font-bold text-slate-900"
                      >
                        Pengembalian Berhasil!
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-[#0D6E6E]">
                          {modalRecord.complianceStatus === 'Tepat Waktu'
                            ? 'Status: Dikembalikan Tepat Waktu'
                            : 'Status Diperbarui: Dikembalikan (BR-05/BR-07)'}
                        </span>
                        {modalRecord.complianceStatus === 'Tepat Waktu' && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                            Bebas Denda (H-0)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalRecord(null)}
                    aria-label="Tutup modal pengembalian"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {modalRecord.complianceStatus === 'Tepat Waktu' && (
                  <div className="rounded-xl bg-amber-50/80 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Batas Pinjam: Hari Ini, 26 Nov 2026 (23:59 WIB)</strong>{' '}
                      — Dikembalikan sebelum tenggat waktu.
                    </span>
                  </div>
                )}

                <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ID Transaksi</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono font-bold text-slate-800">
                      {modalRecord.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Peminjam</span>
                    <span className="font-bold text-slate-900">
                      {modalRecord.memberName}{' '}
                      <span className="font-mono text-slate-400 font-normal">
                        ({modalRecord.memberId})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Buku Dikembalikan</span>
                    <span className="font-bold text-[#0D6E6E]">
                      {modalRecord.bookTitle}{' '}
                      <span className="font-mono text-slate-500 font-normal">
                        ({modalRecord.bookId})
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Waktu Pengembalian</span>
                    <span className="font-semibold text-slate-800">
                      26 November 2026, 15:10 WIB
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500">Status Kepatuhan</span>
                    <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tepat Waktu (Bebas Denda / On-Time Return)
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 space-y-1.5 text-xs">
                  <div className="font-bold text-[#0D6E6E] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Restorasi Stok Otomatis (BR-05 &amp; BR-07)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed tabular-nums">
                    Stok buku bertambah atomik (+1):{' '}
                    <strong>
                      {modalRecord.previousAvailableStock} Eksemplar →{' '}
                      {modalRecord.newAvailableStock} Eksemplar Tersedia
                    </strong>
                    . Lokasi penataan kembali ke{' '}
                    <span className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 font-mono text-[11px] font-bold">
                      {modalRecord.bookShelf}
                    </span>
                    .
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Bukti</span>
                  </button>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setModalRecord(null);
                        onGoToKatalog();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat di Katalog</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalRecord(null)}
                      className="px-4 py-2 rounded-xl bg-[#0D6E6E] text-white text-xs font-bold hover:bg-[#095454]"
                    >
                      ✓ Selesai
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
