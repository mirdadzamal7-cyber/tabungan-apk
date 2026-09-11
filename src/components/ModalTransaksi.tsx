import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, Calendar, Tag, FileText, Target as TargetIcon, User } from 'lucide-react';
import { SavingsTransaction, TransactionType, SavingsCategory, TargetGoal, NasabahUser } from '../types';
import { formatRupiah, parseRupiahInput, CATEGORY_META, triggerAndroidHaptic } from '../utils/formatters';

interface ModalTransaksiProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<SavingsTransaction, 'id' | 'createdAt'>) => void;
  goals: TargetGoal[];
  defaultGoalId?: string;
  enableVibration: boolean;
  nasabahUsers?: NasabahUser[];
  defaultNasabahId?: string;
  isAdmin?: boolean;
}

export const ModalTransaksi: React.FC<ModalTransaksiProps> = ({
  isOpen,
  onClose,
  onSave,
  goals,
  defaultGoalId,
  enableVibration,
  nasabahUsers = [],
  defaultNasabahId,
  isAdmin = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [type, setType] = useState<TransactionType>('setoran');
  const [amount, setAmount] = useState<number>(20000);
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(currentTimeStr);
  const [categoryId, setCategoryId] = useState<SavingsCategory>('uang_jajan');
  const [targetGoalId, setTargetGoalId] = useState<string>(defaultGoalId || '');
  const [selectedNasabahId, setSelectedNasabahId] = useState<string>(defaultNasabahId || (nasabahUsers[0]?.id || ''));
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (defaultNasabahId) {
      setSelectedNasabahId(defaultNasabahId);
    }
  }, [defaultNasabahId]);

  if (!isOpen) return null;

  const quickNominals = [10000, 20000, 50000, 100000, 200000, 500000];

  const handleQuickAdd = (val: number) => {
    triggerAndroidHaptic(enableVibration, 8);
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const chosenNasabah = nasabahUsers.find((n) => n.id === selectedNasabahId);

    triggerAndroidHaptic(enableVibration, [15, 40]);
    onSave({
      type,
      amount,
      date,
      time,
      categoryId,
      targetGoalId: targetGoalId || undefined,
      nasabahId: selectedNasabahId || undefined,
      nasabahName: chosenNasabah?.name || undefined,
      teller: isAdmin ? 'Admin SDN Margawangi' : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Android Bottom Sheet / Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5 duration-200">
        {/* Android Sheet Drag Handle */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            {type === 'setoran' ? 'Catat Setoran Tabungan' : 'Catat Penarikan'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Type Switcher: Setoran vs Penarikan */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                triggerAndroidHaptic(enableVibration, 8);
                setType('setoran');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                type === 'setoran'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Setoran Masuk (Nabung)
            </button>
            <button
              type="button"
              onClick={() => {
                triggerAndroidHaptic(enableVibration, 8);
                setType('penarikan');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                type === 'penarikan'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Tarik Tabungan
            </button>
          </div>

          {/* If Admin: Select Nasabah / Siswa */}
          {isAdmin && nasabahUsers.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-2xl">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-700" />
                Pilih Nasabah (Siswa SDN Margawangi)
              </label>
              <select
                value={selectedNasabahId}
                onChange={(e) => setSelectedNasabahId(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:border-amber-600 shadow-2xs"
              >
                {nasabahUsers.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.accountNumber} - {n.name} ({n.kelas})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nominal Display & Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Nominal {type === 'setoran' ? 'Setoran' : 'Penarikan'}
            </label>
            <div className="relative rounded-2xl bg-slate-50 border-2 border-slate-200 focus-within:border-teal-600 transition p-3">
              <div className="text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] flex items-center">
                <span className="text-teal-700 mr-1.5">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount ? new Intl.NumberFormat('id-ID').format(amount) : ''}
                  onChange={(e) => setAmount(parseRupiahInput(e.target.value))}
                  placeholder="0"
                  className="w-full bg-transparent outline-none font-bold text-2xl tracking-tight text-slate-900"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Nominal Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {quickNominals.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    amount === val
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  +{formatRupiah(val, false)}
                </button>
              ))}
            </div>
          </div>

          {/* Target Celengan / Kantong Tujuan */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <TargetIcon className="w-3.5 h-3.5 text-teal-600" />
              Masuk ke Kantong / Target
            </label>
            <select
              value={targetGoalId}
              onChange={(e) => setTargetGoalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-teal-600 transition"
            >
              <option value="">Tabungan Umum (Bebas / Celengan Utama)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.name} (Terkumpul: {formatRupiah(g.currentAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Kategori Sumber Dana */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-teal-600" />
              Kategori Sumber Tabungan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(CATEGORY_META) as SavingsCategory[]).map((catKey) => {
                const meta = CATEGORY_META[catKey];
                const isSelected = categoryId === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      triggerAndroidHaptic(enableVibration, 8);
                      setCategoryId(catKey);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs truncate">{meta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tanggal & Jam */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Jam
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Hasil sisa uang jajan kuliah, koin galon"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600 transition"
              maxLength={80}
            />
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={amount <= 0}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition ${
              amount > 0
                ? type === 'setoran'
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-600 hover:opacity-95'
                  : 'bg-gradient-to-r from-rose-700 to-red-600 hover:opacity-95'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Check className="w-4 h-4" />
            Simpan {type === 'setoran' ? 'Setoran' : 'Penarikan'} ({formatRupiah(amount)})
          </button>
        </form>
      </div>
    </div>
  );
};
