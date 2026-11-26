/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AuthPortalView } from './components/AuthPortalView';
import { BeritaAcaraView } from './components/BeritaAcaraView';
import { BookDetailModal } from './components/BookDetailModal';
import { KatalogView } from './components/KatalogView';
import { LaporanDendaView } from './components/LaporanDendaView';
import { LayoutShell } from './components/LayoutShell';
import { PeminjamanView } from './components/PeminjamanView';
import { PengaturanView } from './components/PengaturanView';
import { PengembalianView } from './components/PengembalianView';
import { ProfilSayaView } from './components/ProfilSayaView';
import { TambahBukuView } from './components/TambahBukuView';
import {
  INITIAL_STAFF_ACCOUNTS,
  INITIAL_SYSTEM_SETTINGS,
  type SystemSecuritySettings,
} from './data/authData';
import {
  INITIAL_ACTIVE_LOANS,
  INITIAL_BOOKS,
  INITIAL_FINE_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RETURN_HISTORY,
  INITIAL_TODAY_CIRCULATION,
} from './data/seedData';
import type {
  AuthScreenMode,
  Book,
  FineRecord,
  LoanTransaction,
  NavTab,
  NotificationItem,
  PhotoCropState,
  ReturnHistoryItem,
  StaffAccount,
} from './types/library';
import { processBorrowBook, processReturnBook } from './utils/libraryRules';

