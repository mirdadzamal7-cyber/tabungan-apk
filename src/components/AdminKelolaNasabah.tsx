import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  Wallet,
  Phone,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import { NasabahUser, SavingsTransaction } from '../types';
import { formatRupiah, formatTanggalIndo, parseRupiahInput, triggerAndroidHaptic } from '../utils/formatters';

interface AdminKelolaNasabahProps {
  nasabahUsers: NasabahUser[];
  transactions: SavingsTransaction[];
  onAddNasabah: (
    newNasabah: Omit<NasabahUser, 'id' | 'createdAt'>,
    initialDeposit?: number
  ) => void;
  onUpdateNasabah: (updated: NasabahUser) => void;
  onDeleteNasabah: (id: string) => void;
  onOpenDepositForNasabah: (nasabah: NasabahUser) => void;
  enableVibration: boolean;
}

export const AdminKelolaNasabah: React.FC<AdminKelolaNasabahProps> = ({
  nasabahUsers,
  transactions,
  onAddNasabah,
  onUpdateNasabah,
  onDeleteNasabah,
  onOpenDepositForNasabah,
  enableVibration,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [editingNasabah, setEditingNasabah] = useState<NasabahUser | null>(null);
  const [nasabahToDelete, setNasabahToDelete] = useState<NasabahUser | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for creating new nasabah
  const nextAccountNumber = `NSB-${String(nasabahUsers.length + 1).padStart(3, '0')}`;
  const [accountNumber, setAccountNumber] = useState(nextAccountNumber);
  const [name, setName] = useState('');
  const [kelas, setKelas] = useState('Kelas 4A');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [parentPhone, setParentPhone] = useState('');
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [notes, setNotes] = useState('');

  // Calculate balance for each nasabah
  const getNasabahBalance = (nasabahId: string) => {
    return transactions
      .filter((t) => t.nasabahId === nasabahId)
      .reduce((acc, curr) => (curr.type === 'setoran' ? acc + curr.amount : acc - curr.amount), 0);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setFormError('Nama, Username, dan Password wajib diisi.');
      return;
    }

    // Check duplicate username
    if (nasabahUsers.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setFormError(`Username "${username}" sudah digunakan nasabah lain. Silakan pilih username lain.`);
      return;
    }

    triggerAndroidHaptic(enableVibration, [20, 40]);
    onAddNasabah(
      {
        accountNumber: accountNumber.trim() || nextAccountNumber,
        name: name.trim(),
        kelas,
        username: username.trim().toLowerCase(),
        password: password.trim(),
        parentPhone: parentPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive: true,
      },
      initialDeposit > 0 ? initialDeposit : undefined
    );

    // Reset Form
    setName('');
    setUsername('');
    setPassword('123456');
    setParentPhone('');
    setInitialDeposit(0);
    setNotes('');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNasabah) return;

    triggerAndroidHaptic(enableVibration, 15);
    onUpdateNasabah(editingNasabah);
    setEditingNasabah(null);
  };

  // Filtered nasabah list
  const filteredNasabah = nasabahUsers.filter((n) => {
    if (filterKelas !== 'all' && n.kelas !== filterKelas) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = n.name.toLowerCase().includes(q);
      const matchUser = n.username.toLowerCase().includes(q);
      const matchAcc = n.accountNumber.toLowerCase().includes(q);
      const matchKelas = n.kelas.toLowerCase().includes(q);
      return matchName || matchUser || matchAcc || matchKelas;
    }
    return true;
  });

  const totalSekolahSavings = transactions.reduce(
    (acc, curr) => (curr.type === 'setoran' ? acc + curr.amount : acc - curr.amount),
    0
  );

  const kelasOptions = [
    'Kelas 1A', 'Kelas 1B',
    'Kelas 2A', 'Kelas 2B', 'Kelas 2C',
    'Kelas 3A', 'Kelas 3B',
    'Kelas 4A', 'Kelas 4B',
    'Kelas 5A', 'Kelas 5B',
    'Kelas 6A', 'Kelas 6B',
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Stat */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Users className="w-4 h-4 text-teal-300" />
              </div>
              <span className="text-xs font-semibold text-teal-200">
                Data Nasabah SDN Margawangi
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
              {nasabahUsers.length} Siswa Terdaftar
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] text-teal-200">Total Kas Seluruh Siswa</span>
              <h2 className="text-2xl font-black font-['Outfit',sans-serif] text-white">
                {formatRupiah(totalSekolahSavings)}
              </h2>
            </div>

            <button
              onClick={() => {
                triggerAndroidHaptic(enableVibration, 10);
                setAccountNumber(`NSB-${String(nasabahUsers.length + 1).padStart(3, '0')}`);
                setShowAddModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              + Buat User Nasabah
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, no rekening, atau username..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setFilterKelas('all')}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              filterKelas === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kelas ({nasabahUsers.length})
          </button>
          {['Kelas 1A', 'Kelas 2C', 'Kelas 3B', 'Kelas 4A', 'Kelas 5A'].map((k) => (
            <button
              key={k}
              onClick={() => setFilterKelas(k)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                filterKelas === k
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Nasabah List */}
      <div className="space-y-2.5">
        {filteredNasabah.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold text-slate-700">Tidak ada nasabah ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Coba gunakan kata kunci lain atau buat user nasabah baru
            </p>
          </div>
        ) : (
          filteredNasabah.map((nasabah) => {
            const balance = getNasabahBalance(nasabah.id);
            return (
              <div
                key={nasabah.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100 border border-teal-200 flex items-center justify-center text-teal-800 font-extrabold text-sm shrink-0">
                      {nasabah.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{nasabah.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                          {nasabah.kelas}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600 font-medium">
                          {nasabah.accountNumber}
                        </span>
                        <span>•</span>
                        <span className="text-teal-700 font-semibold">
                          user: <strong>{nasabah.username}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Saldo Tabungan</span>
                    <span className="text-sm font-extrabold font-['Outfit',sans-serif] text-emerald-700">
                      {formatRupiah(balance)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <KeyRound className="w-3 h-3 text-slate-400" />
                    <span>Pass: ••••••</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        triggerAndroidHaptic(enableVibration, 10);
                        onOpenDepositForNasabah(nasabah);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg flex items-center gap-1 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      + Setor
                    </button>

                    <button
                      onClick={() => {
                        triggerAndroidHaptic(enableVibration, 8);
                        setEditingNasabah(nasabah);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Data"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        triggerAndroidHaptic(enableVibration, 12);
                        setNasabahToDelete(nasabah);
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Nasabah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal: Hapus Nasabah */}
      {nasabahToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Hapus Akun Nasabah?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus akun <strong className="text-slate-700">{nasabahToDelete.name}</strong> ({nasabahToDelete.username})?
            </p>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setNasabahToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerAndroidHaptic(enableVibration, 15);
                  onDeleteNasabah(nasabahToDelete.id);
                  setNasabahToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembuatan User Nasabah Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Buat Akun Nasabah Siswa</h3>
                  <p className="text-[11px] text-slate-500">Daftarkan siswa baru ke Tabungan Berkah</p>
                </div>
              </div>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    No. Rekening Siswa
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 font-mono outline-none focus:border-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kelas / Rombel
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                  >
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!username) {
                      // auto suggest username from first name
                      const first = e.target.value.toLowerCase().split(' ')[0].replace(/[^a-z0-9]/g, '');
                      setUsername(first);
                    }
                  }}
                  placeholder="Contoh: Muhammad Fathan"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Username Login Siswa
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="fathan"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-teal-800 outline-none focus:border-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="123456"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nomor HP / WhatsApp Orang Tua (Opsional)
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Setoran Awal (Rp, Opsional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={initialDeposit ? new Intl.NumberFormat('id-ID').format(initialDeposit) : ''}
                  onChange={(e) => setInitialDeposit(parseRupiahInput(e.target.value))}
                  placeholder="Rp 0"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-teal-600"
                />
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
                  Simpan & Buat User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Nasabah */}
      {editingNasabah && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="absolute inset-0" onClick={() => setEditingNasabah(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Ubah Data Nasabah: {editingNasabah.name}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingNasabah.name}
                  onChange={(e) => setEditingNasabah({ ...editingNasabah, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
                  <input
                    type="text"
                    value={editingNasabah.username}
                    onChange={(e) => setEditingNasabah({ ...editingNasabah, username: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                  <input
                    type="text"
                    value={editingNasabah.password}
                    onChange={(e) => setEditingNasabah({ ...editingNasabah, password: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
                <select
                  value={editingNasabah.kelas}
                  onChange={(e) => setEditingNasabah({ ...editingNasabah, kelas: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {kelasOptions.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNasabah(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
