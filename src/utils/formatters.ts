import { SavingsCategory } from '../types';

export const formatRupiah = (amount: number, withPrefix: boolean = true): string => {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  
  const sign = amount < 0 ? '-' : '';
  return withPrefix ? `${sign}Rp ${formatted}` : `${sign}${formatted}`;
};

export const parseRupiahInput = (value: string): number => {
  const numeric = value.replace(/\D/g, '');
  return numeric ? parseInt(numeric, 10) : 0;
};

export const formatTanggalIndo = (dateStr: string, format: 'lengkap' | 'pendek' | 'hari-tanggal' = 'lengkap'): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const namaBulanPendek = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const hari = namaHari[date.getDay()];
  const tgl = date.getDate();
  const bln = namaBulan[date.getMonth()];
  const blnPendek = namaBulanPendek[date.getMonth()];
  const thn = date.getFullYear();

  if (format === 'pendek') {
    return `${tgl} ${blnPendek} ${thn}`;
  }
  if (format === 'hari-tanggal') {
    return `${hari}, ${tgl} ${blnPendek}`;
  }
  return `${hari}, ${tgl} ${bln} ${thn}`;
};

export const getHariNameIndo = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return namaHari[date.getDay()];
};

export const CATEGORY_META: Record<SavingsCategory, { name: string; color: string; bgLight: string; icon: string }> = {
  uang_jajan: {
    name: 'Sisa Uang Jajan',
    color: '#0d9488', // teal-600
    bgLight: '#ccfbf1',
    icon: 'Coffee',
  },
  sisa_belanja: {
    name: 'Sisa Belanja',
    color: '#0284c7', // sky-600
    bgLight: '#e0f2fe',
    icon: 'ShoppingBag',
  },
  gaji: {
    name: 'Alokasi Gaji',
    color: '#16a34a', // green-600
    bgLight: '#dcfce7',
    icon: 'Briefcase',
  },
  bonus_thr: {
    name: 'Bonus / THR',
    color: '#d97706', // amber-600
    bgLight: '#fef3c7',
    icon: 'Gift',
  },
  penjualan: {
    name: 'Hasil Jualan / Usaha',
    color: '#9333ea', // purple-600
    bgLight: '#f3e8ff',
    icon: 'TrendingUp',
  },
  celengan: {
    name: 'Celengan Koin/Uang',
    color: '#e11d48', // rose-600
    bgLight: '#ffe4e6',
    icon: 'PiggyBank',
  },
  dana_darurat: {
    name: 'Dana Cadangan',
    color: '#4f46e5', // indigo-600
    bgLight: '#e0e7ff',
    icon: 'ShieldCheck',
  },
  lainnya: {
    name: 'Lain-lain',
    color: '#64748b', // slate-500
    bgLight: '#f1f5f9',
    icon: 'Tag',
  },
};

export const triggerAndroidHaptic = (enabled: boolean = true, pattern: number | number[] = 15) => {
  if (!enabled) return;
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore silently if not supported in iframe/browser
    }
  }
};
