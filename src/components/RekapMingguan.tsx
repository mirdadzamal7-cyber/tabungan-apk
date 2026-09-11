import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, Award } from 'lucide-react';
import { SavingsTransaction, UserPreferences } from '../types';
import { formatRupiah, formatTanggalIndo, triggerAndroidHaptic } from '../utils/formatters';
import { calculateWeeklyRecap } from '../utils/storage';

interface RekapMingguanProps {
  transactions: SavingsTransaction[];
  preferences: UserPreferences;
}

export const RekapMingguan: React.FC<RekapMingguanProps> = ({
  transactions,
  preferences,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Compute reference date according to week offset
  const refDate = new Date();
  refDate.setDate(refDate.getDate() + weekOffset * 7);

  const weeklyRecap = calculateWeeklyRecap(transactions, refDate);

  // Compute previous week recap for comparison
  const prevRefDate = new Date(refDate);
  prevRefDate.setDate(prevRefDate.getDate() - 7);
  const prevWeeklyRecap = calculateWeeklyRecap(transactions, prevRefDate);

  const diffAmount = weeklyRecap.totalSetoran - prevWeeklyRecap.totalSetoran;
  const percentChange = prevWeeklyRecap.totalSetoran > 0
    ? Math.round((diffAmount / prevWeeklyRecap.totalSetoran) * 100)
    : weeklyRecap.totalSetoran > 0 ? 100 : 0;

  const maxDailyAmount = Math.max(
    ...weeklyRecap.dailyBreakdown.map((d) => d.amount),
    10000
  );

  const activeSavingDaysCount = weeklyRecap.dailyBreakdown.filter((d) => d.amount > 0).length;
  const avgPerDay = Math.round(weeklyRecap.totalSetoran / 7);

  const handlePrevWeek = () => {
    triggerAndroidHaptic(preferences.enableVibration, 8);
    setWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset >= 0) return;
    triggerAndroidHaptic(preferences.enableVibration, 8);
    setWeekOffset((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Minggu Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">
              {weekOffset === 0 ? 'Minggu Ini' : `${Math.abs(weekOffset)} Minggu Lalu`}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {activeSavingDaysCount}/7 Hari Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {formatTanggalIndo(weeklyRecap.startDate, 'pendek')} - {formatTanggalIndo(weeklyRecap.endDate, 'pendek')}
          </p>
        </div>

        <button
          onClick={handleNextWeek}
          disabled={weekOffset >= 0}
          className={`p-2 rounded-xl transition ${
            weekOffset >= 0
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Minggu Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Weekly Total Card */}
      <div className="bg-gradient-to-br from-teal-800 to-teal-950 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-teal-300 text-xs font-medium">Total Rekap Tabungan Mingguan</span>
            <h3 className="text-3xl font-black font-['Outfit',sans-serif] mt-1 tracking-tight">
              {formatRupiah(weeklyRecap.totalSetoran)}
            </h3>
            {weeklyRecap.totalPenarikan > 0 && (
              <span className="text-[11px] text-rose-300 block mt-0.5">
                Total Penarikan: -{formatRupiah(weeklyRecap.totalPenarikan)}
              </span>
            )}
          </div>

          {/* Comparison with last week badge */}
          <div
            className={`px-3 py-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold ${
              diffAmount >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {diffAmount >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{diffAmount >= 0 ? `+${percentChange}%` : `${percentChange}%`}</span>
          </div>
        </div>

        {/* Weekly Stat Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div>
            <span className="text-[11px] text-teal-200/80 block">Rata-rata Harian</span>
            <span className="text-sm font-bold font-['Outfit',sans-serif] text-white">
              {formatRupiah(avgPerDay)} / hari
            </span>
          </div>
          <div>
            <span className="text-[11px] text-teal-200/80 block">Tabungan Bersih</span>
            <span className="text-sm font-bold font-['Outfit',sans-serif] text-emerald-300">
              {formatRupiah(weeklyRecap.netSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Bar Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Grafik Setoran 7 Hari
            </h4>
            <span className="text-[11px] text-slate-400">
              Perkembangan tabungan Senin sampai Minggu
            </span>
          </div>
          <Award className="w-4 h-4 text-amber-500" />
        </div>

        {/* Bar container */}
        <div className="h-44 flex items-end justify-between gap-1.5 pt-6 pb-1 px-1">
          {weeklyRecap.dailyBreakdown.map((item, index) => {
            const heightPercent = maxDailyAmount > 0 ? (item.amount / maxDailyAmount) * 100 : 0;
            const isHighest = item.amount === maxDailyAmount && item.amount > 0;
            const isToday = item.date === new Date().toISOString().split('T')[0];

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Bar Value Tooltip on hover/top */}
                <span className="text-[9px] font-bold text-slate-500 mb-1 opacity-80 group-hover:opacity-100 transition truncate max-w-full">
                  {item.amount > 0 ? `${Math.round(item.amount / 1000)}k` : '-'}
                </span>

                {/* Animated Vertical Bar */}
                <div className="w-full max-w-[28px] h-32 bg-slate-100 rounded-t-lg flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isHighest
                        ? 'bg-gradient-to-t from-teal-700 to-emerald-400 shadow-xs'
                        : item.amount > 0
                        ? 'bg-teal-600 group-hover:bg-teal-500'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(item.amount > 0 ? 12 : 0, heightPercent)}%` }}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-[10px] mt-2 font-medium ${
                    isToday
                      ? 'font-bold text-teal-800 bg-teal-100 px-1 rounded'
                      : 'text-slate-600'
                  }`}
                >
                  {item.dayName.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rincian Hari demi Hari Minggu Ini */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Rincian Harian Minggu Ini
        </h4>
        <div className="divide-y divide-slate-100">
          {weeklyRecap.dailyBreakdown.map((d) => (
            <div key={d.date} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{d.dayName}</span>
                <span className="text-[11px] text-slate-400">
                  ({formatTanggalIndo(d.date, 'pendek')})
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`font-extrabold font-['Outfit',sans-serif] ${
                    d.amount > 0 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {d.amount > 0 ? `+${formatRupiah(d.amount)}` : 'Rp 0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
