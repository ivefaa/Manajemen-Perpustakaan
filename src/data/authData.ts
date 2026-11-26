import type { StaffAccount } from '../types/library';

function buildPortraitSvgDataUrl(opts: {
  bgFrom: string;
  bgTo: string;
  hijabOrHair: string;
  blazer: string;
  skin: string;
  glasses?: boolean;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${opts.bgFrom}"/>
        <stop offset="100%" stop-color="${opts.bgTo}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bg)"/>
    <g opacity="0.22" fill="#FFFFFF">
      <rect x="28" y="34" width="22" height="145" rx="3"/>
      <rect x="56" y="50" width="18" height="129" rx="3"/>
      <rect x="80" y="28" width="26" height="151" rx="3"/>
      <rect x="304" y="42" width="22" height="138" rx="3"/>
      <rect x="332" y="26" width="26" height="154" rx="3"/>
      <rect x="364" y="54" width="16" height="126" rx="3"/>
    </g>
    <ellipse cx="200" cy="395" rx="145" ry="125" fill="${opts.blazer}"/>
    <path d="M150 285 L200 355 L250 285 L228 272 L200 315 L172 272 Z" fill="#F8FAFC"/>
    <path d="M122 170 C122 95 278 95 278 170 L286 290 C252 315 148 315 114 290 Z" fill="${opts.hijabOrHair}"/>
    <ellipse cx="200" cy="182" rx="56" ry="66" fill="${opts.skin}"/>
    <path d="M144 166 C144 110 256 110 256 166 C236 142 164 142 144 166 Z" fill="${opts.hijabOrHair}"/>
    <circle cx="179" cy="175" r="5" fill="#0F172A"/>
    <circle cx="221" cy="175" r="5" fill="#0F172A"/>
    ${
      opts.glasses
        ? '<rect x="160" y="162" width="36" height="24" rx="6" fill="none" stroke="#1E293B" stroke-width="3.5"/><rect x="204" y="162" width="36" height="24" rx="6" fill="none" stroke="#1E293B" stroke-width="3.5"/><line x1="196" y1="173" x2="204" y2="173" stroke="#1E293B" stroke-width="3.5"/>'
        : ''
    }
    <path d="M179 208 Q200 225 221 208" fill="none" stroke="#9A3412" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="234" y="328" width="46" height="22" rx="4" fill="#FFFFFF" opacity="0.9"/>
    <rect x="240" y="335" width="34" height="8" rx="2" fill="#0D6E6E"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_SITI_AVATAR = buildPortraitSvgDataUrl({
  bgFrom: '#1E293B',
  bgTo: '#0D6E6E',
  hijabOrHair: '#0B1E33',
  blazer: '#0F172A',
  skin: '#F5C6A5',
  glasses: false,
});

export const DEFAULT_BUDI_AVATAR = buildPortraitSvgDataUrl({
  bgFrom: '#0F172A',
  bgTo: '#334155',
  hijabOrHair: '#1E293B',
  blazer: '#0B1E33',
  skin: '#EAC09E',
  glasses: true,
});

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'PST-2026-088',
    initials: 'SR',
    fullName: 'Siti Rahmawati',
    academicTitle: 'S.Hum.',
    role: 'pustakawan',
    roleLabel: 'Pustakawan Utama',
    stationLabel: 'Meja Sirkulasi Barat (A-1)',
    accessScopeLabel: 'Sirkulasi & Pengatalogan',
    shiftLabel: 'Pagi (07.30 - 15.30 WIB)',
    email: 'siti.rahmawati@pustakamodern.id',
    phone: '+62 812-4455-8821',
    maskedPhone: '0812-****-4821',
    unitLocation: 'Meja Sirkulasi Barat (A-1) - Pengembalian Cepat',
    shiftNotes:
      'Fokus menangani pengembalian buku terlambat dan sinkronisasi label barcode koleksi fiksi remaja seri K-20.',
    password: 'Pustaka#2026',
    passwordHistory: ['PustakaLama#2025', 'Sirkulasi@2025', 'BukuKita#2024'],
    pin: '261188',
    avatarUrl: DEFAULT_SITI_AVATAR,
    cropState: {
      imageDataUrl: DEFAULT_SITI_AVATAR,
      panX: 0,
      panY: 0,
      zoom: 125,
      rotation: 0,
      fileName: 'profil-siti-rahmawati.svg',
      dimensionsLabel: '1200x1200px',
      fileSizeLabel: '1.2 MB',
    },
    lastPasswordUpdatedLabel: '26 Nov 2026, 08:15 WIB',
  },
  {
    id: 'ADM-9901-002',
    initials: 'BS',
    fullName: 'Budi Santoso, S.Kom',
    academicTitle: 'M.T.I.',
    role: 'sysadmin',
    roleLabel: 'Administrator Sistem',
    stationLabel: 'Ruang Server & Infrastruktur IT',
    accessScopeLabel: 'Full RBAC • Audit & Konfigurasi',
    shiftLabel: 'Reguler (08.00 - 17.00 WIB)',
    email: 'budi.santoso@pustakamodern.id',
    phone: '+62 811-7788-4022',
    maskedPhone: '0811-****-4022',
    unitLocation: 'Pusat Kontrol IT & Basis Data Katalog (Lt. 2)',
    shiftNotes:
      'Pemeliharaan rutin indeks katalog, audit tanda tangan digital, dan kebijakan enkripsi TLS 1.3.',
    password: 'Admin#Pustaka2026',
    passwordHistory: ['SysAdmin#2025', 'RootLib@2025', 'Server#2024'],
    pin: '990102',
    avatarUrl: DEFAULT_BUDI_AVATAR,
    cropState: {
      imageDataUrl: DEFAULT_BUDI_AVATAR,
      panX: 0,
      panY: 0,
      zoom: 115,
      rotation: 0,
      fileName: 'profil-budi-santoso.svg',
      dimensionsLabel: '1200x1200px',
      fileSizeLabel: '1.1 MB',
    },
    lastPasswordUpdatedLabel: '15 Nov 2026, 14:20 WIB',
  },
];

export interface SystemSecuritySettings {
  dailyFineRate: number;
  defaultLoanDays: number;
  sessionTimeoutMinutes: number;
  enforceTwoFactor: boolean;
  autoLockCashDrawer: boolean;
  requireOverdueReceiptPrint: boolean;
}

export const INITIAL_SYSTEM_SETTINGS: SystemSecuritySettings = {
  dailyFineRate: 1000,
  defaultLoanDays: 7,
  sessionTimeoutMinutes: 30,
  enforceTwoFactor: true,
  autoLockCashDrawer: true,
  requireOverdueReceiptPrint: true,
};
