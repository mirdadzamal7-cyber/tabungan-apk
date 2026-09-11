import React, { useState } from 'react';
import { History, Search, Filter, Trash2, ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react';
import { SavingsTransaction, TargetGoal, SavingsCategory, TransactionType, UserPreferences } from '../types';
import { formatRupiah, formatTanggalIndo, CATEGORY_META, triggerAndroidHaptic } from '../utils/formatters';

interface RiwayatTransaksiProps {
  transactions: SavingsTransaction[];
  goals: TargetGoal[];
  preferences: UserPreferences;
  onDeleteTransaction: (id: string) => void;
  onOpenDepositModal: () => void;
}

export const RiwayatTransaksi: React.FC<RiwayatTransaksiProps> = ({
  transactions,
  goals,
  preferences,
  onDeleteTransaction,
  onOpenDepositModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = CATEGORY_META[tx.categoryId];
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      const matchCat = meta?.name.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      const matchDate = tx.date.includes(q);
      const matchNasabah = (tx.nasabahName || '').toLowerCase().includes(q);
      const matchTeller = (tx.teller || '').toLowerCase().includes(q);
      return matchNotes || matchCat || matchAmount || matchDate || matchNasabah || matchTeller;
    }
    return true;
  });

  const sortedTransactions = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-4">
      {/* Header with Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <History className="w-5 h-5 text-teal-600" />
              Riwayat Transaksi
            </h3>
            <p className="text-xs text-slate-500">
              Total {sortedTransactions.length} dari {transactions.length} catatan tabungan
            </p>
          </div>

          <button
            onClick={() => {
              triggerAndroidHaptic(preferences.enableVibration, 10);
              onOpenDepositModal();
            }}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition"
          >
            + Setor Baru
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari catatan, nominal, atau kategori..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter('setoran')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'setoran'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Setoran Saja
          </button>
          <button
            onClick={() => setTypeFilter('penarikan')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'penarikan'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Penarikan Saja
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        {sortedTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold text-slate-600">Tidak ada transaksi yang cocok</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Coba sesuaikan kata kunci pencarian atau filter tipe transaksi
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedTransactions.map((tx) => {
              const meta = CATEGORY_META[tx.categoryId] || CATEGORY_META.lainnya;
              const target = goals.find((g) => g.id === tx.targetGoalId);

              return (
                <div key={tx.id} className="py-3 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
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
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatTanggalIndo(tx.date, 'pendek')}
                        </span>
                        {target && (
                          <span className="text-teal-700 font-medium">
                            • 🎯 {target.name}
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{tx.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold font-['Outfit',sans-serif] ${
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
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Transaksi"
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
