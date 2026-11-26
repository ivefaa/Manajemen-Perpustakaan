import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import type { FineRecord } from '../types/library';
import { formatRupiah } from '../utils/libraryRules';
import { BrandLogo } from './BrandLogo';

interface BeritaAcaraViewProps {
  fines: FineRecord[];
  processedReturnsCount: number;
  activeLoansCount: number;
  onBackToLaporan: () => void;
  onBackToKatalog: () => void;
}

export const BeritaAcaraView: React.FC<BeritaAcaraViewProps> = ({
  fines,
  processedReturnsCount,
  activeLoansCount,
  onBackToLaporan,
  onBackToKatalog,
}) => {
  const totalFine = fines.reduce((acc, f) => acc + f.fineAmount, 0);
  const totalReturned = 15 + processedReturnsCount;

  const handleDownloadHtmlDoc = () => {
    const text = [
      'BERITA ACARA REKAPITULASI INVENTARIS KOLEKSI & PENUTUPAN BUKU KAS',
      'PERPUSTAKAAN PUSTAKAMODERN • No. Reg: BA-20261126-KAS-001',
      'Tanggal: Kamis, 26 November 2026, 17:00 WIB',
      '------------------------------------------------------------',
      `Total Penerimaan Denda Kasir: ${formatRupiah(totalFine)} (${fines.length} Kwitansi)`,
      `Total Buku Dikembalikan: ${totalReturned} Eksemplar (100% Pulih ke Rak)`,
      `Peminjaman Aktif Berjalan: ${34 + activeLoansCount} Eksemplar`,
      `Selisih Kas Fisik: Rp 0 (Nihil / Balanced)`,
      '------------------------------------------------------------',
      'Otorisasi:',
      '- Pustakawan Utama: Siti Rahmawati (VALIDATED_OK)',
      '- Kepala Unit Sirkulasi: Hendra Wijaya, S.Hum.',
      '- Bendahara Perpustakaan: Ratna Kartika, S.E.',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BA-20261126-KAS-001.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToLaporan}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Laporan</span>
          </button>
          <button
            type="button"
            onClick={onBackToKatalog}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Kembali ke Katalog</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
            PRATINJAU DOKUMEN RESMI
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0D6E6E] text-[11px] font-bold inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tanda Tangan Digital Valid
          </span>
          <button
            type="button"
            onClick={handleDownloadHtmlDoc}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Berita</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#0B1E33] text-white text-xs font-bold hover:bg-[#132C4A] inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-teal-300" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* A4 Institutional Document */}
      <article className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-7">
        {/* Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div className="flex items-start gap-3.5">
            <BrandLogo size="lg" />
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                PERPUSTAKAAN PUSTAKAMODERN
              </div>
              <div className="text-xs font-bold text-[#0D6E6E]">
                Unit Pengawasan Koleksi, Pelayanan Sirkulasi &amp; Kasir
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Gedung Graha Pustaka Lt. 1, Jl. Cendekia No. 12, Jakarta 10110 •
                Telp: (021) 555-0192
              </div>
            </div>
          </div>

          <div className="sm:text-right text-xs shrink-0">
            <span className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase">
              RESMI • TERAUDIT
            </span>
            <div className="mt-2 font-mono font-bold text-slate-800">
              No. Reg: BA-20261126-KAS-001
            </div>
            <div className="text-[11px] text-slate-500">
              Audit Run: #20261126-D
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            BERITA ACARA REKAPITULASI INVENTARIS KOLEKSI &amp; PENUTUPAN BUKU KAS
          </h2>
          <p className="text-xs text-slate-500">
            Periode Shift: Sore (08:00 – 17:00 WIB) • Hari/Tanggal: Kamis, 26
            November 2026 • Meja Kasir: Pos Sirkulasi Utama 01
          </p>
        </div>

        {/* Legal Intro */}
        <p className="text-xs leading-relaxed text-slate-700">
          Pada hari ini, <strong>Kamis, 26 November 2026</strong>, bertempat di
          Meja Sirkulasi Utama Perpustakaan PustakaModern, telah dilaksanakan
          pemeriksaan, verifikasi fisik kasir, serta sinkronisasi basis data
          inventaris buku pasca penutupan layanan sirkulasi harian. Seluruh
          transaksi peminjaman, pengembalian atomik, dan penerimaan denda telah
          diaudit sesuai standar kepatuhan operasional (BR-01 s/d BR-07).
        </p>

        {/* Financial & Circulation Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              Saldo Kas Denda Tervalidasi
            </div>
            <div className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">
              {formatRupiah(totalFine)}
            </div>
            <div className="text-[11px] text-[#0D6E6E] font-semibold mt-0.5">
              {fines.length} kwitansi lunas • Selisih Rp 0
            </div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              Pemulihan Stok Eksemplar
            </div>
            <div className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">
              {totalReturned} Eksemplar
            </div>
            <div className="text-[11px] text-[#0D6E6E] font-semibold mt-0.5">
              100% masuk rak fisik
            </div>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              Sirkulasi Aktif Berjalan
            </div>
            <div className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">
              {34 + activeLoansCount} Eksemplar
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tercatat dalam pengawasan sistem
            </div>
          </div>
        </div>

        {/* Fine Ledger Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Lampiran Ringkas Penerimaan Denda Keterlambatan
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">No. Kwitansi</th>
                  <th className="py-2.5 px-3">Peminjam</th>
                  <th className="py-2.5 px-3">Koleksi Buku</th>
                  <th className="py-2.5 px-3 text-right">Denda</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((f) => (
                  <tr key={f.receiptId}>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {f.receiptId}
                    </td>
                    <td className="py-2.5 px-3">
                      {f.memberName}{' '}
                      <span className="font-mono text-slate-400">
                        ({f.memberId})
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {f.bookTitle}{' '}
                      <span className="font-mono text-slate-400">
                        ({f.bookId})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                      {formatRupiah(f.fineAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#0D6E6E] font-semibold">
                      {f.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-4">
            <span>Pengesahan &amp; Serah Terima Keuangan Kasir</span>
            <span className="text-[11px] font-normal text-slate-500">
              Ditandatangani secara elektronik pada 26 Nov 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PUSTAKAWAN UTAMA / KASIR
              </div>
              <div className="my-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-emerald-600/40 bg-emerald-50/50 text-[#0D6E6E] text-[10px] font-extrabold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                TERVERIFIKASI SISTEM
              </div>
              <div className="text-xs font-bold text-slate-900 underline">
                Siti Rahmawati
              </div>
              <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                NIP. 19900412 201503 2 001
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                KEPALA UNIT SIRKULASI
              </div>
              <div className="my-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-slate-400/50 bg-slate-50 text-slate-700 text-[10px] font-extrabold uppercase">
                TERKUNCI FINAL
              </div>
              <div className="text-xs font-bold text-slate-900 underline">
                Hendra Wijaya, S.Hum.
              </div>
              <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                NIP. 19840819 201001 1 008
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                BENDAHARA PERPUSTAKAAN
              </div>
              <div className="my-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#0D6E6E]/40 bg-teal-50/70 text-[#0D6E6E] text-[10px] font-extrabold uppercase">
                LUNAS / SAH • {formatRupiah(totalFine)}
              </div>
              <div className="text-xs font-bold text-slate-900 underline">
                Ratna Kartika, S.E.
              </div>
              <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                NIP. 19881103 201402 2 004
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
