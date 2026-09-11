import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, Sparkles, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NasabahUser, AuthSession } from '../types';
import { verifyLogin, ADMIN_CREDENTIALS } from '../utils/storage';
import { triggerAndroidHaptic } from '../utils/formatters';

interface LoginScreenProps {
  nasabahUsers: NasabahUser[];
  onLoginSuccess: (session: AuthSession) => void;
  enableVibration: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  nasabahUsers,
  onLoginSuccess,
  enableVibration,
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<'nasabah' | 'admin'>('nasabah');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Silakan isi username dan password.');
      return;
    }

    const result = verifyLogin(username, password, nasabahUsers);
    if (result.success && result.session) {
      triggerAndroidHaptic(enableVibration, [20, 30]);
      onLoginSuccess(result.session);
    } else {
      triggerAndroidHaptic(enableVibration, [60, 40, 60]);
      setErrorMessage(result.message || 'Username atau password salah.');
    }
  };

  const handleQuickLogin = (u: string, p: string, role: 'nasabah' | 'admin') => {
    setActiveRoleTab(role);
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    triggerAndroidHaptic(enableVibration, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Islamic Geometric Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-4">
        {/* Brand Logo & Header Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl text-center">
          <div className="relative inline-block mx-auto mb-2">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-2 border-sky-300/40 mx-auto bg-sky-50 p-1">
              <img
                src="/logo.jpg"
                alt="Logo Tabungan Berkah SDN Margawangi"
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-slate-900 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight">
            TABUNGAN BERKAH
          </h1>
          <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            SDN MARGAWANGI
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Sistem Rekap Tabungan Siswa & Kas Sekolah
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('nasabah');
              setUsername('');
              setPassword('');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeRoleTab === 'nasabah'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Masuk Nasabah (Siswa)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('admin');
              setUsername('admin');
              setPassword('');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
              activeRoleTab === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Masuk Admin
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              {activeRoleTab === 'admin' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Akses Admin / Guru Pengelola
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-sky-600" />
                  Masuk Akun Nasabah Siswa
                </>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {activeRoleTab === 'admin'
                ? 'Kelola data siswa, pembuatan user nasabah, dan rekap sekolah'
                : 'Lihat saldo, rekap tabungan harian, dan celengan impian'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeRoleTab === 'admin' ? 'admin' : 'Contoh: ahmad, siti, budi'}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-sky-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-sky-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 ${
                activeRoleTab === 'admin'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              }`}
            >
              Masuk Sekarang →
            </button>
          </form>

          {/* Quick Login Helper Chips for Demo */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Akun Uji Coba Cepat:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password, 'admin')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition"
              >
                <span className="text-[10px] font-bold text-emerald-800 block">🔑 Akun Admin</span>
                <span className="text-[10px] text-emerald-600">admin / Tahubulat12</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ahmad', '123456', 'nasabah')}
                className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition"
              >
                <span className="text-[10px] font-bold text-sky-800 block">👨‍🎓 Ahmad (4A)</span>
                <span className="text-[10px] text-sky-600">ahmad / 123456</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('siti', '123456', 'nasabah')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition"
              >
                <span className="text-[10px] font-bold text-purple-800 block">👩‍🎓 Siti (3B)</span>
                <span className="text-[10px] text-purple-600">siti / 123456</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('budi', '123456', 'nasabah')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition"
              >
                <span className="text-[10px] font-bold text-amber-800 block">👨‍🎓 Budi (5A)</span>
                <span className="text-[10px] text-amber-600">budi / 123456</span>
              </button>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-400">
              * Akun nasabah siswa baru dibuat dan dikelola oleh Admin SDN Margawangi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
