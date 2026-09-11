import React, { useState } from 'react';
import { Bell, Clock, Check, X, BellRing, Smartphone } from 'lucide-react';
import { UserPreferences } from '../types';
import { triggerAndroidHaptic } from '../utils/formatters';

interface PengingatModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
}

export const PengingatModal: React.FC<PengingatModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [enabled, setEnabled] = useState(preferences.reminderEnabled);
  const [hour, setHour] = useState(preferences.reminderHour);
  const [minute, setMinute] = useState(preferences.reminderMinute);
  const [notifStatus, setNotifStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifStatus('Izin notifikasi aktif! Pengingat akan dikirim.');
          new Notification('TabungKu Pengingat', {
            body: 'Sudahkah kamu menabung receh atau sisa belanja hari ini? Yuk catat di TabungKu!',
            icon: '/icon.svg',
          });
        } else {
          setNotifStatus('Izin notifikasi dibatasi oleh sistem browser.');
        }
      } catch (e) {
        setNotifStatus('Perangkat mendukung pengingat lokal.');
      }
    } else {
      setNotifStatus('Browser ini tidak mendukung notifikasi langsung.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAndroidHaptic(preferences.enableVibration, 15);
    onSavePreferences({
      ...preferences,
      reminderEnabled: enabled,
      reminderHour: hour,
      reminderMinute: minute,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-3">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Pengingat Nabung Harian</h3>
              <p className="text-[11px] text-slate-500">Bangun kebiasaan menabung rutin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Aktifkan Pengingat</span>
              <span className="text-[10px] text-slate-500">Notifikasi harian otomatis</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
            </label>
          </div>

          {enabled && (
            <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-2">
              <label className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-700" />
                Waktu Pengingat Setiap Hari
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="p-2 bg-white border border-teal-200 rounded-xl text-xs font-bold text-teal-950 flex-1 outline-none"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00 WIB
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shrink-0"
                >
                  Uji Notifikasi
                </button>
              </div>

              {notifStatus && (
                <p className="text-[10px] font-medium text-emerald-700 pt-1">{notifStatus}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              Simpan Pengingat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
