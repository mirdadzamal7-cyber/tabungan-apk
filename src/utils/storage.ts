import { SavingsTransaction, TargetGoal, UserPreferences, DailyRecap, WeeklyRecap, MonthlyRecap, SavingsCategory, NasabahUser, AuthSession } from '../types';
import { CATEGORY_META } from './formatters';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Tahubulat12',
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'tabungku_transactions_v2',
  GOALS: 'tabungku_goals_v2',
  PREFERENCES: 'tabungku_prefs_v2',
  NASABAH_USERS: 'tabungan_berkah_nasabah_v1',
  AUTH_SESSION: 'tabungan_berkah_session_v1',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  dailyTargetAmount: 20000,
  userName: 'Sobat Berkah',
  enableVibration: true,
  reminderHour: 20,
  reminderMinute: 0,
  reminderEnabled: true,
};

// Initial sample nasabah students of SDN Margawangi
const INITIAL_NASABAH: NasabahUser[] = [
  {
    id: 'nsb-1',
    accountNumber: 'NSB-001',
    name: 'Ahmad Rizki Pratama',
    kelas: 'Kelas 4A',
    username: 'ahmad',
    password: '123456',
    parentPhone: '081234567890',
    notes: 'Siswa aktif rajin menabung',
    createdAt: Date.now() - 30 * 86400000,
    isActive: true,
  },
  {
    id: 'nsb-2',
    accountNumber: 'NSB-002',
    name: 'Siti Nurhaliza',
    kelas: 'Kelas 3B',
    username: 'siti',
    password: '123456',
    parentPhone: '082198765432',
    notes: 'Target untuk beli tas & sepatu baru',
    createdAt: Date.now() - 25 * 86400000,
    isActive: true,
  },
  {
    id: 'nsb-3',
    accountNumber: 'NSB-003',
    name: 'Budi Santoso',
    kelas: 'Kelas 5A',
    username: 'budi',
    password: '123456',
    parentPhone: '085711223344',
    notes: 'Tabungan karyawisata akhir tahun',
    createdAt: Date.now() - 20 * 86400000,
    isActive: true,
  },
  {
    id: 'nsb-4',
    accountNumber: 'NSB-004',
    name: 'Dewi Lestari',
    kelas: 'Kelas 2C',
    username: 'dewi',
    password: '123456',
    parentPhone: '087855667788',
    notes: 'Penyisihan uang jajan harian',
    createdAt: Date.now() - 15 * 86400000,
    isActive: true,
  },
];

