import React, { useState, useEffect } from 'react';
import {
  SavingsTransaction,
  TargetGoal,
  UserPreferences,
  NasabahUser,
  AuthSession,
} from './types';
import {
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredGoals,
  saveStoredGoals,
  loadStoredPreferences,
  saveStoredPreferences,
  loadStoredNasabahUsers,
  saveStoredNasabahUsers,
  loadStoredSession,
  saveStoredSession,
  resetToSampleData,
  calculateDailyRecap,
  calculateWeeklyRecap,
  calculateMonthlyRecap,
} from './utils/storage';
import { formatRupiah, triggerAndroidHaptic } from './utils/formatters';
import { AndroidFrame } from './components/AndroidFrame';
import { Navbar, NavTab } from './components/Navbar';
import { ModalTransaksi } from './components/ModalTransaksi';
import { RekapHarian } from './components/RekapHarian';
import { RekapMingguan } from './components/RekapMingguan';
import { RekapBulanan } from './components/RekapBulanan';
import { TargetKantong } from './components/TargetKantong';
import { RiwayatTransaksi } from './components/RiwayatTransaksi';
import { KalkulatorSimulasi } from './components/KalkulatorSimulasi';
import { EksporBackup } from './components/EksporBackup';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { PengingatModal } from './components/PengingatModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminKelolaNasabah } from './components/AdminKelolaNasabah';
import { AndroidQrModal } from './components/AndroidQrModal';
import {
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  saveGoalToFirestore,
  deleteGoalFromFirestore,
  saveNasabahToFirestore,
  deleteNasabahFromFirestore,
  subscribeToTransactions,
  subscribeToGoals,
  subscribeToNasabah,
  seedInitialFirestoreDataIfEmpty,
} from './firebase';
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Plus,
  ShieldCheck,
  GraduationCap,
  Users,
  LogOut,
  Trash2,
} from 'lucide-react';

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [nasabahUsers, setNasabahUsers] = useState<NasabahUser[]>(() => loadStoredNasabahUsers());
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [goals, setGoals] = useState<TargetGoal[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadStoredPreferences());
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const [rekapSubTab, setRekapSubTab] = useState<'harian' | 'mingguan' | 'bulanan'>('harian');
  const [alatSubTab, setAlatSubTab] = useState<'kalkulator' | 'ekspor'>('kalkulator');

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [prefilledGoalId, setPrefilledGoalId] = useState<string | undefined>(undefined);
  const [prefilledNasabahId, setPrefilledNasabahId] = useState<string | undefined>(undefined);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSimulatedDevice, setIsSimulatedDevice] = useState(true);

  // In-app confirmation modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [txToDelete, setTxToDelete] = useState<SavingsTransaction | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<TargetGoal | null>(null);

  // Initialize data from storage and sync with Firestore on mount
  useEffect(() => {
    const loadedTx = loadStoredTransactions();
    const loadedGoals = loadStoredGoals();
    const loadedNasabah = loadStoredNasabahUsers();
    setTransactions(loadedTx);
    setGoals(loadedGoals);
    setNasabahUsers(loadedNasabah);

    // Initial check & seed Firestore if database is clean
    seedInitialFirestoreDataIfEmpty(loadedTx, loadedGoals, loadedNasabah).catch((e) => {
      console.warn('Initial Firestore seed check:', e);
    });

    // Real-time synchronization listeners
    const unsubTx = subscribeToTransactions((firestoreTx) => {
      if (firestoreTx && firestoreTx.length > 0) {
        setTransactions(firestoreTx);
        saveStoredTransactions(firestoreTx);
      }
    });

    const unsubGoals = subscribeToGoals((firestoreGoals) => {
      if (firestoreGoals && firestoreGoals.length > 0) {
        setGoals(firestoreGoals);
        saveStoredGoals(firestoreGoals);
      }
    });

    const unsubNasabah = subscribeToNasabah((firestoreNasabah) => {
      if (firestoreNasabah && firestoreNasabah.length > 0) {
        setNasabahUsers(firestoreNasabah);
        saveStoredNasabahUsers(firestoreNasabah);
      }
    });

    return () => {
      unsubTx?.();
      unsubGoals?.();
      unsubNasabah?.();
    };
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    saveStoredSession(session);
    setActiveTab('beranda');
  };

  const handleOpenLogoutModal = () => {
    triggerAndroidHaptic(preferences.enableVibration, 10);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    triggerAndroidHaptic(preferences.enableVibration, 20);
    setShowLogoutModal(false);
    setAuthSession(null);
    saveStoredSession(null);
  };

  // If not logged in, render the login screen
  if (!authSession) {
    return (
      <LoginScreen
        nasabahUsers={nasabahUsers}
        onLoginSuccess={handleLoginSuccess}
        enableVibration={preferences.enableVibration}
      />
    );
  }

  const isAdmin = authSession.role === 'admin';
  const currentNasabah = authSession.nasabah;

  // Filter transactions based on role:
  // Admin sees all transactions from all students;
  // Nasabah sees their own transactions only
  const visibleTransactions = isAdmin
    ? transactions
    : transactions.filter((t) => t.nasabahId === authSession.nasabahId);

  // Compute grand total savings
  const totalSavings = visibleTransactions.reduce((acc, curr) => {
    return curr.type === 'setoran' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecap = calculateDailyRecap(visibleTransactions, todayStr);
  const thisWeekRecap = calculateWeeklyRecap(visibleTransactions);
  const now = new Date();
  const thisMonthRecap = calculateMonthlyRecap(visibleTransactions, now.getFullYear(), now.getMonth() + 1);

  // Add new transaction (setoran or penarikan)
  const handleSaveTransaction = (newTxData: Omit<SavingsTransaction, 'id' | 'createdAt'>) => {
    // If student is logged in, ensure nasabahId and nasabahName are set
    const effectiveNasabahId = isAdmin
      ? newTxData.nasabahId || (nasabahUsers[0]?.id || 'nsb-1')
      : authSession.nasabahId;

    const assignedNasabah = nasabahUsers.find((n) => n.id === effectiveNasabahId);

    const newTx: SavingsTransaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nasabahId: effectiveNasabahId,
      nasabahName: assignedNasabah?.name || authSession.name,
      teller: isAdmin ? 'Admin SDN Margawangi' : undefined,
      createdAt: Date.now(),
    };

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);
    saveStoredTransactions(updatedTxList);
    saveTransactionToFirestore(newTx).catch((e) => console.warn('Sync tx to Firestore:', e));

    // If assigned to a target goal, update the goal's current amount
    if (newTx.targetGoalId) {
      const updatedGoals = goals.map((g) => {
        if (g.id === newTx.targetGoalId) {
          const delta = newTx.type === 'setoran' ? newTx.amount : -newTx.amount;
          const updatedAmount = Math.max(0, g.currentAmount + delta);
          const updatedGoal = {
            ...g,
            currentAmount: updatedAmount,
            isCompleted: updatedAmount >= g.targetAmount,
          };
          saveGoalToFirestore(updatedGoal).catch((e) => console.warn('Sync goal to Firestore:', e));
          return updatedGoal;
        }
        return g;
      });
      setGoals(updatedGoals);
      saveStoredGoals(updatedGoals);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const targetTx = transactions.find((t) => t.id === id);
    if (!targetTx) return;
    triggerAndroidHaptic(preferences.enableVibration, 10);
    setTxToDelete(targetTx);
  };

  const handleConfirmDeleteTransaction = () => {
    if (!txToDelete) return;
    const id = txToDelete.id;
    triggerAndroidHaptic(preferences.enableVibration, 15);
    const updatedList = transactions.filter((t) => t.id !== id);
    setTransactions(updatedList);
    saveStoredTransactions(updatedList);
    deleteTransactionFromFirestore(id).catch((e) => console.warn('Delete tx from Firestore:', e));

    // Reverse goal contribution if any
    if (txToDelete.targetGoalId) {
      const updatedGoals = goals.map((g) => {
        if (g.id === txToDelete.targetGoalId) {
          const reverseDelta = txToDelete.type === 'setoran' ? -txToDelete.amount : txToDelete.amount;
          const updatedAmount = Math.max(0, g.currentAmount + reverseDelta);
          const updatedGoal = {
            ...g,
            currentAmount: updatedAmount,
            isCompleted: updatedAmount >= g.targetAmount,
          };
          saveGoalToFirestore(updatedGoal).catch((e) => console.warn('Sync goal to Firestore:', e));
          return updatedGoal;
        }
        return g;
      });
      setGoals(updatedGoals);
      saveStoredGoals(updatedGoals);
    }
    setTxToDelete(null);
  };

  // Admin: Add Nasabah User (Pembuatan User Nasabah Baru)
  const handleAddNasabah = (
    newNasabahData: Omit<NasabahUser, 'id' | 'createdAt'>,
    initialDeposit?: number
  ) => {
    const newNasabah: NasabahUser = {
      ...newNasabahData,
      id: `nsb-${Date.now()}`,
      createdAt: Date.now(),
    };

    const updatedUsers = [...nasabahUsers, newNasabah];
    setNasabahUsers(updatedUsers);
    saveStoredNasabahUsers(updatedUsers);
    saveNasabahToFirestore(newNasabah).catch((e) => console.warn('Sync nasabah to Firestore:', e));

    // If there's an initial deposit, record it automatically
    if (initialDeposit && initialDeposit > 0) {
      const depositTx: SavingsTransaction = {
        id: `tx-init-${Date.now()}`,
        type: 'setoran',
        amount: initialDeposit,
        date: todayStr,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        categoryId: 'gaji',
        nasabahId: newNasabah.id,
        nasabahName: newNasabah.name,
        teller: 'Admin SDN Margawangi',
        notes: 'Setoran perdana pembukaan buku tabungan',
        createdAt: Date.now(),
      };
      const updatedTx = [depositTx, ...transactions];
      setTransactions(updatedTx);
      saveStoredTransactions(updatedTx);
      saveTransactionToFirestore(depositTx).catch((e) => console.warn('Sync init tx to Firestore:', e));
    }
  };

  // Admin: Update Nasabah User
  const handleUpdateNasabah = (updated: NasabahUser) => {
    const updatedUsers = nasabahUsers.map((n) => (n.id === updated.id ? updated : n));
    setNasabahUsers(updatedUsers);
    saveStoredNasabahUsers(updatedUsers);
    saveNasabahToFirestore(updated).catch((e) => console.warn('Sync nasabah to Firestore:', e));
  };

  // Admin: Delete Nasabah User
  const handleDeleteNasabah = (id: string) => {
    const updatedUsers = nasabahUsers.filter((n) => n.id !== id);
    setNasabahUsers(updatedUsers);
    saveStoredNasabahUsers(updatedUsers);
    deleteNasabahFromFirestore(id).catch((e) => console.warn('Delete nasabah from Firestore:', e));
  };

  // Open deposit modal targeting a specific student
  const handleOpenDepositForNasabah = (nasabah: NasabahUser) => {
    setPrefilledNasabahId(nasabah.id);
    setPrefilledGoalId(undefined);
    setIsDepositModalOpen(true);
  };

  // Add Goal
  const handleAddGoal = (newGoalData: Omit<TargetGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: TargetGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      currentAmount: 0,
      createdAt: Date.now(),
      isCompleted: false,
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveStoredGoals(updatedGoals);
    saveGoalToFirestore(newGoal).catch((e) => console.warn('Sync goal to Firestore:', e));
  };

  // Delete Goal
  const handleDeleteGoal = (id: string) => {
    const targetGoal = goals.find((g) => g.id === id);
    if (!targetGoal) return;
    triggerAndroidHaptic(preferences.enableVibration, 10);
    setGoalToDelete(targetGoal);
  };

  const handleConfirmDeleteGoal = () => {
    if (!goalToDelete) return;
    triggerAndroidHaptic(preferences.enableVibration, 15);
    const updated = goals.filter((g) => g.id !== goalToDelete.id);
    setGoals(updated);
    saveStoredGoals(updated);
    deleteGoalFromFirestore(goalToDelete.id).catch((e) => console.warn('Delete goal from Firestore:', e));
    setGoalToDelete(null);
  };

  // Quick action from goal card
  const handleDepositToGoal = (goalId: string) => {
    setPrefilledGoalId(goalId);
    setIsDepositModalOpen(true);
  };

  // Preferences update
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    saveStoredPreferences(newPrefs);
  };

  // Restore & Reset
  const handleRestoreData = (restoredTx: SavingsTransaction[], restoredGoals: TargetGoal[]) => {
    setTransactions(restoredTx);
    setGoals(restoredGoals);
    saveStoredTransactions(restoredTx);
    saveStoredGoals(restoredGoals);
    restoredTx.forEach((tx) => saveTransactionToFirestore(tx).catch(() => {}));
    restoredGoals.forEach((g) => saveGoalToFirestore(g).catch(() => {}));
  };

  const handleResetSampleData = () => {
    const data = resetToSampleData();
    setTransactions(data.transactions);
    setGoals(data.goals);
    data.transactions.forEach((tx) => saveTransactionToFirestore(tx).catch(() => {}));
    data.goals.forEach((g) => saveGoalToFirestore(g).catch(() => {}));
  };

  return (
    <AndroidFrame
      activeTabTitle={activeTab}
      isSimulatedDevice={isSimulatedDevice}
      onToggleSimulatedDevice={() => setIsSimulatedDevice((prev) => !prev)}
      onOpenReminderModal={() => setIsReminderModalOpen(true)}
      onOpenQrModal={() => setIsQrModalOpen(true)}
      session={authSession}
      onLogout={handleOpenLogoutModal}
    >
      {/* Scrollable Main Content Container */}
      <div className="p-4 space-y-4">
        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {/* ================= VIEW 1: BERANDA ================= */}
        {activeTab === 'beranda' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Greeting Header with Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-xs border border-teal-200 bg-white shrink-0 p-0.5">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isAdmin ? 'Panel Pengelola Teller' : 'Buku Tabungan Siswa'}
                  </span>
                  <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                    {isAdmin ? 'Administrator SDN Margawangi' : currentNasabah?.name || authSession.name}
                  </h1>
                  {!isAdmin && currentNasabah && (
                    <span className="text-[11px] font-bold text-teal-700">
                      {currentNasabah.kelas} • No. Rek: {currentNasabah.accountNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isAdmin ? (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-sky-100 text-sky-800 text-[11px] font-bold rounded-full flex items-center gap-1 border border-sky-300">
                    <GraduationCap className="w-3.5 h-3.5" /> Siswa
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleOpenLogoutModal}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full flex items-center gap-1 border border-rose-200 transition active:scale-95 cursor-pointer shadow-2xs"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>

            {/* Hero Main Savings Balance Card */}
            <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                      <Wallet className="w-4 h-4 text-teal-300" />
                    </div>
                    <span className="text-xs font-medium text-teal-200">
                      {isAdmin ? 'Total Kas Tabungan Seluruh Siswa' : 'Total Saldo Tabungan Saya'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Aktif
                  </span>
                </div>

                {/* Grand Total Amount */}
                <div className="mt-3">
                  <h2 className="text-3xl font-black tracking-tight font-['Outfit',sans-serif] text-white">
                    {formatRupiah(totalSavings)}
                  </h2>
                  <p className="text-[11px] text-teal-200/80 mt-0.5">
                    {isAdmin
                      ? `Akumulasi tabungan dari ${nasabahUsers.length} nasabah siswa terdaftar`
                      : 'Saldo aktif yang tercatat pada buku tabungan sekolah'}
                  </p>
                </div>

                {/* Quick 3-Pill Recap Snapshot: Harian, Mingguan, Bulanan */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-teal-300 block font-medium">Hari Ini</span>
                    <span className="text-xs font-bold font-['Outfit',sans-serif] text-white block mt-0.5">
                      {formatRupiah(todayRecap.totalSetoran)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-teal-300 block font-medium">Minggu Ini</span>
                    <span className="text-xs font-bold font-['Outfit',sans-serif] text-white block mt-0.5">
                      {formatRupiah(thisWeekRecap.totalSetoran)}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-teal-300 block font-medium">Bulan Ini</span>
                    <span className="text-xs font-bold font-['Outfit',sans-serif] text-white block mt-0.5">
                      {formatRupiah(thisMonthRecap.totalSetoran)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  triggerAndroidHaptic(preferences.enableVibration, 12);
                  setPrefilledGoalId(undefined);
                  setPrefilledNasabahId(authSession.nasabahId);
                  setIsDepositModalOpen(true);
                }}
                className="p-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                {isAdmin ? 'Catat Setoran Siswa' : 'Catat Setoran Saya'}
              </button>

              {isAdmin ? (
                <button
                  onClick={() => {
                    triggerAndroidHaptic(preferences.enableVibration, 10);
                    setActiveTab('nasabah');
                  }}
                  className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition active:scale-98"
                >
                  <Users className="w-4 h-4 text-teal-600" />
                  Kelola {nasabahUsers.length} Siswa
                </button>
              ) : (
                <button
                  onClick={() => {
                    triggerAndroidHaptic(preferences.enableVibration, 10);
                    setActiveTab('rekap');
                  }}
                  className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition active:scale-98"
                >
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Lihat Rekap Siswa
                </button>
              )}
            </div>

            {/* Target Celengan Highlights */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Celengan Teratas
                </h3>
                <button
                  onClick={() => setActiveTab('target')}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Lihat Semua ({goals.length})
                </button>
              </div>

              {goals.slice(0, 2).map((goal) => {
                const progressPct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-2 last:mb-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{goal.name}</span>
                      <span className="text-xs font-extrabold text-teal-700">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                      <span>Terkumpul: {formatRupiah(goal.currentAmount)}</span>
                      <span>Target: {formatRupiah(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIEW 2: REKAP ================= */}
        {activeTab === 'rekap' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Rekap Period Sub-Nav Toggle */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex">
              <button
                onClick={() => {
                  triggerAndroidHaptic(preferences.enableVibration, 8);
                  setRekapSubTab('harian');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  rekapSubTab === 'harian'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => {
                  triggerAndroidHaptic(preferences.enableVibration, 8);
                  setRekapSubTab('mingguan');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  rekapSubTab === 'mingguan'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => {
                  triggerAndroidHaptic(preferences.enableVibration, 8);
                  setRekapSubTab('bulanan');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  rekapSubTab === 'bulanan'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulanan
              </button>
            </div>

            {/* Sub-view switcher */}
            {rekapSubTab === 'harian' && (
              <RekapHarian
                transactions={visibleTransactions}
                goals={goals}
                preferences={preferences}
                onOpenDepositModal={() => {
                  setPrefilledGoalId(undefined);
                  setPrefilledNasabahId(authSession.nasabahId);
                  setIsDepositModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}

            {rekapSubTab === 'mingguan' && (
              <RekapMingguan
                transactions={visibleTransactions}
                preferences={preferences}
              />
            )}

            {rekapSubTab === 'bulanan' && (
              <RekapBulanan
                transactions={visibleTransactions}
                preferences={preferences}
              />
            )}
          </div>
        )}

        {/* ================= VIEW: ADMIN KELOLA NASABAH ================= */}
        {activeTab === 'nasabah' && isAdmin && (
          <div className="animate-in fade-in duration-200">
            <AdminKelolaNasabah
              nasabahUsers={nasabahUsers}
              transactions={transactions}
              onAddNasabah={handleAddNasabah}
              onUpdateNasabah={handleUpdateNasabah}
              onDeleteNasabah={handleDeleteNasabah}
              onOpenDepositForNasabah={handleOpenDepositForNasabah}
              enableVibration={preferences.enableVibration}
            />
          </div>
        )}

        {/* ================= VIEW 3: KANTONG TARGET ================= */}
        {activeTab === 'target' && (
          <div className="animate-in fade-in duration-200">
            <TargetKantong
              goals={goals}
              preferences={preferences}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              onDepositToGoal={handleDepositToGoal}
            />
          </div>
        )}

        {/* ================= VIEW 4: RIWAYAT TRANSAKSI ================= */}
        {activeTab === 'riwayat' && (
          <div className="animate-in fade-in duration-200">
            <RiwayatTransaksi
              transactions={visibleTransactions}
              goals={goals}
              preferences={preferences}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenDepositModal={() => {
                setPrefilledGoalId(undefined);
                setPrefilledNasabahId(authSession.nasabahId);
                setIsDepositModalOpen(true);
              }}
            />
          </div>
        )}

        {/* ================= VIEW 5: ALAT & EKSPOR ================= */}
        {activeTab === 'alat' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Alat Sub-tabs */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex">
              <button
                onClick={() => {
                  triggerAndroidHaptic(preferences.enableVibration, 8);
                  setAlatSubTab('kalkulator');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  alatSubTab === 'kalkulator'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kalkulator Simulasi
              </button>
              <button
                onClick={() => {
                  triggerAndroidHaptic(preferences.enableVibration, 8);
                  setAlatSubTab('ekspor');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  alatSubTab === 'ekspor'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ekspor & Pengaturan
              </button>
            </div>

            {alatSubTab === 'kalkulator' ? (
              <KalkulatorSimulasi />
            ) : (
              <EksporBackup
                transactions={transactions}
                goals={goals}
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onRestoreData={handleRestoreData}
                onResetSampleData={handleResetSampleData}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Android Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenDepositModal={() => {
          setPrefilledGoalId(undefined);
          setPrefilledNasabahId(authSession.nasabahId);
          setIsDepositModalOpen(true);
        }}
        enableVibration={preferences.enableVibration}
        isAdmin={isAdmin}
      />

      {/* Setoran / Penarikan Modal Bottom Sheet */}
      <ModalTransaksi
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setPrefilledNasabahId(undefined);
        }}
        onSave={handleSaveTransaction}
        goals={goals}
        defaultGoalId={prefilledGoalId}
        enableVibration={preferences.enableVibration}
        nasabahUsers={nasabahUsers}
        defaultNasabahId={prefilledNasabahId || authSession.nasabahId}
        isAdmin={isAdmin}
      />

      {/* Pengingat Nabung Harian Modal */}
      <PengingatModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        preferences={preferences}
        onSavePreferences={handleUpdatePreferences}
      />

      {/* In-App Konfirmasi Keluar Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Keluar</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun <strong className="text-slate-800">{isAdmin ? 'Admin' : authSession.name}</strong>?
            </p>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Konfirmasi Hapus Transaksi Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Catatan Transaksi?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Hapus transaksi senilai <strong className="text-slate-800">{formatRupiah(txToDelete.amount)}</strong> pada tanggal {txToDelete.date}?
            </p>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTransaction}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Konfirmasi Hapus Target Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hapus Target Celengan?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Hapus celengan <strong className="text-slate-800">{goalToDelete.name}</strong>? Riwayat transaksi sebelumnya akan tetap tersimpan.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGoal}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* QR Code Modal for Android */}
      <AndroidQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        enableVibration={preferences.enableVibration}
      />
    </AndroidFrame>
  );
}
