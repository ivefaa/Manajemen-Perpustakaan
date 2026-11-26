import type {
  Book,
  BookRegistrationInput,
  BookSortOption,
  BookStatusFilter,
  CashDenomination,
  FineRecord,
  LoanTransaction,
  ReturnHistoryItem,
  ValidationResult,
} from '../types/library';

export const FINE_RATE_PER_DAY = 1000;
export const BASELINE_TODAY_ISO = '2026-11-26';

export function formatRupiah(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  return 'Rp ' + safe.toLocaleString('id-ID');
}

export function formatNumberId(num: number): string {
  return num.toLocaleString('id-ID');
}

export function normalizeBookId(rawId: string): string {
  return rawId.trim().toUpperCase();
}

export function validateBookIdFormat(rawId: string): boolean {
  const id = normalizeBookId(rawId);
  return /^BK-\d{3,}$/.test(id);
}

export function validateBookRegistration(
  input: BookRegistrationInput,
  existingBooks: Book[]
): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const normalizedId = normalizeBookId(input.id);

  if (!normalizedId) {
    errors.id = 'ID Buku wajib diisi.';
  } else if (!validateBookIdFormat(normalizedId)) {
    errors.id = 'Format ID harus BK-XXX (minimal 3 digit angka, mis. BK-009).';
  } else if (existingBooks.some((b) => normalizeBookId(b.id) === normalizedId)) {
    errors.id = `ID ${normalizedId} sudah terdaftar di katalog (BR-01).`;
  }

  if (!input.title.trim()) {
    errors.title = 'Judul buku wajib diisi lengkap (FR-01).';
  } else if (input.title.trim().length < 2) {
    errors.title = 'Judul buku minimal 2 karakter.';
  }

  if (!input.author.trim()) {
    errors.author = 'Nama penulis / pengarang wajib diisi (FR-01).';
  }

  const parsedStock =
    typeof input.initialStock === 'number'
      ? input.initialStock
      : Number(String(input.initialStock).trim());

  if (
    String(input.initialStock).trim() === '' ||
    Number.isNaN(parsedStock) ||
    !Number.isInteger(parsedStock) ||
    parsedStock < 0
  ) {
    errors.initialStock = 'Stok awal harus bilangan bulat ≥ 0 (BR-02).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function canBorrowBook(book: Book | undefined | null): {
  allowed: boolean;
  reason?: string;
} {
  if (!book) {
    return { allowed: false, reason: 'Buku belum dipilih atau tidak ditemukan.' };
  }
  if (book.availableStock <= 0) {
    return {
      allowed: false,
      reason: `Stok habis (0 dari ${book.totalStock} eksemplar). Proteksi anti-negatif (BR-03 & BR-04) menolak peminjaman.`,
    };
  }
  return { allowed: true };
}

export function parseMemberInput(rawMember: string): {
  valid: boolean;
  memberId: string;
  memberName: string;
  error?: string;
} {
  const trimmed = rawMember.trim();
  if (!trimmed) {
    return {
      valid: false,
      memberId: '',
      memberName: '',
      error: 'Nama atau ID Anggota wajib diisi (FR-04).',
    };
  }

  // Match pattern like "AG-2041 (Ahmad Fauzi)"
  const parenMatch = trimmed.match(/^(AG-\d+)\s*\((.+)\)$/i);
  if (parenMatch) {
    return {
      valid: true,
      memberId: parenMatch[1].toUpperCase(),
      memberName: parenMatch[2].trim(),
    };
  }

  // Match pattern like "Ahmad Fauzi (AG-2041)"
  const reverseParenMatch = trimmed.match(/^(.+)\s*\((AG-\d+)\)$/i);
  if (reverseParenMatch) {
    return {
      valid: true,
      memberId: reverseParenMatch[2].toUpperCase(),
      memberName: reverseParenMatch[1].trim(),
    };
  }

  // Match plain ID like "AG-2041"
  if (/^AG-\d+$/i.test(trimmed)) {
    return {
      valid: true,
      memberId: trimmed.toUpperCase(),
      memberName: `Anggota ${trimmed.toUpperCase()}`,
    };
  }

  // Plain name -> generate deterministic AG-XXXX ID
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) % 9000;
  }
  const generatedId = `AG-${1000 + hash}`;
  return {
    valid: true,
    memberId: generatedId,
    memberName: trimmed,
  };
}

