import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import type { Book, LoanTransaction } from '../types/library';
import { SUGGESTED_MEMBERS } from '../data/seedData';
import { canBorrowBook, parseMemberInput } from '../utils/libraryRules';

interface PeminjamanViewProps {
  books: Book[];
  preselectedBookId: string | null;
  todayCirculation: LoanTransaction[];
  nextTransactionCode: string;
  onSubmitBorrow: (params: { bookId: string; memberInput: string }) => {
    success: boolean;
    error?: string;
    createdLoan?: LoanTransaction;
    previousStock?: number;
    newStock?: number;
  };
  onGoToPengembalian: () => void;
}

export const PeminjamanView: React.FC<PeminjamanViewProps> = ({
  books,
  preselectedBookId,
  todayCirculation,
  nextTransactionCode,
  onSubmitBorrow,
  onGoToPengembalian,
}) => {
  const defaultBook =
    books.find((b) => b.id === preselectedBookId) ||
    books.find((b) => b.id === 'BK-001') ||
    books[0];

  const [selectedBookId, setSelectedBookId] = useState<string>(
    defaultBook ? defaultBook.id : ''
  );
  const [bookSearchText, setBookSearchText] = useState<string>(
    defaultBook ? `${defaultBook.id} - ${defaultBook.title}` : ''
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [memberInput, setMemberInput] = useState('AG-2041 (Ahmad Fauzi)');
  const [formError, setFormError] = useState<string | null>(null);
  const [autoFilledNotice, setAutoFilledNotice] = useState<boolean>(
    Boolean(preselectedBookId)
  );
  const [savedResult, setSavedResult] = useState<{
    loan: LoanTransaction;
    previousStock: number;
    newStock: number;
  } | null>(null);

  const prevPreselectedRef = useRef<string | null>(preselectedBookId);

  useEffect(() => {
    if (
      preselectedBookId &&
      preselectedBookId !== prevPreselectedRef.current
    ) {
      const found = books.find((b) => b.id === preselectedBookId);
      if (found) {
        setSelectedBookId(found.id);
        setBookSearchText(`${found.id} - ${found.title}`);
        setAutoFilledNotice(true);
        setSavedResult(null);
        setFormError(null);
      }
    }
    prevPreselectedRef.current = preselectedBookId;
  }, [preselectedBookId, books]);

  const selectedBook = books.find((b) => b.id === selectedBookId) || null;
  const stockStatus = canBorrowBook(selectedBook);
  const parsedMember = parseMemberInput(memberInput);

  const matchingBooks = books.filter((b) => {
    const q = bookSearchText.trim().toLowerCase();
    if (!q || (selectedBook && q === `${selectedBook.id} - ${selectedBook.title}`.toLowerCase())) {
      return true;
    }
    return (
      b.id.toLowerCase().includes(q) ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  });

  const handleSelectScenario = (scenario: 'safe' | 'empty') => {
    setSavedResult(null);
    setFormError(null);
    setAutoFilledNotice(false);
    if (scenario === 'safe') {
      const safeBook = books.find((b) => b.availableStock > 0) || books[0];
      if (safeBook) {
        setSelectedBookId(safeBook.id);
        setBookSearchText(`${safeBook.id} - ${safeBook.title}`);
      }
    } else {
      const emptyBook = books.find((b) => b.availableStock === 0);
      if (emptyBook) {
        setSelectedBookId(emptyBook.id);
        setBookSearchText(`${emptyBook.id} - ${emptyBook.title}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedBook) {
      setFormError('Pilih buku yang akan dipinjam terlebih dahulu.');
      return;
    }
    const res = onSubmitBorrow({
      bookId: selectedBook.id,
      memberInput,
    });
    if (!res.success) {
      setFormError(res.error || 'Gagal memproses peminjaman.');
      return;
    }
    if (res.createdLoan) {
      setSavedResult({
        loan: res.createdLoan,
        previousStock: res.previousStock ?? selectedBook.availableStock,
        newStock: res.newStock ?? Math.max(0, selectedBook.availableStock - 1),
      });
    }
  };

  const handleReset = () => {
    setSavedResult(null);
    setFormError(null);
    setAutoFilledNotice(false);
    const firstSafe = books.find((b) => b.availableStock > 0) || books[0];
    if (firstSafe) {
      setSelectedBookId(firstSafe.id);
      setBookSearchText(`${firstSafe.id} - ${firstSafe.title}`);
    } else {
      setSelectedBookId('');
      setBookSearchText('');
    }
    setMemberInput('');
  };

  const displayTrxId = savedResult ? savedResult.loan.id : nextTransactionCode;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-[#0D6E6E] uppercase">
            SIRKULASI MEJA 01 • FR-04 &amp; FR-05 REAL-TIME
          </div>
          <h1 className="mt-1 text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
            Catat Peminjaman Buku
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
            Layanan sirkulasi peminjaman eksemplar buku ke anggota perpustakaan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-[10px] font-medium text-slate-500">
                Target Pelayanan
              </div>
              <div className="text-xs font-bold text-slate-900">&lt; 1 Menit</div>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#0D6E6E]" />
            <div>
              <div className="text-[10px] font-medium text-slate-500">
                Proteksi Stok
              </div>
              <div className="text-xs font-bold text-[#0D6E6E]">Anti-Negatif</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-[#0D6E6E]" />
              <span>Identifikasi Buku &amp; Peminjam</span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">
              {savedResult ? 'Transaksi Tersimpan' : 'Langkah 1 dari 2'}
            </span>
          </div>

          {/* Success Banner after saving (Screenshot 5) */}
          {savedResult && (
            <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-4 space-y-3 animate-slide-down">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0D6E6E] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Transaksi Berhasil Disimpan!
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 font-mono text-[11px] font-bold text-slate-800">
                        {savedResult.loan.id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0D6E6E] text-white text-[11px] font-semibold">
                        • Aktif
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#0D6E6E] whitespace-nowrap">
                  Real-Time Synchronized
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Stok buku <strong>'{savedResult.loan.bookTitle}'</strong> (
                {savedResult.loan.bookId}) otomatis berkurang:{' '}
                <span className="line-through text-slate-400">
                  {savedResult.previousStock} eksemplar
                </span>{' '}
                →{' '}
                <strong className="text-[#0D6E6E]">
                  {savedResult.newStock} eksemplar
                </strong>{' '}
                (FR-04 &amp; BR-04 terpenuhi). Status peminjaman aktif tercatat untuk{' '}
                <strong>
                  {savedResult.loan.memberName} ({savedResult.loan.memberId})
                </strong>
                .
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#095454] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Bukti Peminjaman
                </button>
                <button
                  type="button"
                  onClick={onGoToPengembalian}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Lihat di Daftar Pengembalian
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Transaksi Baru
                </button>
              </div>
            </div>
          )}

          {/* Auto-filled notice (Screenshot 2) */}
          {!savedResult && autoFilledNotice && selectedBook && (
            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 flex items-center justify-between gap-3 animate-slide-down">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="w-4 h-4 text-[#0D6E6E] shrink-0" />
                <div className="text-xs text-emerald-950 truncate">
                  <span className="font-bold">
                    Data buku terisi otomatis dari Katalog Modal
                  </span>{' '}
                  <span className="text-emerald-800">
                    ({selectedBook.id} • {selectedBook.title})
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#0D6E6E] text-white text-[10px] font-bold shrink-0">
                Auto-filled
              </span>
            </div>
          )}

          {/* Stock Scenario Quick Test Toggle */}
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-600">
              Uji Skenario Stok:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectScenario('safe')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedBook && selectedBook.availableStock > 0
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                Stok Aman (≥1)
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('empty')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedBook && selectedBook.availableStock === 0
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                Stok Habis (0)
              </button>
            </div>
          </div>

          {/* Search Book Input */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="borrow-book-search"
                className="text-xs font-bold text-slate-800"
              >
                Cari ID atau Judul Buku <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Exact ID atau Parsial Judul (FR-03)
              </span>
            </div>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="borrow-book-search"
                type="text"
                value={bookSearchText}
                onFocus={() => setDropdownOpen(true)}
                onChange={(e) => {
                  setBookSearchText(e.target.value);
                  setDropdownOpen(true);
                  setSavedResult(null);
                }}
                placeholder="Ketik BK-001 atau judul buku..."
                className="w-full h-10 pl-9 pr-9 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15"
              />
              {bookSearchText && (
                <button
                  type="button"
                  onClick={() => {
                    setBookSearchText('');
                    setSelectedBookId('');
                    setDropdownOpen(true);
                  }}
                  aria-label="Bersihkan pilihan buku"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {dropdownOpen && (
              <div className="mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-100 z-20 relative">
                {matchingBooks.length > 0 ? (
                  matchingBooks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBookId(b.id);
                        setBookSearchText(`${b.id} - ${b.title}`);
                        setDropdownOpen(false);
                        setSavedResult(null);
                        setFormError(null);
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-[#0D6E6E]">
                          {b.id}
                        </span>{' '}
                        <span className="font-semibold text-slate-900">
                          {b.title}
                        </span>
                        <span className="text-slate-500"> • {b.author}</span>
                      </div>
                      <span
                        className={`font-semibold whitespace-nowrap ${
                          b.availableStock > 0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {b.availableStock} Eks
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3.5 py-3 text-xs text-slate-500">
                    Buku tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Book Preview Card */}
          {selectedBook && (
            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/90 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-14 rounded-lg bg-[#0B1E33] text-white flex flex-col items-center justify-center shrink-0 p-1.5">
                  <BookOpen className="w-4 h-4 text-teal-300" />
                  <span className="mt-1 font-mono text-[9px] font-semibold text-slate-300">
                    {selectedBook.id}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-teal-100/80 text-[#0D6E6E] font-mono text-[10px] font-bold">
                      {selectedBook.id}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {selectedBook.category}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-700">
                      {selectedBook.shelf}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900 truncate">
                    {selectedBook.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedBook.author}
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-[10px] font-medium text-slate-500">
                  {savedResult ? 'Status Stok Tersedia' : 'Stok Tersedia'}
                </div>
                {savedResult ? (
                  <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 tabular-nums">
                    <span className="line-through text-slate-400">
                      {savedResult.previousStock} Eks
                    </span>
                    <span>→ {savedResult.newStock} Eksemplar</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px]">
                      -1 Atomik
                    </span>
                  </div>
                ) : (
                  <span
                    className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${
                      stockStatus.allowed
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        stockStatus.allowed ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    {selectedBook.availableStock} Eksemplar Tersedia
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stock Protection Notice */}
          {selectedBook && !savedResult && (
            <div
              className={`rounded-xl border p-3.5 flex items-start gap-2.5 text-xs ${
                stockStatus.allowed
                  ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {stockStatus.allowed ? (
                <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {stockStatus.allowed
                    ? `Stok Aman untuk Dipinjam (Tersedia: ${selectedBook.availableStock} Eksemplar)`
                    : 'Peminjaman Ditolak — Stok Kosong (Proteksi BR-03 & BR-04)'}
                </div>
                <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
                  {stockStatus.allowed
                    ? `Sesuai aturan BR-03 & BR-04, sistem akan secara atomik memverifikasi dan mengurangi stok buku menjadi ${
                        selectedBook.availableStock - 1
                      } setelah transaksi peminjaman ini disimpan.`
                    : stockStatus.reason}
                </p>
              </div>
            </div>
          )}

          {/* Member Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="borrow-member-input"
                className="text-xs font-bold text-slate-800"
              >
                Nama atau ID Anggota <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Sesuai FR-04 (Wajib diisi)
              </span>
            </div>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="borrow-member-input"
                type="text"
                value={memberInput}
                onChange={(e) => {
                  setMemberInput(e.target.value);
                  setFormError(null);
                  setSavedResult(null);
                }}
                placeholder="Contoh: AG-2041 (Ahmad Fauzi)"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Anggota cepat:</span>
              {SUGGESTED_MEMBERS.slice(0, 3).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMemberInput(m);
                    setSavedResult(null);
                    setFormError(null);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Read-only Date & Transaction ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Pinjam (Otomatis)
              </div>
              <div className="h-10 px-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>26 November 2026</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-1.5">
                ID Transaksi Unik
              </div>
              <div className="h-10 px-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-2 text-xs font-mono font-bold text-slate-800">
                <span>{displayTrxId}</span>
                <span className="px-1.5 py-0.5 rounded bg-teal-100 text-[#0D6E6E] font-sans text-[10px] font-bold">
                  Auto
                </span>
              </div>
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {savedResult ? (
              <>
                <button
                  type="button"
                  disabled
                  className="flex-1 min-w-[200px] h-11 px-5 rounded-xl bg-[#0D6E6E] text-white text-xs font-bold inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Transaksi Sukses Disimpan</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-11 px-5 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A] inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Catat Peminjaman Baru</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={!stockStatus.allowed}
                  className="flex-1 min-w-[200px] h-11 px-5 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A] disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan &amp; Proses Peminjaman</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Batal / Reset</span>
                </button>
              </>
            )}
          </div>
        </form>

        {/* Right Column: Live Receipt + Today's Circulation */}
        <div className="lg:col-span-5 space-y-4">
          {/* Struk Ringkasan Sirkulasi */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <FileText className="w-4 h-4 text-[#0D6E6E]" />
                <span>Struk Ringkasan Sirkulasi</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                Pratinjau Langsung
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    NO. REGISTRASI
                  </div>
                  <div className="mt-0.5 font-mono font-bold text-slate-900">
                    {displayTrxId}
                  </div>
                </div>
                {savedResult && (
                  <span className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0D6E6E]">
                    TERVALIDASI &amp; TERSIMPAN
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-500">Judul Buku</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900">
                    {selectedBook ? selectedBook.title : 'Belum dipilih'}
                  </div>
                  {selectedBook && (
                    <div className="text-[11px] text-slate-500">
                      {selectedBook.author} •{' '}
                      <span className="font-mono font-semibold text-[#0D6E6E]">
                        {selectedBook.id}
                      </span>
                    </div>
                  )}
                </div>
                {selectedBook && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700 shrink-0">
                    {selectedBook.shelf}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-500">
                    Peminjam Terdaftar
                  </div>
                  <div className="mt-0.5 font-bold text-slate-900">
                    {parsedMember.valid
                      ? `${parsedMember.memberId} (${parsedMember.memberName})`
                      : 'Belum diisi'}
                  </div>
                </div>
                {parsedMember.valid && (
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0D6E6E] text-[10px] font-bold">
                    Anggota Aktif
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-slate-500">Tanggal Pinjam</div>
                  <div className="mt-0.5 font-semibold text-slate-800">
                    26 Nov 2026
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Petugas Loket</div>
                  <div className="mt-0.5 font-semibold text-slate-800">
                    Siti Rahmawati
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Batas Default Kembali:
                </span>
                <span className="font-bold text-[#0D6E6E]">
                  03 Des 2026 (7 Hari)
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D6E6E]" />
              <span>Verifikasi otomatis oleh sistem sirkulasi terpusat</span>
            </div>
          </div>

          {/* Sirkulasi Terakhir Hari Ini */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Sirkulasi Terakhir Hari Ini</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#0D6E6E] text-[11px] font-bold tabular-nums">
                {todayCirculation.length} Diproses
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {todayCirculation.slice(0, 5).map((item, idx) => {
                const initials = item.memberName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <div
                    key={item.id}
                    className={`py-2.5 flex items-center justify-between gap-3 ${
                      idx === 0 && item.timeAgoLabel === 'Baru saja'
                        ? 'bg-emerald-50/60 -mx-2 px-2 rounded-lg'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          idx === 0 && item.timeAgoLabel === 'Baru saja'
                            ? 'bg-[#0D6E6E] text-white'
                            : 'bg-[#0B1E33] text-white'
                        }`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.memberName}{' '}
                          <span className="font-mono text-[10px] font-medium text-slate-400">
                            {item.memberId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.bookTitle} •{' '}
                          <span className="font-mono">{item.bookId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-[11px] font-semibold ${
                          item.timeAgoLabel === 'Baru saja'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        • {item.timeAgoLabel === 'Baru saja' ? 'Dipinjam (Aktif)' : 'Dipinjam'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.timeAgoLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 tabular-nums">
                {todayCirculation.length} Diproses hari ini
              </span>
              <button
                type="button"
                onClick={onGoToPengembalian}
                className="inline-flex items-center gap-1 font-bold text-[#0D6E6E] hover:underline"
              >
                <span>Buka Layar Pengembalian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
