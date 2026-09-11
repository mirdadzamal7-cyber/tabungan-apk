import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, QrCode, Copy, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { triggerAndroidHaptic } from '../utils/formatters';

interface AndroidQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  enableVibration?: boolean;
}

export const AndroidQrModal: React.FC<AndroidQrModalProps> = ({
  isOpen,
  onClose,
  enableVibration = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Use current live server origin (e.g. ais-dev-...)
  const appUrl =
    typeof window !== 'undefined' && window.location.origin && window.location.origin.includes('run.app')
      ? window.location.origin
      : 'https://ais-dev-yu747hqufq2w2itsaoifmr-193776582718.asia-southeast1.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      triggerAndroidHaptic(enableVibration, 15);
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 mb-2 border border-sky-200">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Buka di HP Android</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan QR code ini dengan kamera HP atau salin tautan langsung
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center my-3">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code Tabungan Berkah"
              className="w-44 h-44 rounded-xl shadow-xs bg-white p-2 border border-slate-100"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
              Memuat QR Code...
            </div>
          )}
          <span className="text-[10px] text-slate-500 mt-2 font-medium flex items-center gap-1">
            <QrCode className="w-3 h-3 text-sky-600" /> Arahkan kamera HP / Google Lens ke sini
          </span>
        </div>

        {/* URL Box & Copy Button */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs">
            <span className="truncate flex-1 font-mono text-[11px] text-slate-600 select-all">
              {appUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Important note */}
        <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-[11px] text-sky-900 leading-relaxed space-y-2">
          <div>
            <strong className="font-bold text-sky-950 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Pasang Seperti Aplikasi APK Asli:
            </strong>
            <p className="text-slate-600 mt-0.5">
              Di Google Chrome HP Anda, ketuk tombol <strong>"Pasang Aplikasi"</strong> di bagian atas layar (atau tekan titik tiga <strong>⋮</strong> &gt; pilih <strong>"Instal Aplikasi" / "Tambahkan ke Layar Utama"</strong>).
            </p>
            <p className="text-slate-600 mt-1">
              Aplikasi akan langsung terpasang di menu HP Android dengan ikon resmi dan berjalan <em>full-screen</em> tanpa perlu download file APK mentah.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition active:scale-98"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