// Generates realistic recent Indonesian savings history
const getInitialSampleData = (): { transactions: SavingsTransaction[]; goals: TargetGoal[] } => {
  const today = new Date();
  
  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const goals: TargetGoal[] = [
    {
      id: 'goal-1',
      name: 'HP Baru (Android 14)',
      targetAmount: 3500000,
      currentAmount: 2150000,
      deadlineDate: '2026-12-31',
      category: 'Gadget',
      color: '#0d9488',
      icon: 'Smartphone',
      createdAt: Date.now() - 30 * 86400000,
      isCompleted: false,
    },
    {
      id: 'goal-2',
      name: 'Dana Darurat 3 Bulan',
      targetAmount: 5000000,
      currentAmount: 3400000,
      deadlineDate: '2027-06-30',
      category: 'Keuangan',
      color: '#4f46e5',
      icon: 'Shield',
      createdAt: Date.now() - 60 * 86400000,
      isCompleted: false,
    },
    {
      id: 'goal-3',
      name: 'Liburan Akhir Tahun',
      targetAmount: 1800000,
      currentAmount: 1200000,
      deadlineDate: '2026-11-20',
      category: 'Wisata',
      color: '#d97706',
      icon: 'Palmtree',
      createdAt: Date.now() - 15 * 86400000,
      isCompleted: false,
    },
  ];

  // Populate sample transactions for the last 14 days + some earlier this month
  const transactions: SavingsTransaction[] = [];
  
  const samples = [
    { daysAgo: 0, amount: 20000, cat: 'uang_jajan', notes: 'Setoran harian uang jajan', goal: 'goal-1', nsbIndex: 0 },
    { daysAgo: 0, amount: 15000, cat: 'sisa_belanja', notes: 'Setoran sisa jajan pagi', goal: 'goal-2', nsbIndex: 1 },
    { daysAgo: 1, amount: 10000, cat: 'celengan', notes: 'Nabung koin & recehan', goal: 'goal-1', nsbIndex: 0 },
    { daysAgo: 2, amount: 25000, cat: 'uang_jajan', notes: 'Setoran tabungan berkah', goal: 'goal-3', nsbIndex: 2 },
    { daysAgo: 3, amount: 50000, cat: 'bonus_thr', notes: 'Hadiah ranking kelas', goal: 'goal-1', nsbIndex: 0 },
    { daysAgo: 4, amount: 15000, cat: 'uang_jajan', notes: 'Setoran rutin istirahat', goal: 'goal-2', nsbIndex: 1 },
    { daysAgo: 5, amount: 20000, cat: 'sisa_belanja', notes: 'Sisa uang saku sekolah', goal: 'goal-3', nsbIndex: 3 },
    { daysAgo: 6, amount: 30000, cat: 'celengan', notes: 'Pecah celengan berkah', goal: 'goal-1', nsbIndex: 0 },
    { daysAgo: 7, amount: 50000, cat: 'bonus_thr', notes: 'Titipan orang tua siswa', goal: 'goal-2', nsbIndex: 1 },
    { daysAgo: 8, amount: 20000, cat: 'uang_jajan', notes: 'Hemat jajan kantin', goal: 'goal-1', nsbIndex: 0 },
    { daysAgo: 9, amount: 15000, cat: 'uang_jajan', notes: 'Nabung disiplin harian', goal: 'goal-3', nsbIndex: 2 },
    { daysAgo: 10, amount: 50000, cat: 'gaji', notes: 'Uang saku bulanan dari kakek', goal: 'goal-2', nsbIndex: 1 },
    { daysAgo: 12, amount: 25000, cat: 'sisa_belanja', notes: 'Sisa ongkos angkot', goal: 'goal-1', nsbIndex: 3 },
    { daysAgo: 15, amount: 100000, cat: 'gaji', notes: 'Setoran awal bulan sekolah', goal: 'goal-2', nsbIndex: 0 },
    { daysAgo: 18, amount: 35000, cat: 'penjualan', notes: 'Hasil prakarya sekolah', goal: 'goal-3', nsbIndex: 2 },
  ];

  samples.forEach((item, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.daysAgo);
    const assignedNsb = INITIAL_NASABAH[item.nsbIndex % INITIAL_NASABAH.length];
    transactions.push({
      id: `tx-sample-${index}`,
      type: 'setoran',
      amount: item.amount,
      date: formatDate(d),
      time: index % 2 === 0 ? '07:45' : '12:15',
      categoryId: item.cat as SavingsCategory,
      targetGoalId: item.goal,
      nasabahId: assignedNsb.id,
      nasabahName: assignedNsb.name,
      teller: 'Admin SDN Margawangi',
      notes: item.notes,
      createdAt: d.getTime(),
    });
  });

  return { transactions, goals };
};

export const loadStoredNasabahUsers = (): NasabahUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NASABAH_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading nasabah users from localStorage', e);
  }
  saveStoredNasabahUsers(INITIAL_NASABAH);
  return INITIAL_NASABAH;
};

export const saveStoredNasabahUsers = (users: NasabahUser[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NASABAH_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving nasabah users to localStorage', e);
  }
};

export const loadStoredSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading auth session', e);
  }
  return null;
};

export const saveStoredSession = (session: AuthSession | null) => {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  } catch (e) {
    console.error('Failed saving auth session', e);
  }
};

export const verifyLogin = (
  usernameInput: string,
  passwordInput: string,
  users: NasabahUser[]
): { success: boolean; session?: AuthSession; message?: string } => {
  const u = usernameInput.trim();
  const p = passwordInput;

  // 1. Check Admin Credentials (locked: admin / Tahubulat12)
  if (u.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase()) {
    if (p === ADMIN_CREDENTIALS.password) {
      return {
        success: true,
        session: {
          role: 'admin',
          username: 'admin',
          name: 'Administrator (SDN Margawangi)',
        },
      };
    } else {
      return {
        success: false,
        message: 'Password admin salah. Silakan coba lagi.',
      };
    }
  }

  // 2. Check Nasabah User Credentials
  const foundNasabah = users.find(
    (n) => n.username.toLowerCase() === u.toLowerCase()
  );

  if (foundNasabah) {
    if (foundNasabah.password === p) {
      if (!foundNasabah.isActive) {
        return {
          success: false,
          message: 'Akun nasabah ini dinonaktifkan oleh admin.',
        };
      }
      return {
        success: true,
        session: {
          role: 'nasabah',
          username: foundNasabah.username,
          name: foundNasabah.name,
          nasabahId: foundNasabah.id,
          nasabah: foundNasabah,
        },
      };
    } else {
      return {
        success: false,
        message: 'Password nasabah tidak cocok. Silakan hubungi admin sekolah.',
      };
    }
  }

  return {
    success: false,
    message: 'Username tidak ditemukan. Hubungi admin untuk pembuatan akun nasabah.',
  };
};

export const loadStoredTransactions = (): SavingsTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading transactions from localStorage', e);
  }
  const initial = getInitialSampleData();
  saveStoredTransactions(initial.transactions);
  saveStoredGoals(initial.goals);
  return initial.transactions;
};

