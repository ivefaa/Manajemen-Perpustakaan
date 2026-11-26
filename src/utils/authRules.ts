import type {
  PasswordEvaluation,
  StaffAccount,
  StaffRole,
} from '../types/library';

const COMMON_WEAK_WORDS = [
  'rahasia',
  'password',
  'pustaka',
  '123456',
  'admin',
  'qwerty',
];

export function lookupAccountByIdentifier(
  accounts: StaffAccount[],
  identifier: string
): StaffAccount | null {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return null;

  return (
    accounts.find(
      (acc) =>
        acc.id.toLowerCase() === normalized ||
        acc.email.toLowerCase() === normalized
    ) ?? null
  );
}

export function isValidIdentifierFormat(identifier: string): boolean {
  const trimmed = identifier.trim();
  if (!trimmed) return false;
  const nipPattern = /^(PST|ADM|SPV)-\d{4}-\d{3}$/i;
  const emailPattern = /^[^\s@]+@pustakamodern\.(id|ac\.id)$/i;
  return nipPattern.test(trimmed) || emailPattern.test(trimmed);
}

export function authenticateStaff(params: {
  accounts: StaffAccount[];
  identifier: string;
  password: string;
  selectedRole: StaffRole;
}): {
  success: boolean;
  account?: StaffAccount;
  error?: string;
} {
  const { accounts, identifier, password, selectedRole } = params;
  const trimmedId = identifier.trim();

  if (!trimmedId) {
    return {
      success: false,
      error: 'Masukkan NIP Petugas Sirkulasi atau email kedinasan terlebih dahulu.',
    };
  }
  if (!password) {
    return {
      success: false,
      error: 'Kata sandi atau kunci akses tidak boleh kosong.',
    };
  }

  const account = lookupAccountByIdentifier(accounts, trimmedId);
  if (!account) {
    return {
      success: false,
      error:
        'ID Petugas atau email kedinasan tidak ditemukan dalam direktori aktif.',
    };
  }

  if (account.password !== password) {
    return {
      success: false,
      error:
        'Kata sandi tidak valid. Periksa kembali penulisan huruf besar/kecil atau gunakan fitur Lupa Sandi.',
    };
  }

  // Allow sysadmin into supervisor/pustakawan if testing or match selected workspace cleanly
  if (selectedRole === 'sysadmin' && account.role !== 'sysadmin') {
    return {
      success: false,
      error: `Akun ${account.fullName} (${account.id}) tidak memiliki otoritas Administrator Sistem.`,
    };
  }

  return {
    success: true,
    account,
  };
}

export function evaluatePasswordPolicy(
  password: string,
  confirmPassword: string,
  passwordHistory: string[] = []
): PasswordEvaluation {
  const minLength = password.length >= 8;
  const recommendedLength = password.length >= 12;
  const upperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(
    password
  );
  const notInHistory =
    password.length > 0 &&
    !passwordHistory.slice(0, 3).some((old) => old === password);

  const checks = {
    minLength,
    recommendedLength,
    upperAndLower,
    hasDigit,
    hasSpecialChar,
    notInHistory,
  };

  let charsetPool = 0;
  if (/[a-z]/.test(password)) charsetPool += 26;
  if (/[A-Z]/.test(password)) charsetPool += 26;
  if (/\d/.test(password)) charsetPool += 10;
  if (hasSpecialChar) charsetPool += 32;

  let rawEntropy =
    password.length > 0 && charsetPool > 0
      ? password.length * Math.log2(charsetPool)
      : 0;

  const lowered = password.toLowerCase();
  if (
    password.length > 0 &&
    COMMON_WEAK_WORDS.some((w) => lowered === w || (lowered.includes(w) && !upperAndLower && !hasSpecialChar))
  ) {
    rawEntropy = Math.min(rawEntropy, 18.4);
  }

  const entropyBits = Number(rawEntropy.toFixed(1));
  const entropyPercent = Math.min(
    100,
    Math.max(0, Math.round((entropyBits / 74) * 100))
  );

  const coreFlags = [
    minLength,
    upperAndLower,
    hasDigit,
    hasSpecialChar,
    notInHistory,
  ];
  const passedCoreCount = coreFlags.filter(Boolean).length;

  let scoreOutOf4 = 0;
  if (password.length > 0) {
    scoreOutOf4 = 1;
    if (entropyBits >= 25 && minLength && (upperAndLower || hasDigit)) {
      scoreOutOf4 = 2;
    }
    if (
      entropyBits >= 35 &&
      minLength &&
      upperAndLower &&
      (hasDigit || hasSpecialChar)
    ) {
      scoreOutOf4 = 3;
    }
    if (
      minLength &&
      upperAndLower &&
      hasDigit &&
      hasSpecialChar &&
      notInHistory &&
      entropyBits >= 45
    ) {
      scoreOutOf4 = 4;
    }
  }

  const strengthLabel: PasswordEvaluation['strengthLabel'] =
    scoreOutOf4 <= 1
      ? 'Sangat Lemah'
      : scoreOutOf4 === 2
        ? 'Cukup'
        : scoreOutOf4 === 3
          ? 'Kuat'
          : 'Sangat Kuat';

  const isValidPolicy =
    minLength &&
    upperAndLower &&
    hasDigit &&
    hasSpecialChar &&
    notInHistory &&
    entropyBits >= 45;

  const isConfirmMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return {
    checks,
    passedCoreCount,
    scoreOutOf4,
    entropyBits,
    entropyPercent,
    strengthLabel,
    isValidPolicy,
    isConfirmMatch,
    canSubmit: isValidPolicy && isConfirmMatch,
  };
}

export function clampCropPan(value: number, zoom: number): number {
  const maxOffset = Math.max(40, Math.round(110 * (zoom / 100)));
  return Math.max(-maxOffset, Math.min(maxOffset, Math.round(value)));
}

export function normalizeRotation(deg: number): number {
  const normalized = ((deg % 360) + 360) % 360;
  return normalized;
}
