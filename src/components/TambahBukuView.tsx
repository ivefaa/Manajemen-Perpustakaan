import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  BookPlus,
  CheckCircle2,
  Hash,
  Minus,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import type { Book } from '../types/library';
import {
  normalizeBookId,
  validateBookIdFormat,
  validateBookRegistration,
} from '../utils/libraryRules';

interface TambahBukuViewProps {
  books: Book[];
  onRegisterBook: (book: Book, stayOnPage: boolean) => void;
}

const PRESET_TONES: Book['coverTone'][] = [
  'emerald',
  'teal',
  'navy',
  'indigo',
  'sky',
  'amber',
  'slate',
];

export const TambahBukuView: React.FC<TambahBukuViewProps> = ({
  books,
  onRegisterBook,
}) => {
  const suggestedNextId = useMemo(() => {
    const num = books.length + 1;
    return `BK-${String(num).padStart(3, '0')}`;
  }, [books.length]);

  const [idInput, setIdInput] = useState(suggestedNextId);
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Buku Fisik');
  const [shelfInput, setShelfInput] = useState('Rak Sirkulasi Utama');
  const [stockInput, setStockInput] = useState<string>('4');
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [successToast, setSuccessToast] = useState<{
    id: string;
    title: string;
    author: string;
    stock: number;
  } | null>(null);

  const validation = useMemo(
    () =>
      validateBookRegistration(
        {
          id: idInput,
          title: titleInput,
          author: authorInput,
          initialStock: stockInput,
        },
        books
      ),
    [idInput, titleInput, authorInput, stockInput, books]
  );

  const normalizedId = normalizeBookId(idInput);
  const isIdFormatOk = validateBookIdFormat(normalizedId);
  const isIdUnique = !books.some((b) => normalizeBookId(b.id) === normalizedId);
  const numericStock = Math.max(
    0,
    Number.isInteger(Number(stockInput)) && stockInput.trim() !== ''
      ? Number(stockInput)
      : 0
  );

  const previewTitle = titleInput.trim() || 'Judul Buku Baru';
  const previewAuthor = authorInput.trim() || 'Nama Penulis / Pengarang';
  const previewMonogram = (previewTitle[0] || 'B').toUpperCase();

  const handleSave = (stayOnPage: boolean) => {
    setSubmittedAttempt(true);
    if (!validation.valid) return;

    const cleanStock = Number(stockInput);
    const newBook: Book = {
      id: normalizedId,
      title: titleInput.trim(),
      author: authorInput.trim(),
      category: categoryInput,
      shelf: shelfInput,
      shelfDetail: `${shelfInput} (Terindeks)`,
      year: 2026,
      language: 'Indonesia',
      totalStock: cleanStock,
      availableStock: cleanStock,
      coverTone: PRESET_TONES[books.length % PRESET_TONES.length],
      synopsis: `${titleInput.trim()} karya ${authorInput.trim()} terdaftar sebagai koleksi ${categoryInput} pada ${shelfInput} dengan stok awal ${cleanStock} eksemplar.`,
    };

    if (stayOnPage) {
      setSuccessToast({
        id: newBook.id,
        title: newBook.title,
        author: newBook.author,
        stock: newBook.totalStock,
      });
      const nextNum = books.length + 2;
      setIdInput(`BK-${String(nextNum).padStart(3, '0')}`);
      setTitleInput('');
      setAuthorInput('');
      setStockInput('4');
      setSubmittedAttempt(false);
    }
    onRegisterBook(newBook, stayOnPage);
  };

  const handleReset = () => {
    setIdInput(suggestedNextId);
    setTitleInput('');
    setAuthorInput('');
    setStockInput('4');
    setSubmittedAttempt(false);
  };

  const adjustStock = (delta: number) => {
    const curr = Number.isNaN(Number(stockInput)) ? 0 : Math.floor(Number(stockInput));
    setStockInput(String(Math.max(0, curr + delta)));
  };

  return (
    <div className="space-y-5">
      {/* Dismissible Success Toast (Screenshot 1) */}
      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between gap-3 animate-slide-down">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs text-emerald-950">
              <div>
                <span className="font-bold">
                  Buku{' '}
                  <span className="font-mono underline">{successToast.id}</span> (
                  {successToast.title} – {successToast.author}) berhasil didaftarkan
                  ke katalog.
                </span>
              </div>
              <div className="text-emerald-800 mt-0.5">
                Stok awal {successToast.stock} eksemplar telah disinkronkan dan siap
                disirkulasikan ke peminjam.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-[10px] font-bold text-[#0D6E6E]">
              TERSIMPAN
            </span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              aria-label="Tutup notifikasi"
              className="p-1 rounded text-emerald-700 hover:bg-emerald-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            KATALOG &amp; INVENTARIS /{' '}
            <span className="text-[#0D6E6E]">FR-01 REGISTRASI</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-[26px] font-extrabold tracking-tight text-slate-900">
            Tambah Koleksi Buku Baru
          </h1>
          <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
            Daftarkan judul dan tentukan stok awal buku ke dalam basis data perpustakaan.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0D6E6E] shadow-2xs self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Aturan BR-01 &amp; BR-02 Aktif
        </span>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1E33] text-white flex items-center justify-center shrink-0">
                <BookPlus className="w-4.5 h-4.5 text-teal-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Formulir Data Induk Buku
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  4 data wajib untuk registrasi katalog sesuai standar perpustakaan
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold shrink-0">
              * Wajib diisi
            </span>
          </div>

          {/* ID Buku */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reg-book-id"
                className="text-xs font-bold text-slate-800"
              >
                ID Buku <span className="text-rose-600">*</span>
              </label>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                Format: BK-XXX • Unik
              </span>
            </div>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-book-id"
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value.toUpperCase())}
                placeholder="BK-009"
                className={`w-full h-10 pl-9 pr-9 rounded-xl border font-mono text-xs font-bold focus:outline-none focus:ring-2 transition-all ${
                  isIdFormatOk && isIdUnique
                    ? 'border-emerald-300 bg-white text-slate-900 focus:border-[#0D6E6E] focus:ring-[#0D6E6E]/15'
                    : 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/15'
                }`}
              />
              {isIdFormatOk && isIdUnique ? (
                <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] absolute right-3 top-1/2 -translate-y-1/2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              {isIdFormatOk && isIdUnique ? (
                <span className="text-[#0D6E6E] font-medium">
                  ✓ ID unik dan sesuai format perpustakaan.
                </span>
              ) : (
                <span className="text-rose-600 font-medium">
                  {validation.errors.id || 'Periksa format ID Buku (BK-XXX).'}
                </span>
              )}
              <span className="text-slate-400 hidden sm:inline">
                Contoh: BK-001 s/d BK-999
              </span>
            </div>
          </div>

          {/* Judul Buku */}
          <div>
            <label
              htmlFor="reg-book-title"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Judul Buku <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-book-title"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Misal: Sambernyawa: Jejak Pejuang Nusantara"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15"
              />
            </div>
            {submittedAttempt && validation.errors.title ? (
              <p className="mt-1 text-[11px] font-medium text-rose-600">
                {validation.errors.title}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Gunakan kapitalisasi yang baku untuk memudahkan pencarian (partial match).
              </p>
            )}
          </div>

          {/* Penulis / Pengarang */}
          <div>
            <label
              htmlFor="reg-book-author"
              className="block text-xs font-bold text-slate-800 mb-1.5"
            >
              Penulis / Pengarang <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="reg-book-author"
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                placeholder="Misal: Dr. Hendra Wijaya"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-[#0D6E6E] focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15"
              />
            </div>
            {submittedAttempt && validation.errors.author ? (
              <p className="mt-1 text-[11px] font-medium text-rose-600">
                {validation.errors.author}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Sertakan gelar jika tertera resmi pada sampul buku fisik.
              </p>
            )}
          </div>

          {/* Optional Category & Shelf */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reg-book-category"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Kategori Koleksi
              </label>
              <select
                id="reg-book-category"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0D6E6E]"
              >
                <option value="Buku Fisik">Buku Fisik</option>
                <option value="Fiksi Sastra Indonesia">Fiksi Sastra Indonesia</option>
                <option value="Sejarah & Sastra">Sejarah &amp; Sastra</option>
                <option value="Filsafat & Pengembangan Diri">
                  Filsafat &amp; Pengembangan Diri
                </option>
                <option value="Sains Populer">Sains Populer</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="reg-book-shelf"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Lokasi Rak Penyimpanan
              </label>
              <select
                id="reg-book-shelf"
                value={shelfInput}
                onChange={(e) => setShelfInput(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0D6E6E]"
              >
                <option value="Rak Sirkulasi Utama">Rak Sirkulasi Utama</option>
                <option value="Rak A-02">Rak A-02</option>
                <option value="Rak B-01">Rak B-01</option>
                <option value="Rak C-04">Rak C-04</option>
                <option value="Rak D-01">Rak D-01</option>
              </select>
            </div>
          </div>

          {/* Jumlah Stok Awal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reg-book-stock"
                className="text-xs font-bold text-slate-800"
              >
                Jumlah Stok Awal <span className="text-rose-600">*</span>
              </label>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                Bilangan Bulat ≥ 0
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
              <button
                type="button"
                onClick={() => adjustStock(-1)}
                aria-label="Kurangi stok awal"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 flex items-center justify-center gap-2">
                <input
                  id="reg-book-stock"
                  type="number"
                  min={0}
                  step={1}
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  className="w-20 text-center text-base font-extrabold text-slate-900 tabular-nums focus:outline-none"
                />
                <span className="text-xs font-medium text-slate-400">
                  Eksemplar
                </span>
              </div>
              <button
                type="button"
                onClick={() => adjustStock(1)}
                aria-label="Tambah stok awal"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {validation.errors.initialStock && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-600">
                {validation.errors.initialStock}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Stok awal menjadi stok total sekaligus stok tersedia saat ini.
              </span>
              <div className="flex items-center gap-1">
                {[1, 3, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStockInput(String(preset))}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold tabular-nums border transition-colors ${
                      stockInput === String(preset)
                        ? 'bg-[#0B1E33] text-white border-[#0B1E33]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Batal &amp; Bersihkan</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1.5 transition-colors"
              >
                <BookPlus className="w-3.5 h-3.5 text-[#0D6E6E]" />
                <span>Simpan &amp; Tambah Lagi</span>
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-5 py-2.5 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A] inline-flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5 text-teal-300" />
                <span>Simpan ke Katalog</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Preview + Rules */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preview Card */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                PRATINJAU KARTU KATALOG
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0D6E6E] text-[10px] font-bold">
                Real-Time Sync
              </span>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-4">
              <div className="flex items-start gap-3.5">
                <div className="w-16 h-22 rounded-xl bg-gradient-to-br from-[#172554] to-[#0B1E33] text-white flex flex-col justify-between p-2.5 shrink-0 shadow-sm">
                  <span className="text-[9px] font-mono text-slate-300">ID</span>
                  <span className="text-xl font-extrabold text-center">
                    {previewMonogram}
                  </span>
                  <span className="text-[9px] font-mono text-teal-300 truncate">
                    {normalizedId || 'BK-XXX'}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">
                      {normalizedId || 'BK-XXX'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        numericStock > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      • {numericStock > 0 ? 'Tersedia' : 'Tidak Tersedia'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {previewTitle}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 truncate">
                    {previewAuthor}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500">Stok Tersedia:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {numericStock} Eksemplar
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span>{shelfInput}</span>
                <span className="font-semibold text-[#0D6E6E]">
                  Status: {numericStock > 0 ? 'Siap Pinjam' : 'Stok 0'}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3">
                <div className="text-[10px] text-slate-500">Tipe Entitas</div>
                <div className="mt-0.5 text-xs font-bold text-slate-900">
                  {categoryInput}
                </div>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3">
                <div className="text-[10px] text-slate-500">Metode Validasi</div>
                <div className="mt-0.5 text-xs font-bold text-[#0D6E6E]">
                  Aturan BR-01 &amp; BR-02
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility Rules */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-[#0D6E6E]" />
              <span>Syarat Kelayakan Registrasi (FR-01)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-800">ID Buku Unik:</strong> Harus
                  berbeda dari buku lain yang sudah tersimpan di pangkalan data
                  katalog.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-800">Judul Lengkap:</strong> Tidak
                  boleh kosong agar dapat dicari saat alur peminjaman cepat.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-800">Penulis Jelas:</strong>{' '}
                  Identifikasi pengarang atau penerbit buku tertera valid.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6E6E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-800">Stok Bilangan Bulat (≥ 0):</strong>{' '}
                  Desimal dan angka negatif otomatis ditolak oleh sistem.
                </span>
              </li>
            </ul>
            <div className="rounded-xl bg-teal-50/70 border border-teal-200/70 p-3 text-[11px] text-teal-950">
              Buku yang disimpan akan langsung berstatus <strong>Tersedia</strong> jika
              stok &gt; 0, atau <strong>Tidak Tersedia</strong> jika stok 0.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
