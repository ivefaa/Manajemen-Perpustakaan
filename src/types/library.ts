export type NavTab =
  | 'katalog'
  | 'peminjaman'
  | 'pengembalian'
  | 'tambah'
  | 'laporan'
  | 'berita-acara'
  | 'pengaturan'
  | 'profil';

export type StaffRole = 'pustakawan' | 'supervisor' | 'sysadmin';

export type AuthScreenMode =
  | 'login'
  | 'recovery-step1'
  | 'recovery-step2'
  | 'relogin-success'
  | 'authenticated';

export interface PhotoCropState {
  imageDataUrl: string;
  panX: number;
  panY: number;
  zoom: number;
  rotation: number;
  fileName: string;
  dimensionsLabel: string;
  fileSizeLabel: string;
}

export interface StaffAccount {
  id: string; // NIP e.g. 'PST-2026-088'
  initials: string;
  fullName: string;
  academicTitle: string;
  role: StaffRole;
  roleLabel: string;
  stationLabel: string;
  accessScopeLabel: string;
  shiftLabel: string;
  email: string;
  phone: string;
  maskedPhone: string;
  unitLocation: string;
  shiftNotes: string;
  password: string;
  passwordHistory: string[];
  pin: string;
  avatarUrl: string;
  cropState: PhotoCropState;
  lastPasswordUpdatedLabel: string;
}

export interface PasswordRuleChecks {
  minLength: boolean;
  recommendedLength: boolean;
  upperAndLower: boolean;
  hasDigit: boolean;
  hasSpecialChar: boolean;
  notInHistory: boolean;
}

export interface PasswordEvaluation {
  checks: PasswordRuleChecks;
  passedCoreCount: number;
  scoreOutOf4: number;
  entropyBits: number;
  entropyPercent: number;
  strengthLabel: 'Sangat Lemah' | 'Lemah' | 'Cukup' | 'Kuat' | 'Sangat Kuat';
  isValidPolicy: boolean;
  isConfirmMatch: boolean;
  canSubmit: boolean;
}

export type BookStatusFilter = 'all' | 'available' | 'out';
export type BookSortOption = 'title-asc' | 'id-asc' | 'stock-desc' | 'stock-asc';

export interface Book {
  id: string; // e.g., 'BK-001'
  title: string;
  author: string;
  category: string;
  shelf: string;
  shelfDetail: string;
  year: number;
  language: string;
  totalStock: number;
  availableStock: number;
  synopsis: string;
  earliestReturnDate?: string;
  coverTone: 'teal' | 'navy' | 'amber' | 'rose' | 'indigo' | 'emerald' | 'slate' | 'sky';
  lastActivityNote?: string;
}

export interface LoanTransaction {
  id: string; // e.g., 'TRX-20261126-089'
  bookId: string;
  bookTitle: string;
  bookShelf: string;
  memberId: string; // e.g., 'AG-2041'
  memberName: string; // e.g., 'Ahmad Fauzi'
  borrowDate: string; // ISO date YYYY-MM-DD
  borrowDateLabel: string; // e.g., '25 Nov 2026'
  dueDate: string; // ISO date YYYY-MM-DD
  dueDateLabel: string; // e.g., '03 Des 2026'
  timeAgoLabel: string; // e.g., '5 mnt lalu'
  isDueToday?: boolean;
  overdueDays: number; // 0 if not overdue
  status: 'Dipinjam' | 'Dikembalikan';
}

export interface ReturnHistoryItem {
  id: string; // Transaction ID
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  bookShelf: string;
  returnTimestampLabel: string; // e.g., '26 Nov 2026, 09:15'
  complianceStatus: 'Dikembalikan' | 'Tepat Waktu' | 'Terlambat (Lunas)';
  stockEffectLabel: string; // e.g., 'Stok Pulih: +1'
  finePaid: number;
  receiptId?: string;
  overdueDays: number;
  wasOutOfStockBefore?: boolean;
  previousAvailableStock?: number;
  newAvailableStock?: number;
}

export interface FineRecord {
  receiptId: string; // e.g., 'KWT-20261126-077'
  transactionId: string;
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  overdueDays: number;
  fineAmount: number;
  status: 'Lunas Tunai' | 'Tertunda';
  paidAtLabel: string;
}

export interface BookRegistrationInput {
  id: string;
  title: string;
  author: string;
  category?: string;
  shelf?: string;
  initialStock: number | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    id?: string;
    title?: string;
    author?: string;
    initialStock?: string;
  };
}

export interface CashDenomination {
  label: string;
  value: number;
  count: number;
  subtotal: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  unread: boolean;
}
