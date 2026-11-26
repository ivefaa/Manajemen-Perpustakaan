import React, { useState } from 'react';
import {
  ArrowRight,
  Barcode,
  BookOpen,
  CheckCircle2,
  History,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { Book, LoanTransaction, ReturnHistoryItem } from '../types/library';

interface BookDetailModalProps {
  book: Book | null;
  activeLoans: LoanTransaction[];
  returnHistory: ReturnHistoryItem[];
  onClose: () => void;
  onBorrowBook: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  activeLoans,
  returnHistory,
  onClose,
  onBorrowBook,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  if (!book) return null;

  const isAvailable = book.availableStock > 0;
  const borrowedCount = Math.max(0, book.totalStock - book.availableStock);
  const ratioPercent =
    book.totalStock > 0
      ? Math.round((book.availableStock / book.totalStock) * 100)
      : 0;

  const bookLoans = activeLoans.filter((l) => l.bookId === book.id);
  const bookReturns = returnHistory.filter((r) => r.bookId === book.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px] animate-backdrop-enter"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-modal-enter max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto">
          {/* Top Metadata & Close */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-[#0D6E6E] border border-teal-200/70 text-[11px] font-semibold">
                <BookOpen className="w-3 h-3" />
                {book.category} • {book.shelf}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200/70">
                {book.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                    : 'bg-rose-50 text-rose-700 border-rose-200/70'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                {isAvailable
                  ? `Tersedia (${book.availableStock} dari ${book.totalStock} Eksemplar)`
                  : `Stok Habis (0 dari ${book.totalStock} Eksemplar)`}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail buku"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Book Title & Author */}
          <div className="mt-4">
            <h2
              id="book-detail-title"
              className="text-2xl font-bold text-slate-900 tracking-tight"
            >
              {book.title}
            </h2>
            <p className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-2">
              <span>
                Penulis: <strong className="text-slate-800">{book.author}</strong>
              </span>
              <span aria-hidden="true">•</span>
              <span>
                Tahun Terbit: <strong className="text-slate-800">{book.year}</strong>
              </span>
              <span aria-hidden="true">•</span>
              <span>
                Bahasa: <strong className="text-slate-800">{book.language}</strong>
              </span>
            </p>
          </div>

          {/* Synopsis */}
          <div className="mt-5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-4">
            <div className="text-xs font-bold text-[#0D6E6E] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Sinopsis / Ringkasan Buku
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {book.synopsis}
            </p>
          </div>

          {/* Availability Ratio */}
          <div className="mt-4 rounded-xl border border-slate-200/90 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Rasio Ketersediaan Eksemplar
              </span>
              <span
                className={`font-semibold tabular-nums ${
                  isAvailable ? 'text-[#0D6E6E]' : 'text-rose-600'
                }`}
              >
                {ratioPercent}% Siap Sirkulasi
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAvailable ? 'bg-[#0D6E6E]' : 'bg-rose-400'
                }`}
                style={{ width: `${ratioPercent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/70 p-3 text-center">
                <div className="text-[11px] text-slate-500">Stok Total</div>
                <div className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                  {book.totalStock} Eksemplar
                </div>
              </div>
              <div
                className={`rounded-xl border p-3 text-center ${
                  isAvailable
                    ? 'bg-emerald-50/70 border-emerald-200/70'
                    : 'bg-rose-50/70 border-rose-200/70'
                }`}
              >
                <div
                  className={`text-[11px] ${
                    isAvailable ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  Stok Tersedia
                </div>
                <div
                  className={`mt-1 text-sm font-bold tabular-nums ${
                    isAvailable ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  {book.availableStock} Eksemplar
                </div>
              </div>
              <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3 text-center">
                <div className="text-[11px] text-amber-700">Sedang Dipinjam</div>
                <div className="mt-1 text-sm font-bold text-amber-900 tabular-nums">
                  {borrowedCount} Eksemplar
                </div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/70 p-3 text-center">
                <div className="text-[11px] text-slate-500">Lokasi Fisik</div>
                <div className="mt-1 text-xs font-bold text-slate-900 truncate">
                  {book.shelfDetail}
                </div>
              </div>
            </div>
          </div>

          {/* Last circulation activity banner (if present) */}
          {book.lastActivityNote && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 animate-slide-down">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                {book.lastActivityNote}
              </div>
            </div>
          )}

          {/* Optional Barcode Preview Drawer */}
          {showBarcode && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-down">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Label Barcode Koleksi Fisik
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {book.title} • {book.shelf}
                </div>
              </div>
              <div className="bg-white border border-slate-300 rounded-lg px-5 py-2.5 text-center shadow-xs">
                <div className="flex items-center justify-center gap-0.5 h-8">
                  {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2].map(
                    (w, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 h-full inline-block"
                        style={{ width: `${w * 1.8}px` }}
                      />
                    )
                  )}
                </div>
                <div className="mt-1 font-mono text-[11px] font-bold tracking-widest text-slate-900">
                  *{book.id}*
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1E33] text-white text-xs font-semibold hover:bg-[#132C4A] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Label
              </button>
            </div>
          )}

          {/* Optional Book History Drawer */}
          {showHistory && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 animate-slide-down">
              <div className="text-xs font-bold text-slate-900 mb-2">
                Riwayat Sirkulasi {book.id}
              </div>
              {bookLoans.length === 0 && bookReturns.length === 0 ? (
                <div className="text-xs text-slate-500">
                  Belum ada catatan sirkulasi aktif untuk buku ini pada sesi hari ini.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {bookLoans.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200/70"
                    >
                      <div>
                        <span className="font-mono font-semibold text-slate-800">
                          {l.id}
                        </span>{' '}
                        • {l.memberName} ({l.memberId})
                      </div>
                      <span className="text-amber-700 font-semibold">
                        Dipinjam ({l.borrowDateLabel})
                      </span>
                    </div>
                  ))}
                  {bookReturns.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200/70"
                    >
                      <div>
                        <span className="font-mono font-semibold text-slate-800">
                          {r.id}
                        </span>{' '}
                        • {r.memberName}
                      </div>
                      <span className="text-emerald-700 font-semibold">
                        Dikembalikan ({r.returnTimestampLabel})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rules Info Banner */}
          <div className="mt-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 px-4 py-3 flex items-center gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#0D6E6E] shrink-0" />
            <span>
              Memenuhi aturan <strong>BR-03 &amp; BR-04</strong>: Transaksi peminjaman
              akan mengurangi stok tersedia secara atomik dan mencatat riwayat peminjam.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBarcode((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                showBarcode
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              Cetak Barcode
            </button>
            <button
              type="button"
              onClick={() => setShowHistory((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                showHistory
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat
            </button>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            <div className="text-right">
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onBorrowBook(book)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isAvailable
                    ? 'bg-[#0B1E33] text-white hover:bg-[#132C4A] shadow-sm active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>
                  {isAvailable
                    ? `Pinjam Buku Ini (${book.id})`
                    : `Stok Habis (${book.id})`}
                </span>
                {isAvailable && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
              {isAvailable && (
                <div className="text-[10px] font-medium text-[#0D6E6E] mt-1">
                  • Otomatis mengisi form peminjaman
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