export const saveStoredTransactions = (transactions: SavingsTransaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed saving transactions to localStorage', e);
  }
};

export const loadStoredGoals = (): TargetGoal[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed reading goals from localStorage', e);
  }
  const initial = getInitialSampleData();
  saveStoredGoals(initial.goals);
  return initial.goals;
};

export const saveStoredGoals = (goals: TargetGoal[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed saving goals to localStorage', e);
  }
};

export const loadStoredPreferences = (): UserPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed reading preferences from localStorage', e);
  }
  return DEFAULT_PREFERENCES;
};

export const saveStoredPreferences = (prefs: UserPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed saving preferences to localStorage', e);
  }
};

export const resetToSampleData = (): { transactions: SavingsTransaction[]; goals: TargetGoal[] } => {
  const initial = getInitialSampleData();
  saveStoredTransactions(initial.transactions);
  saveStoredGoals(initial.goals);
  return initial;
};

// Calculations for Recaps
export const calculateDailyRecap = (transactions: SavingsTransaction[], dateStr: string): DailyRecap => {
  const filtered = transactions.filter(t => t.date === dateStr);
  let totalSetoran = 0;
  let totalPenarikan = 0;

  filtered.forEach(t => {
    if (t.type === 'setoran') {
      totalSetoran += t.amount;
    } else {
      totalPenarikan += t.amount;
    }
  });

  return {
    date: dateStr,
    totalSetoran,
    totalPenarikan,
    netSavings: totalSetoran - totalPenarikan,
    transactionCount: filtered.length,
  };
};

export const calculateWeeklyRecap = (transactions: SavingsTransaction[], referenceDate: Date = new Date()): WeeklyRecap => {
  // Find Monday of the current week
  const curr = new Date(referenceDate);
  const day = curr.getDay();
  // day 0 is Sunday, in ID Monday is first day of week
  const diffToMonday = curr.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(curr.setDate(diffToMonday));
  
  const dailyBreakdown: { dayName: string; date: string; amount: number }[] = [];
  const dayLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  let totalSetoran = 0;
  let totalPenarikan = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayTxs = transactions.filter(t => t.date === dateStr);
    let dayTotal = 0;
    dayTxs.forEach(t => {
      if (t.type === 'setoran') {
        totalSetoran += t.amount;
        dayTotal += t.amount;
      } else {
        totalPenarikan += t.amount;
        dayTotal -= t.amount;
      }
    });

    dailyBreakdown.push({
      dayName: dayLabels[i],
      date: dateStr,
      amount: dayTotal,
    });
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekLabel: `Minggu, ${monday.getDate()} - ${sunday.getDate()} ${sunday.toLocaleString('id-ID', { month: 'short' })}`,
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
    totalSetoran,
    totalPenarikan,
    netSavings: totalSetoran - totalPenarikan,
    dailyBreakdown,
  };
};

export const calculateMonthlyRecap = (transactions: SavingsTransaction[], year: number, month: number): MonthlyRecap => {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const filtered = transactions.filter(t => t.date.startsWith(monthKey));

  let totalSetoran = 0;
  let totalPenarikan = 0;
  const categoryTotals: Record<string, number> = {};

  filtered.forEach(t => {
    if (t.type === 'setoran') {
      totalSetoran += t.amount;
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
    } else {
      totalPenarikan += t.amount;
    }
  });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([cat, amount]) => {
      const meta = CATEGORY_META[cat as SavingsCategory] || CATEGORY_META.lainnya;
      return {
        category: cat as SavingsCategory,
        name: meta.name,
        amount,
        percentage: totalSetoran > 0 ? Math.round((amount / totalSetoran) * 100) : 0,
        color: meta.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return {
    monthKey,
    monthLabel: `${monthNames[month - 1]} ${year}`,
    totalSetoran,
    totalPenarikan,
    netSavings: totalSetoran - totalPenarikan,
    transactionCount: filtered.length,
    categoryBreakdown,
  };
};

export const calculateSavingsStreak = (transactions: SavingsTransaction[]): { currentStreak: number; bestStreak: number } => {
  if (transactions.length === 0) return { currentStreak: 0, bestStreak: 0 };
  
  const setoranDates = new Set(
    transactions.filter(t => t.type === 'setoran').map(t => t.date)
  );

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = new Date(today);

  // If didn't save today yet, start checking from yesterday to not break ongoing streak
  if (!setoranDates.has(todayStr) && setoranDates.has(yesterdayStr)) {
    checkDate = yesterday;
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (setoranDates.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Best streak calculation
  const sortedDates = Array.from(setoranDates).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const d = new Date(dStr);
    if (prevDate) {
      const diffTime = d.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = d;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
};
