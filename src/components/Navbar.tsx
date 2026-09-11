import React from 'react';
import { Home, BarChart3, Target, History, Plus, Wrench, Users } from 'lucide-react';
import { triggerAndroidHaptic } from '../utils/formatters';

export type NavTab = 'beranda' | 'rekap' | 'nasabah' | 'target' | 'riwayat' | 'alat';

interface NavbarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenDepositModal: () => void;
  enableVibration: boolean;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onOpenDepositModal,
  enableVibration,
  isAdmin = false,
}) => {
  const handleTabClick = (tab: NavTab) => {
    triggerAndroidHaptic(enableVibration, 12);
    onChangeTab(tab);
  };

  const handleFabClick = () => {
    triggerAndroidHaptic(enableVibration, [20, 30]);
    onOpenDepositModal();
  };

  return (
    <nav aria-label="Navigasi Utama" className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none">
      <div className="w-full max-w-[420px] md:max-w-2xl bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] px-2 pt-2 pb-4 pointer-events-auto flex items-center justify-between">
        {/* Beranda Tab */}
        <button
          onClick={() => handleTabClick('beranda')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'beranda'
              ? 'text-teal-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'beranda' ? 'bg-teal-100 text-teal-800 scale-110' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Beranda</span>
        </button>

        {/* Rekap Tab */}
        <button
          onClick={() => handleTabClick('rekap')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'rekap'
              ? 'text-teal-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'rekap' ? 'bg-teal-100 text-teal-800 scale-110' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Rekap</span>
        </button>

        {/* Center Android Floating Action Button (FAB) for "+ Setoran" */}
        <div className="flex-1 flex flex-col items-center -mt-6">
          <button
            onClick={handleFabClick}
            aria-label="Catat Setoran Baru"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 text-white shadow-lg shadow-teal-700/30 flex items-center justify-center hover:scale-105 active:scale-95 transition transform border-4 border-white ring-2 ring-teal-100 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[11px] font-bold text-teal-800 mt-1 tracking-tight">
            + Setor
          </span>
        </div>

        {/* If Admin: show Nasabah Tab (User creation & management) */}
        {isAdmin ? (
          <button
            onClick={() => handleTabClick('nasabah')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'nasabah'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1.5 rounded-full transition-all ${
                activeTab === 'nasabah' ? 'bg-teal-100 text-teal-800 scale-110' : ''
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Nasabah</span>
          </button>
        ) : (
          /* If Siswa: show Target Tab */
          <button
            onClick={() => handleTabClick('target')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
              activeTab === 'target'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1.5 rounded-full transition-all ${
                activeTab === 'target' ? 'bg-teal-100 text-teal-800 scale-110' : ''
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">Target</span>
          </button>
        )}

        {/* Riwayat Tab */}
        <button
          onClick={() => handleTabClick('riwayat')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'riwayat'
              ? 'text-teal-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'riwayat' ? 'bg-teal-100 text-teal-800 scale-110' : ''
            }`}
          >
            <History className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Riwayat</span>
        </button>

        {/* Alat & Ekspor Tab */}
        <button
          onClick={() => handleTabClick('alat')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'alat'
              ? 'text-teal-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-all ${
              activeTab === 'alat' ? 'bg-teal-100 text-teal-800 scale-110' : ''
            }`}
          >
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Alat</span>
        </button>
      </div>
    </nav>
  );
};
