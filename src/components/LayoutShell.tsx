import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  HelpCircle,
  LogOut,
  Menu,
  PlusSquare,
  RotateCcw,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserCircle2,
  X,
} from 'lucide-react';
import type {
  Book,
  NavTab,
  NotificationItem,
  StaffAccount,
} from '../types/library';
import { BrandLogo } from './BrandLogo';

interface LayoutShellProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  books: Book[];
  onQuickSelectBook: (book: Book) => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  currentUser: StaffAccount;
  onLogout: () => void;
  children: React.ReactNode;
}

const MAIN_NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'katalog', label: 'Katalog Buku', icon: BookOpen },
  { id: 'peminjaman', label: 'Peminjaman Baru', icon: ShoppingCart },
  { id: 'pengembalian', label: 'Pengembalian', icon: RotateCcw },
  { id: 'tambah', label: 'Tambah Buku', icon: PlusSquare },
  { id: 'laporan', label: 'Laporan & Denda', icon: TrendingUp },
];

const ACCOUNT_NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'pengaturan',
    label: 'Pengaturan Sistem & Hak Akses',
    icon: Settings,
  },
  { id: 'profil', label: 'Profil Saya', icon: UserCircle2 },
];

export const LayoutShell: React.FC<LayoutShellProps> = ({
  activeTab,
  onSelectTab,
  books,
  onQuickSelectBook,
  notifications,
  onMarkAllRead,
  currentUser,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const searchResults = globalQuery.trim()
    ? books
        .filter((b) => {
          const q = globalQuery.trim().toLowerCase();
          return (
            b.id.toLowerCase().includes(q) ||
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const effectiveNav = activeTab === 'berita-acara' ? 'laporan' : activeTab;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden animate-backdrop-enter"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[252px] shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
        aria-label="Navigasi Utama"
      >
        <div>
          {/* Brand Lockup with New PustakaModern Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <button
              type="button"
              onClick={() => handleNavClick('katalog')}
              className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E] rounded-lg p-1 -ml-1"
            >
              <BrandLogo
                size="md"
                className="group-hover:bg-[#0F2B49] transition-colors"
              />
              <div>
                <div className="text-[15px] font-bold tracking-tight text-[#0F172A] leading-tight">
                  PustakaModern
                </div>
                <div className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                  V1.0 • Admin Desk
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Nav Links */}
          <div className="px-3 pt-5 space-y-5">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                NAVIGASI UTAMA
              </div>
              <nav className="space-y-1">
                {MAIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = effectiveNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E] ${
                        isActive
                          ? 'bg-[#0B1E33] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-teal-300' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Konfigurasi & Akun Section */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                KONFIGURASI &amp; AKUN
              </div>
              <nav className="space-y-1">
                {ACCOUNT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = effectiveNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E] ${
                        isActive
                          ? 'bg-[#0B1E33] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-teal-300' : 'text-slate-500'
                        }`}
                      />
                      <span className="leading-snug">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Service Status Box */}
        <div className="p-3">
          <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-500">Status Layanan</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktif
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="truncate">Koneksi Stabil • Stok Selaras</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Date */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E]"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">
                Kamis, 26 November 2026
              </span>
              <span aria-hidden="true">•</span>
              <span>Sirkulasi Perpustakaan</span>
            </div>
          </div>

          {/* Center: Global Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={globalQuery}
              onChange={(e) => {
                setGlobalQuery(e.target.value);
                setSearchFocused(true);
              }}
              onFocus={() => setSearchFocused(true)}
              placeholder="Cari ID atau judul buku (misal: BK-001)..."
              aria-label="Pencarian cepat katalog buku"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F1F5F9] border border-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D6E6E]/15 transition-all"
            />
            {searchFocused && globalQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-11 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 animate-slide-down">
                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {searchResults.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onQuickSelectBook(b);
                            setSearchFocused(false);
                            setGlobalQuery('');
                          }}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold text-[#0D6E6E] bg-teal-50 px-1.5 py-0.5 rounded">
                                {b.id}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {b.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {b.author} • {b.shelf}
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-semibold whitespace-nowrap ${
                              b.availableStock > 0
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }`}
                          >
                            {b.availableStock > 0
                              ? `${b.availableStock} Tersedia`
                              : 'Habis'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-xs text-slate-500">
                    Tidak ditemukan buku untuk &ldquo;{globalQuery}&rdquo;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Bell, Help, Live Staff Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifikasi sirkulasi"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E]"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Notifikasi Sirkulasi
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="text-[11px] font-semibold text-[#0D6E6E] hover:underline"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-xs ${
                          n.unread ? 'bg-teal-50/35' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-800">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {n.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="Panduan aturan sistem perpustakaan"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E]"
            >
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* User Profile Trigger & Dropdown */}
            <div ref={userMenuRef} className="relative pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-label="Menu akun petugas aktif"
                className="flex items-center gap-2.5 rounded-xl p-1 hover:bg-slate-100/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D6E6E]"
              >
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {currentUser.roleLabel}
                  </div>
                </div>
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {currentUser.id} • {currentUser.roleLabel}
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleNavClick('profil');
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <UserCircle2 className="w-4 h-4 text-[#0D6E6E]" />
                      <span>Profil &amp; Editor Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleNavClick('pengaturan');
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Pengaturan &amp; Hak Akses</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar / Kunci Terminal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto">
          <div key={activeTab} className="animate-page-in">
            {children}
          </div>
        </main>
      </div>

      {/* Portaled Help / Rules Guide Modal */}
      {helpOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px] animate-backdrop-enter"
            onClick={() => setHelpOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-modal-title"
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="help-modal-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Standar Operasional &amp; Aturan Sirkulasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Referensi cepat FR-01 s/d FR-07 &amp; BR-01 s/d BR-07
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  aria-label="Tutup panduan"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">
                      FR-01 / BR-01 &amp; BR-02:
                    </span>{' '}
                    ID Buku unik berformat{' '}
                    <span className="font-mono">BK-XXX</span> dan stok awal
                    wajib bilangan bulat ≥ 0.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">
                      FR-04 / BR-03 &amp; BR-04:
                    </span>{' '}
                    Peminjaman memverifikasi stok &gt; 0 (anti-negatif) dan
                    mengurangi stok secara atomik (-1).
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D6E6E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">
                      FR-06 / BR-05 &amp; BR-07:
                    </span>{' '}
                    Pengembalian memulihkan stok (+1), menghitung denda
                    keterlambatan Rp 1.000/hari, dan mencatat kwitansi permanen.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
                  <span className="font-medium text-teal-900">
                    Pintasan Keyboard Cepat
                  </span>
                  <span className="font-mono text-[11px] text-teal-800">
                    Alt+P (Pinjam) • F2 (Tambah Buku)
                  </span>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#0B1E33] text-white text-xs font-semibold hover:bg-[#132C4A] transition-colors"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
