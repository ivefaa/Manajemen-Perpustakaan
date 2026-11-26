import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Layers,
  Plus,
  Search,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import type { Book, BookSortOption, BookStatusFilter } from '../types/library';
import { filterAndSortBooks, formatNumberId } from '../utils/libraryRules';
import { BookCoverThumb } from './BookCoverThumb';

interface KatalogViewProps {
  books: Book[];
  totalCatalogTitlesOffset: number;
  totalCatalogCopiesOffset: number;
  activeLoansDelta: number;
  shiftClosed: boolean;
  returnCountToday: number;
  activeLoansCountForShift: number;
  onSelectBookDetail: (book: Book) => void;
  onQuickBorrowBook: (book: Book) => void;
  onNavigatePeminjaman: () => void;
  onNavigateTambahBuku: () => void;
  onOpenBeritaAcara: () => void;
}

export const KatalogView: React.FC<KatalogViewProps> = ({
  books,
  totalCatalogTitlesOffset,
  totalCatalogCopiesOffset,
  activeLoansDelta,
  shiftClosed,
  returnCountToday,
  activeLoansCountForShift,
  onSelectBookDetail,
  onQuickBorrowBook,
  onNavigatePeminjaman,
  onNavigateTambahBuku,
  onOpenBeritaAcara,
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<BookSortOption>('title-asc');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.category));
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(
    () => filterAndSortBooks(books, query, statusFilter, categoryFilter, sortBy),
    [books, query, statusFilter, categoryFilter, sortBy]
  );

  // Dynamic institutional KPI calculations
  const sumBookTotal = books.reduce((acc, b) => acc + b.totalStock, 0);
  const sumBookBorrowed = books.reduce(
    (acc, b) => acc + Math.max(0, b.totalStock - b.availableStock),
    0
  );

  const totalJuduls = totalCatalogTitlesOffset + books.length;
  const totalEksemplar = totalCatalogCopiesOffset + sumBookTotal;
  const sedangDipinjam = Math.max(0, 324 + sumBookBorrowed + activeLoansDelta);
  const siapDipinjam = Math.max(0, totalEksemplar - sedangDipinjam);
  const borrowedPct =
    totalEksemplar > 0 ? ((sedangDipinjam / totalEksemplar) * 100).toFixed(1) : '0.0';
  const readyPct =
    totalEksemplar > 0 ? ((siapDipinjam / totalEksemplar) * 100).toFixed(1) : '0.0';
  const avgPerTitle = totalJuduls > 0 ? (totalEksemplar / totalJuduls).toFixed(2).replace('.', ',') : '0';

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBooks = filteredBooks.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-[#0D6E6E] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D6E6E]" />
            {shiftClosed
              ? 'MODUL SIRKULASI & INVENTARIS BUKU • SHIFT RESMI SELESAI'
              : 'FR-02 & FR-03 • MODUL SIRKULASI'}
          </div>
          <h1 className="mt-1 text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
            Katalog &amp; Koleksi Buku
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500 max-w-2xl">
            Pantau ketersediaan eksemplar fisik, status pinjam real-time, dan lakukan
            peminjaman ekspres. Klik kartu buku untuk pratinjau detail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onNavigatePeminjaman}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 text-[#0D6E6E]" />
            <span>Pinjam Cepat</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-500">
              Alt+P
            </kbd>
          </button>

          <button
            type="button"
            onClick={onNavigateTambahBuku}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1E33] text-white text-xs font-semibold hover:bg-[#132C4A] shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-teal-300" />
            <span>Tambah Buku Baru</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-200">
              F2
            </kbd>
          </button>
        </div>
      </div>

      {/* Shift Closed Banner (when shift is closed) */}
      {shiftClosed && (
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-down">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs text-emerald-950">
              <span className="font-bold">
                Rekapitulasi Harian Selesai (26 Nov 2026, 17:00 WIB)
              </span>{' '}
              — {returnCountToday} eksemplar telah dipulihkan ke rak fisik,{' '}
              {activeLoansCountForShift} eksemplar dalam peminjaman aktif. Data sinkron
              nihil selisih (BR-02 &amp; BR-05).
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenBeritaAcara}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0D6E6E] hover:text-[#084C4C] whitespace-nowrap shrink-0"
          >
            <span>Lihat Berita Acara</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL JUDUL
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatNumberId(totalJuduls)}
            </span>
            <span className="text-xs font-medium text-slate-500">Judul</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Terindeks Digital</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TOTAL EKSEMPLAR
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatNumberId(totalEksemplar)}
            </span>
            <span className="text-xs font-medium text-slate-500">Buku Fisik</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 tabular-nums">
            Rerata {avgPerTitle} eksemplar/judul
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              SEDANG DIPINJAM
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {formatNumberId(sedangDipinjam)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Sirkulasi Aktif
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Number(borrowedPct) * 2.5)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
              {borrowedPct}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              SIAP DIPINJAM
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#0D6E6E] tabular-nums">
              {formatNumberId(siapDipinjam)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Tersedia di Rak
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-700 tabular-nums">
            • {readyPct}% Stok Bebas Transaksi
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari ID buku (mis. BK-001) atau judul..."
            aria-label="Filter katalog berdasarkan ID atau judul"
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15 transition-all"
          />
        </div>

        {/* Status Segmented Tabs */}
        <div
          className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9] overflow-x-auto shrink-0"
          role="tablist"
          aria-label="Filter status ketersediaan"
        >
          {(
            [
              { id: 'all', label: 'Semua Status' },
              { id: 'available', label: 'Tersedia Saja' },
              { id: 'out', label: 'Stok Habis' },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category & Sort */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter kategori dan rak"
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0D6E6E]"
          >
            <option value="all">Semua Kategori &amp; Rak</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BookSortOption)}
            aria-label="Urutkan katalog"
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0D6E6E]"
          >
            <option value="title-asc">Judul (A - Z) bawaan</option>
            <option value="id-asc">ID Buku (BK-001+)</option>
            <option value="stock-desc">Stok Terbanyak</option>
            <option value="stock-asc">Stok Paling Sedikit</option>
          </select>
        </div>
      </div>

      {/* Book Grid */}
      {paginatedBooks.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-10 text-center">
          <BookOpen className="w-9 h-9 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">
            Koleksi tidak ditemukan
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Tidak ada judul buku yang cocok dengan pencarian atau filter status Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-[#0B1E33] text-white text-xs font-semibold hover:bg-[#132C4A] transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedBooks.map((book) => {
            const isAvailable = book.availableStock > 0;
            const pct =
              book.totalStock > 0
                ? Math.round((book.availableStock / book.totalStock) * 100)
                : 0;

            return (
              <article
                key={book.id}
                className={`group rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isAvailable
                    ? 'bg-white border-slate-200/90 hover:border-slate-300'
                    : 'bg-rose-50/35 border-rose-200/80 hover:border-rose-300'
                }`}
              >
                <div>
                  {/* Card Top: ID + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200/60">
                      {book.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-100/80 text-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {isAvailable ? 'Tersedia' : 'Stok Habis'}
                    </span>
                  </div>

                  {/* Cover + Title + Author */}
                  <div className="mt-3.5 flex items-start gap-3">
                    <BookCoverThumb book={book} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0D6E6E] transition-colors">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">
                        {book.author}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium text-[#0D6E6E] truncate">
                        {book.shelf} • {book.category}
                      </p>
                    </div>
                  </div>

                  {/* Out-of-stock alert or stock progress */}
                  {!isAvailable && (
                    <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200/70 px-2.5 py-1.5 flex items-start gap-1.5 text-[11px] text-rose-700">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Semua eksemplar sedang dipinjam
                        {book.earliestReturnDate
                          ? ` • Kembali: ${book.earliestReturnDate}`
                          : ''}
                      </span>
                    </div>
                  )}

                  <div className="mt-3.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-600 tabular-nums">
                        {book.availableStock} dari {book.totalStock} eksemplar
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          isAvailable ? 'text-slate-700' : 'text-rose-600'
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAvailable ? 'bg-[#0D6E6E]' : 'bg-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {book.lastActivityNote && (
                      <p className="mt-1.5 text-[10px] text-emerald-700 font-medium line-clamp-1">
                        {book.lastActivityNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectBookDetail(book)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Detail</span>
                  </button>

                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => onQuickBorrowBook(book)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#095454] shadow-2xs transition-all active:scale-[0.98] whitespace-nowrap"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                      <span>Pinjam</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed whitespace-nowrap"
                    >
                      <span>Stok Habis</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan{' '}
          <strong className="text-slate-800 tabular-nums">
            {filteredBooks.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filteredBooks.length)}
          </strong>{' '}
          dari{' '}
          <strong className="text-slate-800 tabular-nums">
            {formatNumberId(totalJuduls)}
          </strong>{' '}
          buku <span aria-hidden="true">•</span>{' '}
          <span className="text-[#0D6E6E] font-medium">
            Sinkronisasi stok: Instan
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Halaman sebelumnya"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold tabular-nums transition-colors ${
                page === safePage
                  ? 'bg-[#0B1E33] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Halaman berikutnya"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