export function processBorrowBook(params: {
  books: Book[];
  loans: LoanTransaction[];
  bookId: string;
  memberInput: string;
  transactionId: string;
}): {
  success: boolean;
  error?: string;
  books: Book[];
  loans: LoanTransaction[];
  createdLoan?: LoanTransaction;
  previousStock?: number;
  newStock?: number;
} {
  const { books, loans, bookId, memberInput, transactionId } = params;
  const targetBook = books.find((b) => b.id === bookId);
  const stockCheck = canBorrowBook(targetBook);
  if (!stockCheck.allowed || !targetBook) {
    return {
      success: false,
      error: stockCheck.reason || 'Stok buku tidak mencukupi.',
      books,
      loans,
    };
  }

  const member = parseMemberInput(memberInput);
  if (!member.valid) {
    return {
      success: false,
      error: member.error,
      books,
      loans,
    };
  }

  const prevStock = targetBook.availableStock;
  const nextStock = Math.max(0, prevStock - 1);

  const updatedBooks = books.map((b) =>
    b.id === targetBook.id
      ? {
          ...b,
          availableStock: nextStock,
          lastActivityNote: `Status Sirkulasi Terakhir (${transactionId}): 1 eksemplar baru dipinjam oleh ${member.memberName} (${member.memberId}) pada 26 Nov 2026 • ${
            nextStock > 0
              ? `Stok aman tersedia ${nextStock} eksemplar.`
              : 'Stok habis (0 eksemplar tersedia).'
          }`,
        }
      : b
  );

  const createdLoan: LoanTransaction = {
    id: transactionId,
    bookId: targetBook.id,
    bookTitle: targetBook.title,
    bookShelf: targetBook.shelf,
    memberId: member.memberId,
    memberName: member.memberName,
    borrowDate: BASELINE_TODAY_ISO,
    borrowDateLabel: '26 Nov 2026',
    dueDate: '2026-12-03',
    dueDateLabel: '03 Des 2026',
    timeAgoLabel: 'Baru saja',
    isDueToday: false,
    overdueDays: 0,
    status: 'Dipinjam',
  };

  return {
    success: true,
    books: updatedBooks,
    loans: [createdLoan, ...loans],
    createdLoan,
    previousStock: prevStock,
    newStock: nextStock,
  };
}

export function calculateOverdueFine(overdueDays: number, ratePerDay = FINE_RATE_PER_DAY): number {
  if (overdueDays <= 0) return 0;
  return overdueDays * ratePerDay;
}

