import React, { useState } from 'react';
import { Download, Smartphone, X, Check, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-3.5 rounded-2xl shadow-md border border-teal-800 flex items-center justify-between gap-3 animate-in slide-in-from-top-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Pasang di HP Android</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">
                PWA / APK
              </span>
            </div>
            <p className="text-[11px] text-teal-200/90 leading-tight mt-0.5">
              Akses cepat tanpa browser & bekerja offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Pasang
            </button>
          ) : (
            <button
              onClick={() => setShowAndroidGuide(true)}
              className="px-2.5 py-1.5 rounded-xl bg-teal-800/80 hover:bg-teal-700 text-white text-[11px] font-semibold flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Cara Pasang
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-teal-300/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Android 10+ Installation Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl z-10 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              Pasang di HP Android 10+
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Ikuti langkah mudah ini untuk menjadikan aplikasi ini seperti aplikasi native Android:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Buka menu titik tiga (<strong>⋮</strong>) di pojok kanan atas browser Google Chrome di HP kamu.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Ketuk <strong>"Instal"</strong>. Ikon TabungKu akan langsung muncul di beranda HP Android kamu dan bisa dibuka tanpa browser!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
