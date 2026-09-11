import React, { useState, useRef } from 'react';
import { Download, Upload, Printer, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Sliders, Smartphone, Cloud, Database } from 'lucide-react';
import { SavingsTransaction, TargetGoal, UserPreferences } from '../types';
import { formatRupiah, formatTanggalIndo, parseRupiahInput, triggerAndroidHaptic } from '../utils/formatters';
import { saveTransactionToFirestore, saveGoalToFirestore } from '../firebase';

interface EksporBackupProps {
  transactions: SavingsTransaction[];
  goals: TargetGoal[];
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onRestoreData: (transactions: SavingsTransaction[], goals: TargetGoal[]) => void;
  onResetSampleData: () => void;
}

export const EksporBackup: React.FC<EksporBackupProps> = ({
  transactions,
  goals,
  preferences,
  onUpdatePreferences,
  onRestoreData,
  onResetSampleData,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preference fields
  const [dailyTarget, setDailyTarget] = useState(preferences.dailyTargetAmount);
  const [vibration, setVibration] = useState(preferences.enableVibration);
  const [userName, setUserName] = useState(preferences.userName);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSyncToFirestore = async () => {
    try {
      setIsSyncingCloud(true);
      triggerAndroidHaptic(vibration, 15);
      for (const t of transactions) {
        await saveTransactionToFirestore(t);
      }
      for (const g of goals) {
        await saveGoalToFirestore(g);
      }
      showToast('Seluruh data berhasil disinkronkan ke Cloud Firestore!');
    } catch (e: any) {
      console.error('Manual Firestore sync error:', e);
      showToast('Gagal sinkronisasi: ' + (e.message || 'Periksa koneksi'));
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAndroidHaptic(vibration, 15);
    onUpdatePreferences({
      ...preferences,
      dailyTargetAmount: dailyTarget,
      enableVibration: vibration,
      userName: userName.trim() || 'Sobat Nabung',
    });
    showToast('Pengaturan berhasil disimpan!');
  };

  // Export CSV
  const handleExportCSV = () => {
    triggerAndroidHaptic(vibration, 15);
    const headers = ['ID', 'Tipe', 'Tanggal', 'Jam', 'Nominal', 'Kategori', 'Catatan'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.date,
      t.time,
      t.amount,
      t.categoryId,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_TabungKu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh untuk Excel!');
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    triggerAndroidHaptic(vibration, 15);
    const backupData = {
      app: 'TabungKu Android',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      transactions,
      goals,
      preferences,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `TabungKu_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    showToast('Cadangan data JSON berhasil diunduh!');
  };

  // Import JSON Restore
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.transactions)) {
          onRestoreData(json.transactions, json.goals || []);
          showToast('Data berhasil dipulihkan dari file!');
        } else {
          showToast('Format file cadangan tidak valid.');
        }
      } catch (err) {
        showToast('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Print Report
  const handlePrint = () => {
    triggerAndroidHaptic(vibration, 15);
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile & Target Setting Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-teal-600" />
          Pengaturan Target & Profil
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Nama Pengguna
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Target Tabungan Harian Default
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center text-slate-900">
              <span className="font-bold text-teal-700 mr-2 text-xs">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat('id-ID').format(dailyTarget)}
                onChange={(e) => setDailyTarget(parseRupiahInput(e.target.value))}
                className="w-full bg-transparent font-bold text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-700">
              Getaran Haptic Android
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vibration}
                onChange={(e) => setVibration(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>

      {/* Export / Cetak Laporan */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-teal-600" />
          Ekspor & Cetak Rekap Tabungan
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Download CSV */}
          <button
            onClick={handleExportCSV}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center transition"
          >
            <Download className="w-5 h-5 text-teal-700 mb-1" />
            <span className="text-xs font-bold text-slate-800">Unduh CSV (Excel)</span>
            <span className="text-[10px] text-slate-500">Buka di Sheets HP</span>
          </button>

          {/* Cetak / Print PDF */}
          <button
            onClick={handlePrint}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center transition"
          >
            <Printer className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">Cetak / PDF</span>
            <span className="text-[10px] text-slate-500">Laporan tabungan</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore JSON */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-teal-600" />
          Cadangkan & Pulihkan Data (Backup)
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 flex flex-col items-center justify-center text-center transition"
          >
            <Download className="w-5 h-5 text-teal-800 mb-1" />
            <span className="text-xs font-bold text-teal-900">Cadangkan (JSON)</span>
            <span className="text-[10px] text-teal-700">Simpan ke HP</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center transition"
          >
            <Upload className="w-5 h-5 text-slate-700 mb-1" />
            <span className="text-xs font-bold text-slate-800">Pulihkan Data</span>
            <span className="text-[10px] text-slate-500">Impor file JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Cloud Database Firestore Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-emerald-500/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-emerald-400" />
            Cloud Database Firestore
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            Aktif (asia-southeast1)
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Semua catatan setoran, penarikan, target celengan, dan nasabah tersimpan di Google Cloud Firestore secara real-time.
        </p>

        <button
          onClick={handleSyncToFirestore}
          disabled={isSyncingCloud}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Database className="w-3.5 h-3.5" />
          {isSyncingCloud ? 'Sedang Menyinkronkan...' : 'Paksa Sinkronisasi Sekarang ke Cloud'}
        </button>
      </div>

      {/* Reset to Samples */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-amber-600" />
          Kelola Data Awal
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Ingin melihat kembali data simulasi contoh lengkap dengan target dan transaksi 14 hari terakhir?
        </p>

        <button
          onClick={() => {
            triggerAndroidHaptic(vibration, 10);
            setShowResetModal(true);
          }}
          className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Muat Ulang Data Contoh
        </button>

        {/* In-app confirmation dialog for Reset Sample Data */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Muat Ulang Data Contoh?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Data yang kamu miliki saat ini akan digantikan dengan data contoh simulasi sekolah.
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerAndroidHaptic(vibration, 15);
                    onResetSampleData();
                    setShowResetModal(false);
                    showToast('Data contoh berhasil dimuat kembali!');
                  }}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Ya, Muat Ulang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Android Compatibility */}
      <div className="p-3 bg-slate-100 rounded-2xl text-[11px] text-slate-600 flex items-start gap-2">
        <Smartphone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 block">Kompatibel Android 10, 11, 12, 13, 14+</strong>
          Aplikasi ini dirancang untuk layar sentuh ponsel Android dengan dukungan offline tanpa kuota, respons haptic, dan navigasi gestur.
        </div>
      </div>
    </div>
  );
};
