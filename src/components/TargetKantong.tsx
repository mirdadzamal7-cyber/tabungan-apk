import React, { useState } from 'react';
import { Target, Plus, CheckCircle, Calendar, Sparkles, Trash2, ArrowUpRight, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TargetGoal, UserPreferences } from '../types';
import { formatRupiah, formatTanggalIndo, parseRupiahInput, triggerAndroidHaptic } from '../utils/formatters';

interface TargetKantongProps {
  goals: TargetGoal[];
  preferences: UserPreferences;
  onAddGoal: (goal: Omit<TargetGoal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string) => void;
}

export const TargetKantong: React.FC<TargetKantongProps> = ({
  goals,
  preferences,
  onAddGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(1000000);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [category, setCategory] = useState('Impian');
  const [color, setColor] = useState('#0d9488');

  const colorOptions = ['#0d9488', '#0284c7', '#4f46e5', '#9333ea', '#e11d48', '#d97706'];

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetAmount <= 0) return;

    triggerAndroidHaptic(preferences.enableVibration, [15, 30]);
    onAddGoal({
      name: name.trim(),
      targetAmount,
      deadlineDate: deadlineDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      category,
      color,
      icon: 'Target',
      isCompleted: false,
    });

    setName('');
    setTargetAmount(1000000);
    setDeadlineDate('');
    setShowAddModal(false);
  };

  const triggerCelebration = () => {
    triggerAndroidHaptic(preferences.enableVibration, [50, 50, 100]);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Target className="w-5 h-5 text-teal-600" />
            Kantong Celengan & Target
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola tabungan terarah untuk setiap impian kamu
          </p>
        </div>

        <button
          onClick={() => {
            triggerAndroidHaptic(preferences.enableVibration, 10);
            setShowAddModal(true);
          }}
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          + Target Baru
        </button>
      </div>

      {/* Goals Cards List */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
            <Target className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Belum Ada Target Celengan</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Buat target seperti "Beli HP Baru", "Dana Darurat", atau "Liburan" agar semakin termotivasi menabung setiap hari!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Buat Target Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100)
            );
            const isFinished = percentage >= 100;
            const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

            // Compute daily recommendation if deadline is in the future
            let dailyNeeded = 0;
            let daysLeft = 0;
            if (goal.deadlineDate) {
              const deadline = new Date(goal.deadlineDate);
              const now = new Date();
              const diffTime = deadline.getTime() - now.getTime();
              daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (daysLeft > 0 && remainingAmount > 0) {
                dailyNeeded = Math.round(remainingAmount / daysLeft);
              }
            }

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden group"
              >
                {/* Accent Top Border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: goal.color }}
                />

                <div className="flex items-start justify-between mt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{goal.name}</span>
                      {isFinished && (
                        <button
                          onClick={triggerCelebration}
                          className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Tercapai!
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Kategori: {goal.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        triggerAndroidHaptic(preferences.enableVibration, 8);
                        onDeleteGoal(goal.id);
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition hover:bg-rose-50"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Nominal */}
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500">Terkumpul</span>
                    <p className="text-xl font-extrabold font-['Outfit',sans-serif] text-slate-900">
                      {formatRupiah(goal.currentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500">Target</span>
                    <p className="text-sm font-bold font-['Outfit',sans-serif] text-slate-600">
                      {formatRupiah(goal.targetAmount)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[11px] font-medium text-slate-500">
                    <span>{percentage}% Tercapai</span>
                    <span>Sisa: {formatRupiah(remainingAmount)}</span>
                  </div>
                </div>

                {/* Daily Plan Recommendation & Quick Deposit Action */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    {isFinished ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Target ini sudah 100% terkumpul!
                      </span>
                    ) : daysLeft > 0 ? (
                      <span>
                        Nabung <strong className="text-teal-700">{formatRupiah(dailyNeeded)}/hari</strong> ({daysLeft} hari lagi)
                      </span>
                    ) : (
                      <span>Target fleksibel</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      triggerAndroidHaptic(preferences.enableVibration, 10);
                      onDepositToGoal(goal.id);
                    }}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                  >
                    + Setor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Target Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-4">
            <h3 className="text-base font-bold text-slate-800 mb-4">
              Buat Kantong Target Baru
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Nama Target / Celengan
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Beli HP Baru, Liburan, Qurban"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Target Nominal (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetAmount ? new Intl.NumberFormat('id-ID').format(targetAmount) : ''}
                  onChange={(e) => setTargetAmount(parseRupiahInput(e.target.value))}
                  placeholder="1.000.000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                  >
                    <option value="Gadget">Gadget & Elektronik</option>
                    <option value="Keuangan">Dana Darurat / Masa Depan</option>
                    <option value="Wisata">Liburan & Travelling</option>
                    <option value="Keluarga">Keluarga & Rumah</option>
                    <option value="Hobi">Hobi & Belanja</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Batas Waktu (Deadline)
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Warna Badge Target */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Warna Tema
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition ${
                        color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
