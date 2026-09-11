import React, { useState } from 'react';
import { Calculator, Sparkles, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

export const KalkulatorSimulasi: React.FC = () => {
  const [mode, setMode] = useState<'waktu' | 'nominal'>('waktu');
  
  // State for Mode 'waktu' (Hitung berapa lama)
  const [targetGoalAmount, setTargetGoalAmount] = useState<number>(3000000);
  const [dailySavingPower, setDailySavingPower] = useState<number>(25000);

  // State for Mode 'nominal' (Hitung harus nabung berapa)
  const [desiredAmount, setDesiredAmount] = useState<number>(5000000);
  const [targetMonths, setTargetMonths] = useState<number>(6);

  // Calculations
  const daysToReach = dailySavingPower > 0 ? Math.ceil(targetGoalAmount / dailySavingPower) : 0;
  const monthsToReach = (daysToReach / 30).toFixed(1);

  const totalDaysDesired = targetMonths * 30;
  const dailyNeeded = totalDaysDesired > 0 ? Math.ceil(desiredAmount / totalDaysDesired) : 0;
  const weeklyNeeded = dailyNeeded * 7;

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMode('waktu')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'waktu'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hitung Waktu Target
          </button>
          <button
            onClick={() => setMode('nominal')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'nominal'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hitung Setoran Harian
          </button>
        </div>
      </div>

      {mode === 'waktu' ? (
        /* Mode 1: Hitung Waktu */
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Target Jumlah Uang yang Ingin Dikumpulkan
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 flex items-center">
              <span className="font-bold text-teal-700 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(targetGoalAmount)}
                onChange={(e) => setTargetGoalAmount(parseRupiahInput(e.target.value))}
                className="w-full bg-transparent font-extrabold text-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Kemampuan Menabung per Hari
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 flex items-center">
              <span className="font-bold text-teal-700 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(dailySavingPower)}
                onChange={(e) => setDailySavingPower(parseRupiahInput(e.target.value))}
                className="w-full bg-transparent font-extrabold text-lg outline-none"
              />
            </div>
            {/* Quick chips */}
            <div className="flex gap-1.5 mt-2">
              {[10000, 20000, 30000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDailySavingPower(val)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                    dailySavingPower === val
                      ? 'bg-teal-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {val / 1000}rb
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 text-teal-950">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Estimasi Waktu Tercapai
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black font-['Outfit',sans-serif] text-teal-800">
                {daysToReach} Hari
              </span>
              <span className="text-sm font-semibold text-teal-700">
                (~{monthsToReach} Bulan)
              </span>
            </div>
            <p className="text-xs text-teal-900/80 mt-1">
              Dengan disiplin menabung {formatRupiah(dailySavingPower)} setiap hari, kamu akan mengumpulkan {formatRupiah(targetGoalAmount)} tanpa terasa!
            </p>
          </div>
        </div>
      ) : (
        /* Mode 2: Hitung Nominal Harian */
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Target Jumlah Tabungan (Rp)
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 flex items-center">
              <span className="font-bold text-teal-700 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(desiredAmount)}
                onChange={(e) => setDesiredAmount(parseRupiahInput(e.target.value))}
                className="w-full bg-transparent font-extrabold text-lg outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-500">
                Target Waktu: {targetMonths} Bulan
              </label>
              <span className="text-xs font-bold text-teal-700">
                {targetMonths * 30} Hari
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="36"
              value={targetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Bulan</span>
              <span>12 Bulan (1 Thn)</span>
              <span>36 Bulan (3 Thn)</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 text-teal-950">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wide flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              Rekomendasi Setoran
            </span>
            <div className="mt-2">
              <span className="text-3xl font-black font-['Outfit',sans-serif] text-teal-800">
                {formatRupiah(dailyNeeded)}
              </span>
              <span className="text-xs font-bold text-teal-700 block mt-0.5">
                per hari (atau {formatRupiah(weeklyNeeded)} / minggu)
              </span>
            </div>
            <p className="text-xs text-teal-900/80 mt-2">
              Cukup sisihkan {formatRupiah(dailyNeeded)} setiap hari, target {formatRupiah(desiredAmount)} akan tercapai tuntas dalam {targetMonths} bulan.
            </p>
          </div>
        </div>
      )}

      {/* Proyeksi Akumulasi 30 Hari ke Depan */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          Proyeksi Tabunganmu (Berdasarkan Setoran Harian)
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block">7 Hari (1 Minggu)</span>
            <span className="text-xs font-extrabold font-['Outfit',sans-serif] text-teal-700">
              {formatRupiah(dailySavingPower * 7)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block">30 Hari (1 Bulan)</span>
            <span className="text-xs font-extrabold font-['Outfit',sans-serif] text-teal-700">
              {formatRupiah(dailySavingPower * 30)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
            <span className="text-[10px] text-teal-800 font-bold block">1 Tahun (365 Hari)</span>
            <span className="text-xs font-black font-['Outfit',sans-serif] text-teal-900">
              {formatRupiah(dailySavingPower * 365)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