export default function App() {
  // Authentication & Staff Account State
  const isAutostartParam =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [authMode, setAuthMode] = useState<AuthScreenMode>(
    isAutostartParam ? 'authenticated' : 'login'
  );
  const [accounts, setAccounts] = useState<StaffAccount[]>(
    INITIAL_STAFF_ACCOUNTS
  );
  const [currentUserId, setCurrentUserId] = useState<string>(
    INITIAL_STAFF_ACCOUNTS[0].id
  );
  const [recoveryTargetId, setRecoveryTargetId] = useState<string>(
    INITIAL_STAFF_ACCOUNTS[0].id
  );
  const [systemSettings, setSystemSettings] = useState<SystemSecuritySettings>(
    INITIAL_SYSTEM_SETTINGS
  );

  // Dashboard Circulation & Catalog State
  const [activeTab, setActiveTab] = useState<NavTab>('katalog');
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [activeLoans, setActiveLoans] =
    useState<LoanTransaction[]>(INITIAL_ACTIVE_LOANS);
  const [todayCirculation, setTodayCirculation] = useState<LoanTransaction[]>(
    INITIAL_TODAY_CIRCULATION
  );
  const [returnHistory, setReturnHistory] = useState<ReturnHistoryItem[]>(
    INITIAL_RETURN_HISTORY
  );
  const [fines, setFines] = useState<FineRecord[]>(INITIAL_FINE_RECORDS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  const [detailBookId, setDetailBookId] = useState<string | null>(null);
  const [preselectedBorrowBookId, setPreselectedBorrowBookId] = useState<
    string | null
  >(null);
  const [nextTrxSeq, setNextTrxSeq] = useState(89);
  const [nextReceiptSeq, setNextReceiptSeq] = useState(78);
  const [shiftClosed, setShiftClosed] = useState(false);

  const currentUser =
    accounts.find((a) => a.id === currentUserId) || accounts[0];

  const nextTransactionCode = `TRX-20261126-${String(nextTrxSeq).padStart(
    3,
    '0'
  )}`;

  const selectedDetailBook =
    books.find((b) => b.id === detailBookId) || null;

  // Global Keyboard Shortcuts when authenticated
  useEffect(() => {
    if (authMode !== 'authenticated') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setDetailBookId(null);
        setActiveTab('peminjaman');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setDetailBookId(null);
        setActiveTab('tambah');
      } else if (e.key === 'Escape' && detailBookId) {
        setDetailBookId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authMode, detailBookId]);

  const handleLoginSuccess = useCallback((account: StaffAccount) => {
    setCurrentUserId(account.id);
    setAuthMode('authenticated');
    setActiveTab('katalog');
  }, []);

  const handlePasswordUpdated = useCallback(
    (accountId: string, newPassword: string) => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id !== accountId) return acc;
          return {
            ...acc,
            passwordHistory: [acc.password, ...acc.passwordHistory].slice(0, 5),
            password: newPassword,
            lastPasswordUpdatedLabel: 'Baru saja (26 Nov 2026)',
          };
        })
      );
    },
    []
  );

  const handleSaveProfileDetails = useCallback(
    (
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
    ) => {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, ...updates } : acc))
      );
    },
    []
  );

  const handleApplyCroppedAvatar = useCallback(
    (
      accountId: string,
      croppedAvatarUrl: string,
      cropState: PhotoCropState
    ) => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? { ...acc, avatarUrl: croppedAvatarUrl, cropState }
            : acc
        )
      );
    },
    []
  );

  const handleQuickBorrowBook = useCallback((book: Book) => {
    setDetailBookId(null);
    setPreselectedBorrowBookId(book.id);
    setActiveTab('peminjaman');
  }, []);

  const handleSubmitBorrow = useCallback(
    (params: { bookId: string; memberInput: string }) => {
      const result = processBorrowBook({
        books,
        loans: activeLoans,
        bookId: params.bookId,
        memberInput: params.memberInput,
        transactionId: nextTransactionCode,
      });

      if (!result.success || !result.createdLoan) {
        return { success: false, error: result.error };
      }

      setBooks(result.books);
      setActiveLoans(result.loans);
      setTodayCirculation((prev) => [result.createdLoan!, ...prev]);
      setNextTrxSeq((n) => n + 1);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Peminjaman Baru (${result.createdLoan!.id})`,
          detail: `${result.createdLoan!.memberName} (${result.createdLoan!.memberId}) meminjam ${result.createdLoan!.bookTitle}.`,
          time: 'Baru saja',
          type: 'success',
          unread: true,
        },
        ...prev,
      ]);

      return {
        success: true,
        createdLoan: result.createdLoan,
        previousStock: result.previousStock,
        newStock: result.newStock,
      };
    },
    [books, activeLoans, nextTransactionCode]
  );

  const handleProcessReturn = useCallback(
    (transactionId: string) => {
      const res = processReturnBook({
        books,
        loans: activeLoans,
        returns: returnHistory,
        fines,
        transactionId,
        nextReceiptNumber: nextReceiptSeq,
      });

      if (!res.success || !res.returnedRecord) {
        return { success: false };
      }

      setBooks(res.books);
      setActiveLoans(res.loans);
      setReturnHistory(res.returns);
      setFines(res.fines);
      if (res.createdFine) {
        setNextReceiptSeq((n) => n + 1);
      }

      setNotifications((prev) => [
        {
          id: `notif-ret-${Date.now()}`,
          title: `Pengembalian Diproses (${res.returnedRecord!.id})`,
          detail: `${res.returnedRecord!.bookTitle} dikembalikan oleh ${res.returnedRecord!.memberName} (Stok +1).`,
          time: 'Baru saja',
          type: res.returnedRecord!.finePaid > 0 ? 'warning' : 'success',
          unread: true,
        },
        ...prev,
      ]);

      return {
        success: true,
        returnedRecord: res.returnedRecord,
      };
    },
    [books, activeLoans, returnHistory, fines, nextReceiptSeq]
  );

  const handleRegisterBook = useCallback((newBook: Book, stayOnPage: boolean) => {
    setBooks((prev) => [...prev, newBook]);
    setNotifications((prev) => [
      {
        id: `notif-add-${Date.now()}`,
        title: `Koleksi Baru (${newBook.id})`,
        detail: `${newBook.title} (${newBook.totalStock} eksemplar) ditambahkan ke katalog.`,
        time: 'Baru saja',
        type: 'success',
        unread: true,
      },
      ...prev,
    ]);
    if (!stayOnPage) {
      setActiveTab('katalog');
    }
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  if (authMode !== 'authenticated') {
    return (
      <AuthPortalView
        mode={authMode}
        accounts={accounts}
        recoveryTargetId={recoveryTargetId}
        onChangeMode={(nextMode) => setAuthMode(nextMode)}
        onSetRecoveryTargetId={(id) => setRecoveryTargetId(id)}
        onLoginSuccess={handleLoginSuccess}
        onPasswordUpdated={handlePasswordUpdated}
      />
    );
  }

  return (
    <LayoutShell
      activeTab={activeTab}
      onSelectTab={(tab) => {
        if (tab !== 'peminjaman') {
          setPreselectedBorrowBookId(null);
        }
        setActiveTab(tab);
      }}
      books={books}
      onQuickSelectBook={(book) => setDetailBookId(book.id)}
      notifications={notifications}
      onMarkAllRead={handleMarkAllRead}
      currentUser={currentUser}
      onLogout={() => {
        setDetailBookId(null);
        setAuthMode('login');
      }}
    >
      {activeTab === 'katalog' && (
        <KatalogView
          books={books}
          totalCatalogTitlesOffset={1232}
          totalCatalogCopiesOffset={3813}
          activeLoansDelta={0}
          shiftClosed={shiftClosed}
          returnCountToday={18 + returnHistory.length}
          activeLoansCountForShift={34 + activeLoans.length}
          onSelectBookDetail={(book) => setDetailBookId(book.id)}
          onQuickBorrowBook={handleQuickBorrowBook}
          onNavigatePeminjaman={() => {
            setPreselectedBorrowBookId(null);
            setActiveTab('peminjaman');
          }}
          onNavigateTambahBuku={() => setActiveTab('tambah')}
          onOpenBeritaAcara={() => setActiveTab('berita-acara')}
        />
      )}

      {activeTab === 'peminjaman' && (
        <PeminjamanView
          books={books}
          preselectedBookId={preselectedBorrowBookId}
          todayCirculation={todayCirculation}
          nextTransactionCode={nextTransactionCode}
          onSubmitBorrow={handleSubmitBorrow}
          onGoToPengembalian={() => setActiveTab('pengembalian')}
        />
      )}

      {activeTab === 'pengembalian' && (
        <PengembalianView
          activeLoans={activeLoans}
          returnHistory={returnHistory}
          returnedTodayBaselineOffset={16}
          activeLoansBaselineOffset={36}
          onProcessReturn={handleProcessReturn}
          onGoToKatalog={() => setActiveTab('katalog')}
        />
      )}

      {activeTab === 'tambah' && (
        <TambahBukuView
          books={books}
          onRegisterBook={handleRegisterBook}
        />
      )}

      {activeTab === 'laporan' && (
        <LaporanDendaView
          fines={fines}
          processedReturnsCount={returnHistory.length + 3}
          activeLoansCount={activeLoans.length}
          shiftClosed={shiftClosed}
          onCloseShiftCash={() => setShiftClosed(true)}
          onOpenBeritaAcara={() => setActiveTab('berita-acara')}
          onGoToKatalog={() => setActiveTab('katalog')}
        />
      )}

      {activeTab === 'berita-acara' && (
        <BeritaAcaraView
          fines={fines}
          processedReturnsCount={returnHistory.length + 3}
          activeLoansCount={activeLoans.length}
          onBackToLaporan={() => setActiveTab('laporan')}
          onBackToKatalog={() => setActiveTab('katalog')}
        />
      )}

      {activeTab === 'pengaturan' && (
        <PengaturanView
          currentAccount={currentUser}
          settings={systemSettings}
          onUpdateSettings={setSystemSettings}
          onOpenSecurityPasswordFlow={() => {
            setRecoveryTargetId(currentUser.id);
            setAuthMode('recovery-step2');
          }}
          onLogout={() => setAuthMode('login')}
        />
      )}

      {activeTab === 'profil' && (
        <ProfilSayaView
          accounts={accounts}
          currentAccount={currentUser}
          onSwitchActiveStaff={(id) => setCurrentUserId(id)}
          onSaveProfileDetails={handleSaveProfileDetails}
          onApplyCroppedAvatar={handleApplyCroppedAvatar}
          onOpenSecurityPasswordFlow={() => {
            setRecoveryTargetId(currentUser.id);
            setAuthMode('recovery-step2');
          }}
        />
      )}

      <BookDetailModal
        book={selectedDetailBook}
        activeLoans={activeLoans}
        returnHistory={returnHistory}
        onClose={() => setDetailBookId(null)}
        onBorrowBook={handleQuickBorrowBook}
      />
    </LayoutShell>
  );
}
