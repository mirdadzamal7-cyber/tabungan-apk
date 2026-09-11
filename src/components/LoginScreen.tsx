import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, Sparkles, GraduationCap, AlertCircle, CheckCircle2, Cloud, Database } from 'lucide-react';
import { NasabahUser, AuthSession } from '../types';
import { verifyLogin, ADMIN_CREDENTIALS } from '../utils/storage';
import { triggerAndroidHaptic } from '../utils/formatters';
import { loginWithGoogle } from '../firebase';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      triggerAndroidHaptic(enableVibration, 15);
      const user = await loginWithGoogle();
      if (!user) {
        setIsGoogleLoading(false);
        return;
      }

      // Check if user email is admin or matches bootstrapped admin
      const email = user.email || '';
      const isAdminEmail = email.toLowerCase() === 'mirdadzamal7@gmail.com' || activeRoleTab === 'admin';

      const session: AuthSession = {
        role: isAdminEmail ? 'admin' : 'nasabah',
        username: user.email || 'google_user',
        name: user.displayName || user.email || 'Pengguna Google',
        nasabahId: isAdminEmail ? undefined : (nasabahUsers[0]?.id || 'nsb-1'),
      };

      triggerAndroidHaptic(enableVibration, [20, 30]);
      onLoginSuccess(session);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setErrorMessage(err.message || 'Gagal masuk dengan Akun Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
            <Cloud className="w-3 h-3 text-amber-600" />
            <span>Firebase Cloud Firestore Terhubung</span>
          </div>
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

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-2 bg-white text-[10px] text-slate-400 uppercase font-semibold">
                Atau Firebase Auth
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
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
