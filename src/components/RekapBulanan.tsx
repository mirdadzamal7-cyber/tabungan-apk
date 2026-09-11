import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PieChart, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { SavingsTransaction, UserPreferences } from '../types';
import { formatRupiah, triggerAndroidHaptic } from '../utils/formatters';
import { calculateMonthlyRecap } from '../utils/storage';

interface RekapBulananProps {
  transactions: SavingsTransaction[];
  preferences: UserPreferences;
}

export const RekapBulanan: React.FC<RekapBulananProps> = ({
  transactions,
  preferences,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  const monthlyRecap = calculateMonthlyRecap(transactions, selectedYear, selectedMonth);

  const handlePrevMonth = () => {
    triggerAndroidHaptic(preferences.enableVibration, 8);
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    triggerAndroidHaptic(preferences.enableVibration, 8);
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // 6 months trend historical data
  const trendMonths: { label: string; amount: number }[] = [];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const r = calculateMonthlyRecap(transactions, y, m);
    trendMonths.push({
      label: `${monthNamesShort[m - 1]}`,
      amount: r.totalSetoran,
    });
  }

  const maxTrend = Math.max(...trendMonths.map((t) => t.amount), 50000);

  return (
    <div className="space-y-4">
      {/* Month Navigator */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-slate-800 block">
            {monthlyRecap.monthLabel}
          </span>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full mt-0.5 inline-block">
            {monthlyRecap.transactionCount} Transaksi Masuk
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Bulan Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Monthly Recap Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-950 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-emerald-200 text-xs font-medium">
              Total Setoran {monthlyRecap.monthLabel}
            </span>
            <h3 className="text-3xl font-black font-['Outfit',sans-serif] mt-1 tracking-tight">
              {formatRupiah(monthlyRecap.totalSetoran)}
            </h3>
            {monthlyRecap.totalPenarikan > 0 && (
              <span className="text-[11px] text-rose-300 block mt-0.5">
                Ditarik: -{formatRupiah(monthlyRecap.totalPenarikan)}
              </span>
            )}
          </div>

          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Calendar className="w-5 h-5 text-emerald-300" />
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div>
            <span className="text-[11px] text-emerald-200/80 block">Tabungan Bersih</span>
            <span className="text-sm font-bold font-['Outfit',sans-serif] text-emerald-300">
              {formatRupiah(monthlyRecap.netSavings)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-200/80 block">Rata-rata Harian</span>
            <span className="text-sm font-bold font-['Outfit',sans-serif] text-white">
              {formatRupiah(Math.round(monthlyRecap.totalSetoran / 30))} / hari
            </span>
          </div>
        </div>
      </div>

      {/* 6-Month Trend Overview */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tren Setoran 6 Bulan Terakhir
            </h4>
            <span className="text-[11px] text-slate-400">
              Grafik konsistensi menabung jangka panjang
            </span>
          </div>
          <TrendingUp className="w-4 h-4 text-teal-600" />
        </div>

        <div className="h-36 flex items-end justify-between gap-2 pt-4 pb-1">
          {trendMonths.map((item, idx) => {
            const heightPercent = maxTrend > 0 ? (item.amount / maxTrend) * 100 : 0;
            const isSelectedMonth = idx === 5;

            return (
              <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end">
                <span className="text-[9px] font-bold text-slate-500 mb-1 truncate max-w-full">
                  {item.amount > 0 ? `${Math.round(item.amount / 1000)}k` : '-'}
                </span>
                <div className="w-full max-w-[28px] h-24 bg-slate-100 rounded-t-lg flex items-end overflow-hidden p-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isSelectedMonth
                        ? 'bg-gradient-to-t from-teal-700 to-emerald-400'
                        : 'bg-slate-300'
                    }`}
                    style={{ height: `${Math.max(item.amount > 0 ? 10 : 0, heightPercent)}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-medium ${
                    isSelectedMonth ? 'font-bold text-teal-800' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Kategori Sumber Tabungan */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-teal-600" />
            Distribusi Sumber Tabungan
          </h4>
          <span className="text-[11px] font-semibold text-slate-500">
            {monthlyRecap.categoryBreakdown.length} Kategori
          </span>
        </div>

        {monthlyRecap.categoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada setoran tercatat di bulan ini
          </p>
        ) : (
          <div className="space-y-3">
            {/* Visual multi-color progress segment */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
              {monthlyRecap.categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                  title={`${cat.name}: ${cat.percentage}%`}
                />
              ))}
            </div>

            {/* List with amount & percentage */}
            <div className="space-y-2 pt-1">
              {monthlyRecap.categoryBreakdown.map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className="font-extrabold font-['Outfit',sans-serif] text-slate-900">
                      {formatRupiah(cat.amount)}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
