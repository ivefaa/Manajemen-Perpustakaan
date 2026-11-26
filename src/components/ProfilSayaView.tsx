import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Check,
  CheckCircle2,
  Crosshair,
  Info,
  KeyRound,
  Mail,
  Move,
  Phone,
  RotateCcw,
  RotateCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { PhotoCropState, StaffAccount } from '../types/library';
import { clampCropPan, normalizeRotation } from '../utils/authRules';

interface ProfilSayaViewProps {
  accounts: StaffAccount[];
  currentAccount: StaffAccount;
  onSwitchActiveStaff: (accountId: string) => void;
  onSaveProfileDetails: (
    accountId: string,
    updates: Partial<
      Pick<
        StaffAccount,
        | 'fullName'
        | 'academicTitle'
        | 'email'
        | 'phone'
        | 'unitLocation'
        | 'shiftNotes'
      >
    >
  ) => void;
  onApplyCroppedAvatar: (
    accountId: string,
    croppedAvatarUrl: string,
    cropState: PhotoCropState
  ) => void;
  onOpenSecurityPasswordFlow: () => void;
}

export const ProfilSayaView: React.FC<ProfilSayaViewProps> = ({
  accounts,
  currentAccount,
  onSwitchActiveStaff,
  onSaveProfileDetails,
  onApplyCroppedAvatar,
  onOpenSecurityPasswordFlow,
}) => {
  // Editable staff details state
  const [fullName, setFullName] = useState(currentAccount.fullName);
  const [academicTitle, setAcademicTitle] = useState(
    currentAccount.academicTitle
  );
  const [email, setEmail] = useState(currentAccount.email);
  const [phone, setPhone] = useState(currentAccount.phone);
  const [unitLocation, setUnitLocation] = useState(currentAccount.unitLocation);
  const [shiftNotes, setShiftNotes] = useState(currentAccount.shiftNotes);
  const [profileSavedToast, setProfileSavedToast] = useState<string | null>(
    null
  );

  // Interactive cropper state
  const [draftCrop, setDraftCrop] = useState<PhotoCropState>(
    currentAccount.cropState
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragOriginRef = useRef<{
    clientX: number;
    clientY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PIN change modal
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinDraft, setPinDraft] = useState('');
  const [pinSavedMsg, setPinSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setFullName(currentAccount.fullName);
    setAcademicTitle(currentAccount.academicTitle);
    setEmail(currentAccount.email);
    setPhone(currentAccount.phone);
    setUnitLocation(currentAccount.unitLocation);
    setShiftNotes(currentAccount.shiftNotes);
    setDraftCrop(currentAccount.cropState);
  }, [currentAccount]);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfileDetails(currentAccount.id, {
      fullName: fullName.trim() || currentAccount.fullName,
      academicTitle: academicTitle.trim(),
      email: email.trim() || currentAccount.email,
      phone: phone.trim() || currentAccount.phone,
      unitLocation,
      shiftNotes: shiftNotes.trim(),
    });
    setProfileSavedToast(
      `Data kepegawaian ${fullName.trim() || currentAccount.fullName} berhasil diperbarui.`
    );
    window.setTimeout(() => setProfileSavedToast(null), 3500);
  };

  const handleResetDetails = () => {
    setFullName(currentAccount.fullName);
    setAcademicTitle(currentAccount.academicTitle);
    setEmail(currentAccount.email);
    setPhone(currentAccount.phone);
    setUnitLocation(currentAccount.unitLocation);
    setShiftNotes(currentAccount.shiftNotes);
  };

  // Drag-to-pan handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragOriginRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startPanX: draftCrop.panX,
      startPanY: draftCrop.panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragOriginRef.current) return;
    const dx = e.clientX - dragOriginRef.current.clientX;
    const dy = e.clientY - dragOriginRef.current.clientY;
    setDraftCrop((prev) => ({
      ...prev,
      panX: clampCropPan(dragOriginRef.current!.startPanX + dx, prev.zoom),
      panY: clampCropPan(dragOriginRef.current!.startPanY + dy, prev.zoom),
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragOriginRef.current = null;
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const sizeKb = Math.max(1, Math.round(file.size / 1024));
        const sizeLabel =
          sizeKb >= 1024
            ? `${(sizeKb / 1024).toFixed(1)} MB`
            : `${sizeKb} KB`;
        setDraftCrop({
          imageDataUrl: reader.result,
          panX: 0,
          panY: 0,
          zoom: 120,
          rotation: 0,
          fileName: file.name,
          dimensionsLabel: 'Custom Upload',
          fileSizeLabel: sizeLabel,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Render real cropped PNG data URL via Canvas when applying photo
  const handleConfirmCrop = () => {
    const img = new Image();
    img.onload = () => {
      const size = 240;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.translate(
          size / 2 + draftCrop.panX * 0.75,
          size / 2 + draftCrop.panY * 0.75
        );
        ctx.rotate((draftCrop.rotation * Math.PI) / 180);
        const scale = draftCrop.zoom / 100;
        const drawSize = size * scale;
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();

        const croppedUrl = canvas.toDataURL('image/png');
        onApplyCroppedAvatar(currentAccount.id, croppedUrl, draftCrop);
        setProfileSavedToast(
          'Foto profil baru berhasil dipotong dan disinkronkan ke header & kartu staf.'
        );
        window.setTimeout(() => setProfileSavedToast(null), 3500);
      }
    };
    img.src = draftCrop.imageDataUrl;
  };

  const handleRemovePhoto = () => {
    const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0B1E33"/><text x="100" y="114" text-anchor="middle" font-family="sans-serif" font-size="68" font-weight="700" fill="#FFFFFF">${currentAccount.initials}</text></svg>`
    )}`;
    const nextCrop: PhotoCropState = {
      ...draftCrop,
      imageDataUrl: fallbackSvg,
      panX: 0,
      panY: 0,
      zoom: 100,
      rotation: 0,
      fileName: 'inisial-staf.svg',
    };
    setDraftCrop(nextCrop);
    onApplyCroppedAvatar(currentAccount.id, fallbackSvg, nextCrop);
    setProfileSavedToast('Foto profil direset ke inisial standar akun.');
    window.setTimeout(() => setProfileSavedToast(null), 3000);
  };

  const cropImgStyle: React.CSSProperties = {
    transform: `translate(${draftCrop.panX}px, ${draftCrop.panY}px) scale(${
      draftCrop.zoom / 100
    }) rotate(${draftCrop.rotation}deg)`,
  };

  return (
    <div className="space-y-5">
      {/* Page Header & Active Role Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Konfigurasi &amp; Akun /{' '}
            <span className="text-[#0D6E6E]">
              Profil &amp; Editor Foto Petugas
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            Pengaturan Profil &amp; Personalisasi Akun
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data kepegawaian resmi, penugasan sirkulasi aktif, dan
            sesuaikan foto profil digital dengan pemotong interaktif (pan &amp;
            zoom) sebelum disinkronkan ke seluruh sistem.
          </p>
        </div>

        {/* Role Switcher Box */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-1.5 flex items-center gap-1.5 self-start shadow-xs">
          <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PERAN AKTIF:
          </span>
          {accounts.map((acc) => {
            const active = acc.id === currentAccount.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onSwitchActiveStaff(acc.id)}
                className={`px-3 py-1.5 rounded-lg text-left transition-all ${
                  active
                    ? 'bg-[#0B1E33] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold leading-tight whitespace-nowrap">
                  {acc.fullName.split(',')[0]}
                </div>
                <div
                  className={`text-[10px] leading-tight ${
                    active ? 'text-teal-300' : 'text-slate-400'
                  }`}
                >
                  {acc.role === 'sysadmin' ? 'Administrator' : 'Pustakawan'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {profileSavedToast && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold text-[#0D6E6E] animate-slide-down"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSavedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setProfileSavedToast(null)}
            className="text-emerald-700 hover:text-emerald-950"
            aria-label="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Staff Summary + Editable Contact Form + Security Box */}
        <div className="lg:col-span-5 space-y-5">
          {/* Staff Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={currentAccount.avatarUrl}
                    alt={currentAccount.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
                  />
                  <span
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                    title="Aktif"
                  />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    {currentAccount.fullName}
                    {currentAccount.academicTitle
                      ? `, ${currentAccount.academicTitle}`
                      : ''}
                  </h2>
                  <div className="text-[10.5px] font-extrabold tracking-wider uppercase text-[#0D6E6E] mt-0.5">
                    {currentAccount.roleLabel}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    NIP: {currentAccount.id}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#0D6E6E]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  STASIUN KERJA
                </div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {currentAccount.stationLabel}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  IZIN AKSES
                </div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {currentAccount.accessScopeLabel}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  JADWAL SHIFT
                </div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {currentAccount.shiftLabel}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  STATUS SYNC
                </div>
                <div className="font-bold text-[#0D6E6E] mt-0.5 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tersinkronisasi
                </div>
              </div>
            </div>
          </div>

          {/* Data Pegawai & Kontak Form */}
          <form
            onSubmit={handleSaveDetails}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0D6E6E]" />
                <h2 className="text-sm font-extrabold text-slate-900">
                  Data Pegawai &amp; Kontak
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10.5px] font-semibold text-slate-500">
                Diperbarui: Hari Ini
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="profile-fullname"
                  className="block text-[11.5px] font-bold text-slate-700 mb-1"
                >
                  Nama Lengkap Resmi
                </label>
                <input
                  id="profile-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                />
              </div>
              <div>
                <label
                  htmlFor="profile-title"
                  className="block text-[11.5px] font-bold text-slate-700 mb-1"
                >
                  Gelar Akademik
                </label>
                <input
                  id="profile-title"
                  type="text"
                  value={academicTitle}
                  onChange={(e) => setAcademicTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Email Kedinasan Perpustakaan
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Nomor Telepon / WhatsApp Dinamis
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="profile-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-unit"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Unit Penugasan &amp; Lokasi Kerja
              </label>
              <select
                id="profile-unit"
                value={unitLocation}
                onChange={(e) => setUnitLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E]"
              >
                <option value="Meja Sirkulasi Barat (A-1) - Pengembalian Cepat">
                  Meja Sirkulasi Barat (A-1) - Pengembalian Cepat
                </option>
                <option value="Meja Sirkulasi Utama (A-0) - Layanan Terpadu">
                  Meja Sirkulasi Utama (A-0) - Layanan Terpadu
                </option>
                <option value="Pusat Kontrol IT & Basis Data Katalog (Lt. 2)">
                  Pusat Kontrol IT &amp; Basis Data Katalog (Lt. 2)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-notes"
                className="block text-[11.5px] font-bold text-slate-700 mb-1"
              >
                Catatan Tugas / Handover Shift
              </label>
              <textarea
                id="profile-notes"
                rows={3}
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0D6E6E] focus:ring-2 focus:ring-[#0D6E6E]/15"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleResetDetails}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal / Reset
              </button>
              <button
                type="submit"
                className="flex-1 h-10 px-4 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5 text-teal-300" />
                <span>Simpan Perubahan Data</span>
              </button>
            </div>
          </form>

          {/* Autentikasi & Keamanan Akun */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0D6E6E]" />
              <h2 className="text-sm font-extrabold text-slate-900">
                Autentikasi &amp; Keamanan Akun
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              PIN sirkulasi aktif (Terakhir sandi diperbarui:{' '}
              {currentAccount.lastPasswordUpdatedLabel}). Kredensial dua faktor
              terhubung ke{' '}
              <span className="font-mono text-slate-700">
                {currentAccount.email}
              </span>
              .
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPinDraft(currentAccount.pin);
                  setPinSavedMsg(null);
                  setPinModalOpen(true);
                }}
                className="text-xs font-bold text-[#0D6E6E] hover:underline inline-flex items-center gap-1"
              >
                <span>Ubah PIN Akses Kasir Sirkulasi →</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={onOpenSecurityPasswordFlow}
                className="text-xs font-bold text-slate-700 hover:text-[#0D6E6E] inline-flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Ganti Kata Sandi Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Photo Cropper */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Editor &amp; Pemotong Foto Profil Interaktif
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Geser (pan) dan atur skala perbesaran (zoom) agar foto staf
                  terpusat sempurna pada lingkaran identitas resmi.
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  className="hidden"
                  aria-label="Unggah berkas foto profil"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <span>Unggah Foto</span>
                </button>
              </div>
            </div>

            {/* Interactive Pan & Zoom Viewport */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              data-testid="photo-crop-stage"
              className="relative h-[300px] sm:h-[330px] rounded-2xl bg-[#0F172A] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center border border-slate-800"
            >
              {/* Draggable & Zoomable Image */}
              <img
                src={draftCrop.imageDataUrl}
                alt="Kanvas Pemotong Foto Profil"
                draggable={false}
                style={cropImgStyle}
                className="w-64 h-64 object-cover pointer-events-none transition-transform duration-75"
              />

              {/* Circular Dark Vignette Mask Overlay */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                aria-hidden="true"
              >
                <div className="w-56 h-56 rounded-full border-2 border-teal-300 shadow-[0_0_0_9999px_rgba(11,30,51,0.58)] relative">
                  <div className="absolute inset-0 border border-white/25 rounded-full" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15" />
                </div>
              </div>

              {/* Top-left hint badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/15 text-[11px] font-semibold text-white inline-flex items-center gap-1.5 pointer-events-none">
                <Move className="w-3 h-3 text-teal-300" />
                <span>Klik &amp; Geser Foto (Pan)</span>
              </div>

              {/* Bottom-right live coordinates */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/85 border border-white/15 font-mono text-[11px] font-semibold text-teal-200 tabular-nums pointer-events-none">
                X: {draftCrop.panX}px | Y: {draftCrop.panY}px
              </div>
            </div>

            {/* Zoom & Rotation Controls */}
            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <label
                  htmlFor="crop-zoom-slider"
                  className="font-bold text-slate-800 inline-flex items-center gap-1.5"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <span>Skala Perbesaran (Zoom)</span>
                </label>
                <span className="font-mono font-bold text-[#0D6E6E] tabular-nums">
                  {draftCrop.zoom}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setDraftCrop((prev) => ({
                      ...prev,
                      zoom: Math.max(80, prev.zoom - 10),
                    }))
                  }
                  aria-label="Perkecil zoom foto"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  id="crop-zoom-slider"
                  type="range"
                  min={80}
                  max={220}
                  step={5}
                  value={draftCrop.zoom}
                  onChange={(e) =>
                    setDraftCrop((prev) => ({
                      ...prev,
                      zoom: Number(e.target.value),
                    }))
                  }
                  className="flex-1 accent-[#0D6E6E]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraftCrop((prev) => ({
                      ...prev,
                      zoom: Math.min(220, prev.zoom + 10),
                    }))
                  }
                  aria-label="Perbesar zoom foto"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Presets + Rotate + Center */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">
                    Presets:
                  </span>
                  {[
                    { label: '100% Fit', value: 100 },
                    { label: '125%', value: 125 },
                    { label: '150%', value: 150 },
                    { label: '200%', value: 200 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() =>
                        setDraftCrop((prev) => ({ ...prev, zoom: preset.value }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        draftCrop.zoom === preset.value
                          ? 'bg-[#0B1E33] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDraftCrop((prev) => ({
                        ...prev,
                        rotation: normalizeRotation(prev.rotation - 90),
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>-90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftCrop((prev) => ({
                        ...prev,
                        rotation: normalizeRotation(prev.rotation + 90),
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>+90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftCrop((prev) => ({ ...prev, panX: 0, panY: 0 }))
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Center</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Crop Preview (3 Sizes) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800">
                  Pratinjau Hasil Potongan Nyata (Live Crop Preview)
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0D6E6E] text-[10.5px] font-bold">
                  Tampilan Tajam 1:1
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: 'Header Bar (40px)', size: 40, dim: '40 × 40 px' },
                  { title: 'Kartu Staf (80px)', size: 80, dim: '80 × 80 px' },
                  {
                    title: 'Resolusi Penuh (120px)',
                    size: 108,
                    dim: '120 × 120 px',
                  },
                ].map((prevBox) => (
                  <div
                    key={prevBox.title}
                    className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3 flex flex-col items-center justify-between gap-2 text-center"
                  >
                    <div className="text-[10.5px] font-semibold text-slate-500">
                      {prevBox.title}
                    </div>
                    <div
                      style={{ width: prevBox.size, height: prevBox.size }}
                      className="rounded-full overflow-hidden border-2 border-white shadow-sm bg-[#0B1E33] flex items-center justify-center shrink-0"
                    >
                      <img
                        src={draftCrop.imageDataUrl}
                        alt={prevBox.title}
                        style={{
                          transform: `translate(${
                            (draftCrop.panX * prevBox.size) / 224
                          }px, ${(draftCrop.panY * prevBox.size) / 224}px) scale(${
                            draftCrop.zoom / 100
                          }) rotate(${draftCrop.rotation}deg)`,
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {prevBox.dim}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Specs Strip */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <span>
                Berkas: <strong>{draftCrop.fileName}</strong> • Dimensi:{' '}
                <strong>{draftCrop.dimensionsLabel}</strong> • Ukuran:{' '}
                <strong>{draftCrop.fileSizeLabel}</strong>
              </span>
              <span className="font-bold text-[#0D6E6E]">
                Memenuhi Syarat Kedinasan
              </span>
            </div>

            {/* Bottom Cropper Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Foto</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDraftCrop(currentAccount.cropState)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1E33] hover:bg-[#132C4A] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5 text-teal-300" />
                  <span>Terapkan &amp; Konfirmasi Foto Profil</span>
                </button>
              </div>
            </div>
          </div>

          {/* Photo Guidelines Box */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D6E6E] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">
                Standar Foto Profil Petugas PustakaModern
              </div>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Pastikan wajah staf menghadap ke depan dengan ekspresi ramah,
                pencahayaan merata, dan pakaian dinas rapi atau hijab resmi.
                Foto yang dikonfirmasi akan dicetak otomatis pada kartu
                sirkulasi fisik dan dicantumkan pada slip peminjaman pemustaka.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portaled PIN Kasir Modal */}
      {pinModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px] animate-backdrop-enter"
            onClick={() => setPinModalOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pin-modal-title"
              className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    id="pin-modal-title"
                    className="text-base font-extrabold text-slate-900"
                  >
                    Ubah PIN Kasir Sirkulasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    PIN 6-digit digunakan untuk otorisasi penutupan kas harian.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  aria-label="Tutup dialog PIN"
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label
                  htmlFor="kasir-pin-input"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  PIN Baru (6 Digit Angka)
                </label>
                <input
                  id="kasir-pin-input"
                  type="password"
                  maxLength={6}
                  value={pinDraft}
                  onChange={(e) =>
                    setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 font-mono text-base tracking-[0.35em] text-center font-bold focus:outline-none focus:border-[#0D6E6E]"
                />
              </div>

              {pinSavedMsg && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#0D6E6E]">
                  {pinSavedMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={pinDraft.length !== 6}
                  onClick={() => {
                    setPinSavedMsg('PIN Kasir berhasil diperbarui.');
                    window.setTimeout(() => setPinModalOpen(false), 900);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    pinDraft.length === 6
                      ? 'bg-[#0B1E33] text-white hover:bg-[#132C4A]'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Simpan PIN
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
