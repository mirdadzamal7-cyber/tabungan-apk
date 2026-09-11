import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Monitor, Download, BellRing, LogOut, ShieldCheck, User } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AuthSession } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTabTitle: string;
  isSimulatedDevice: boolean;
  onToggleSimulatedDevice: () => void;
  onOpenReminderModal: () => void;
  session?: AuthSession | null;
  onLogout?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTabTitle,
  isSimulatedDevice,
  onToggleSimulatedDevice,
  onOpenReminderModal,
  session,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');
  const { isInstallable, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-0 md:py-6 md:px-4">
      {/* Top Utility Bar for Desktop / Device Mode Toggle */}
      <header className="w-full max-w-md md:max-w-2xl flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-xs text-slate-300 md:rounded-t-2xl mb-0 md:mb-3 shadow-lg z-30">
        <div className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-6 h-6 rounded-lg object-cover border border-teal-400/40"
          />
          <span className="font-bold text-slate-100">Tabungan Berkah</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-medium border border-teal-500/20 text-[10px]">
            SDN Margawangi
          </span>
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px]">
              {session.role === 'admin' ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
              ) : (
                <span className="text-sky-300 font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {session.nasabah?.name?.split(' ')[0] || session.username}
                </span>
              )}
            </div>
          )}

          {session && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Keluar / Ganti Akun"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}

          {/* Device Frame Toggle for Desktop Testing */}
          <button
            onClick={onToggleSimulatedDevice}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
            title="Ubah Mode Tampilan"
          >
            {isSimulatedDevice ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-teal-400" />
                <span>Layar Lebar</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span>Simulasi HP</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container: simulated Android Phone or Fluid Mobile-First View */}
      <main
        className={`w-full transition-all duration-300 ${
          isSimulatedDevice
            ? 'max-w-[420px] rounded-[44px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-50 text-slate-900 relative ring-1 ring-slate-700/50'
            : 'max-w-md sm:max-w-xl md:max-w-2xl bg-slate-50 text-slate-900 md:rounded-3xl shadow-2xl overflow-hidden min-h-[92vh]'
        }`}
      >
        {/* Android 10+ Status Bar */}
        <div className="bg-slate-900 text-slate-200 px-4 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-wider select-none relative z-20 border-b border-slate-800/60">
          {/* Time & App Title with mini Logo */}
          <div className="flex items-center gap-2">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-300 bg-teal-950/90 px-1.5 py-0.5 rounded border border-teal-800/40">
              <img src="/logo.jpg" alt="" className="w-3.5 h-3.5 rounded-xs" />
              <span>SDN Margawangi</span>
            </div>
          </div>

          {/* Camera Hole Punch in Simulated Mode */}
          {isSimulatedDevice && (
            <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>
          )}

          {/* Android Status Icons */}
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[9px] font-bold text-slate-400">4G+</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px]">89%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Dynamic App Content Body */}
        <div className="flex flex-col min-h-[80vh] md:min-h-[750px] pb-24 bg-slate-50 text-slate-800 relative">
          {children}
        </div>

        {/* Android 10+ Gesture Navigation Bar */}
        <div className="absolute bottom-1 left-0 right-0 h-4 flex items-center justify-center pointer-events-none z-30">
          <div className="w-32 h-1 rounded-full bg-slate-400/60" />
        </div>
      </main>
    </div>
  );
};
