export type TransactionType = 'setoran' | 'penarikan';

export type UserRole = 'admin' | 'nasabah';

export interface NasabahUser {
  id: string;
  accountNumber: string; // e.g. NSB-101
  name: string;
  kelas: string; // e.g. Kelas 4A, Kelas 3B
  username: string;
  password: string;
  parentPhone?: string;
  notes?: string;
  createdAt: number;
  isActive: boolean;
}

export interface AuthSession {
  role: UserRole;
  username: string;
  name: string;
  nasabahId?: string;
  nasabah?: NasabahUser;
}

export type SavingsCategory = 
  | 'uang_jajan'
  | 'sisa_belanja'
  | 'gaji'
  | 'bonus_thr'
  | 'penjualan'
  | 'celengan'
  | 'dana_darurat'
  | 'lainnya';

export interface SavingsTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: SavingsCategory;
  targetGoalId?: string; // ID of the specific target goal (optional)
  nasabahId?: string; // ID of the nasabah
  nasabahName?: string; // Name of nasabah
  teller?: string; // Inputted by
  notes?: string;
  createdAt: number;
}

export interface TargetGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDate: string; // YYYY-MM-DD
  category: string;
  color: string;
  icon: string;
  createdAt: number;
  isCompleted?: boolean;
}

export interface DailyRecap {
  date: string; // YYYY-MM-DD
  totalSetoran: number;
  totalPenarikan: number;
  netSavings: number;
  transactionCount: number;
}

export interface WeeklyRecap {
  weekLabel: string;
  startDate: string;
  endDate: string;
  totalSetoran: number;
  totalPenarikan: number;
  netSavings: number;
  dailyBreakdown: {
    dayName: string;
    date: string;
    amount: number;
  }[];
}

export interface MonthlyRecap {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  totalSetoran: number;
  totalPenarikan: number;
  netSavings: number;
  transactionCount: number;
  categoryBreakdown: {
    category: SavingsCategory;
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

export interface UserPreferences {
  dailyTargetAmount: number;
  userName: string;
  enableVibration: boolean;
  reminderHour: number; // e.g. 20 (8 PM)
  reminderMinute: number;
  reminderEnabled: boolean;
}
