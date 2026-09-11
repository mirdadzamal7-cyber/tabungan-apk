import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Plus, CheckCircle2, AlertCircle, Trash2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { SavingsTransaction, TargetGoal, UserPreferences } from '../types';
import { formatRupiah, formatTanggalIndo, CATEGORY_META, triggerAndroidHaptic } from '../utils/formatters';
import { calculateDailyRecap, calculateSavingsStreak } from '../utils/storage';

interface RekapHarianProps {
  transactions: SavingsTransaction[];
  goals: TargetGoal[];
  preferences: UserPreferences;
  onOpenDepositModal: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const RekapHarian: React.FC<RekapHarianProps> = ({
  transactions,
  goals,
  preferences,
  onOpenDepositModal,
  onDeleteTransaction,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const recap = calculateDailyRecap(transactions, selectedDate);
  const streak = calculateSavingsStreak(transactions);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handlePrevDay = () => {
    triggerAndroidHaptic(preferences.enableVibration, 8);
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    triggerAndroidHaptic(preferences.enableVibration, 8);
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dayTransactions = transactions
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => b.createdAt - a.createdAt);

  const targetPercentage = Math.min(
    100,
    Math.round((recap.totalSetoran / (preferences.dailyTargetAmount || 1)) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Date Navigator Header */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Hari Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">
              {formatTanggalIndo(selectedDate, 'hari-tanggal')}
            </span>
            {isToday && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                Hari Ini
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {formatTanggalIndo(selectedDate, 'lengkap')}
          </p>
        </div>

        <button
          onClick={handleNextDay}
          disabled={isToday}
          className={`p-2 rounded-xl transition ${
            isToday
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Hari Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Target Harian & Streak Card */}
      <div className="bg-gradient-to-br from-teal-700 to-emerald-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-teal-200 text-xs font-medium">Rekap Setoran Harian</span>
            <h3 className="text-2xl font-extrabold font-['Outfit',sans-serif] mt-0.5 tracking-tight">
              {formatRupiah(recap.totalSetoran)}
            </h3>
            {recap.totalPenarikan > 0 && (
              <span className="text-[11px] text-rose-200 block mt-0.5">
                Ditarik: -{formatRupiah(recap.totalPenarikan)}
              </span>
            )}
          </div>

          {/* Streak Indicator */}
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
            <div>
              <span className="text-[10px] text-teal-100 block uppercase leading-none font-bold">
                Streak
              </span>
              <span className="text-xs font-extrabold text-white">
                {streak.currentStreak} Hari
              </span>
            </div>
          </div>
        </div>

        {/* Progress against Daily Target */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-teal-100">
              Target Harian: {formatRupiah(preferences.dailyTargetAmount)}
            </span>
            <span className="font-bold text-white">{targetPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                targetPercentage >= 100
                  ? 'bg-gradient-to-r from-amber-300 to-emerald-300'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${targetPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-teal-100 flex items-center gap-1">
            {targetPercentage >= 100 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Alhamdulillah, target harian tercapai! Mantap sobat.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                <span>
                  Kurang {formatRupiah(Math.max(0, preferences.dailyTargetAmount - recap.totalSetoran))} untuk mencapai target.
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Bersih Hari Ini</span>
          <p className="text-lg font-bold text-teal-700 font-['Outfit',sans-serif]">
            {formatRupiah(recap.netSavings)}
          </p>
          <span className="text-[10px] text-slate-400">
            {recap.transactionCount} transaksi tercatat
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Catat Tambahan</span>
          <button
            onClick={() => {
              triggerAndroidHaptic(preferences.enableVibration, 10);
              onOpenDepositModal();
            }}
            className="mt-1 w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + Setor Hari Ini
          </button>
        </div>
      </div>

      {/* Rincian Transaksi Hari Ini */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Rincian Setoran ({formatTanggalIndo(selectedDate, 'pendek')})
          </h4>
          <span className="text-[11px] font-semibold text-teal-700">
            {dayTransactions.length} Setoran
          </span>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">Belum ada setoran pada tanggal ini</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Yuk mulai sisihkan uang receh atau sisa belanja hari ini.
            </p>
            <button
              onClick={() => {
                triggerAndroidHaptic(preferences.enableVibration, 10);
                onOpenDepositModal();
              }}
              className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              + Mulai Nabung Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayTransactions.map((tx) => {
              const meta = CATEGORY_META[tx.categoryId] || CATEGORY_META.lainnya;
              const target = goals.find((g) => g.id === tx.targetGoalId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.bgLight, color: meta.color }}
                    >
                      {tx.type === 'setoran' ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">{meta.name}</span>
                        <span className="text-[10px] text-slate-400">({tx.time})</span>
                        {tx.nasabahName && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-200">
                            👨‍🎓 {tx.nasabahName}
                          </span>
                        )}
                      </div>
                      {target && (
                        <span className="text-[10px] font-medium text-teal-600 block">
                          🎯 {target.name}
                        </span>
                      )}
                      {tx.notes && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1">
                          "{tx.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold font-['Outfit',sans-serif] ${
                          tx.type === 'setoran' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'setoran' ? '+' : '-'}
                        {formatRupiah(tx.amount)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        triggerAndroidHaptic(preferences.enableVibration, 10);
                        onDeleteTransaction(tx.id);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