export function processReturnBook(params: {
  books: Book[];
  loans: LoanTransaction[];
  returns: ReturnHistoryItem[];
  fines: FineRecord[];
  transactionId: string;
  nextReceiptNumber: number;
  returnTimeLabel?: string;
}): {
  success: boolean;
  error?: string;
  books: Book[];
  loans: LoanTransaction[];
  returns: ReturnHistoryItem[];
  fines: FineRecord[];
  returnedRecord?: ReturnHistoryItem;
  createdFine?: FineRecord;
} {
  const {
    books,
    loans,
    returns,
    fines,
    transactionId,
    nextReceiptNumber,
    returnTimeLabel = '26 November 2026, 15:45 WIB',
  } = params;

  const targetLoan = loans.find(
    (l) => l.id === transactionId && l.status === 'Dipinjam'
  );
  if (!targetLoan) {
    return {
      success: false,
      error: 'Transaksi peminjaman aktif tidak ditemukan.',
      books,
      loans,
      returns,
      fines,
    };
  }

  const targetBook = books.find((b) => b.id === targetLoan.bookId);
  const prevAvailable = targetBook ? targetBook.availableStock : 0;
  const newAvailable = targetBook
    ? Math.min(targetBook.totalStock, targetBook.availableStock + 1)
    : 1;

  const isOverdue = targetLoan.overdueDays > 0;
  const fineAmount = calculateOverdueFine(targetLoan.overdueDays);
  const receiptId = isOverdue
    ? `KWT-20261126-${String(nextReceiptNumber).padStart(3, '0')}`
    : undefined;

  const updatedBooks = books.map((b) =>
    b.id === targetLoan.bookId
      ? {
          ...b,
          availableStock: newAvailable,
          lastActivityNote: `Stok pulih pasca pengembalian (${targetLoan.id}) oleh ${targetLoan.memberName} pada 26 Nov 2026 • Tersedia ${newAvailable} dari ${b.totalStock} eksemplar.`,
        }
      : b
  );

  const updatedLoans = loans.filter((l) => l.id !== transactionId);

  const complianceStatus: ReturnHistoryItem['complianceStatus'] = isOverdue
    ? 'Terlambat (Lunas)'
    : targetLoan.isDueToday
    ? 'Tepat Waktu'
    : 'Dikembalikan';

  const returnedRecord: ReturnHistoryItem = {
    id: targetLoan.id,
    memberId: targetLoan.memberId,
    memberName: targetLoan.memberName,
    bookId: targetLoan.bookId,
    bookTitle: targetLoan.bookTitle,
    bookShelf: targetLoan.bookShelf,
    returnTimestampLabel: returnTimeLabel.replace(' WIB', '').replace('November', 'Nov'),
    complianceStatus,
    stockEffectLabel: 'Stok Pulih: +1',
    finePaid: fineAmount,
    receiptId,
    overdueDays: targetLoan.overdueDays,
    wasOutOfStockBefore: prevAvailable === 0,
    previousAvailableStock: prevAvailable,
    newAvailableStock: newAvailable,
  };

  let createdFine: FineRecord | undefined;
  let updatedFines = fines;
  if (isOverdue && receiptId) {
    createdFine = {
      receiptId,
      transactionId: targetLoan.id,
      memberId: targetLoan.memberId,
      memberName: targetLoan.memberName,
      bookId: targetLoan.bookId,
      bookTitle: targetLoan.bookTitle,
      overdueDays: targetLoan.overdueDays,
      fineAmount,
      status: 'Lunas Tunai',
      paidAtLabel: returnTimeLabel,
    };
    updatedFines = [createdFine, ...fines];
  }

  return {
    success: true,
    books: updatedBooks,
    loans: updatedLoans,
    returns: [returnedRecord, ...returns],
    fines: updatedFines,
    returnedRecord,
    createdFine,
  };
}

export function filterAndSortBooks(
  books: Book[],
  query: string,
  statusFilter: BookStatusFilter,
  categoryFilter: string,
  sortBy: BookSortOption
): Book[] {
  const q = query.trim().toLowerCase();

  const filtered = books.filter((book) => {
    const matchesQuery =
      !q ||
      book.id.toLowerCase().includes(q) ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.shelf.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' && book.availableStock > 0) ||
      (statusFilter === 'out' && book.availableStock === 0);

    const matchesCategory =
      categoryFilter === 'all' ||
      book.category === categoryFilter ||
      book.shelf === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'id-asc':
        return a.id.localeCompare(b.id);
      case 'stock-desc':
        return b.availableStock - a.availableStock || a.id.localeCompare(b.id);
      case 'stock-asc':
        return a.availableStock - b.availableStock || a.id.localeCompare(b.id);
      case 'title-asc':
      default:
        return a.id.localeCompare(b.id);
    }
  });

  return sorted;
}

export function computeCashBreakdown(totalAmount: number): {
  denominations: CashDenomination[];
  totalNotes: number;
} {
  let remaining = Math.max(0, Math.round(totalAmount));
  const specs = [
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 10.000', value: 10000 },
    { label: 'Rp 5.000', value: 5000 },
    { label: 'Rp 1.000', value: 1000 },
  ];

  const denominations: CashDenomination[] = specs.map((spec) => {
    const count = Math.floor(remaining / spec.value);
    remaining -= count * spec.value;
    return {
      label: spec.label,
      value: spec.value,
      count,
      subtotal: count * spec.value,
    };
  });

  const totalNotes = denominations.reduce((acc, d) => acc + d.count, 0);
  return { denominations, totalNotes };
}
