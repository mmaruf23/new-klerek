import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataPrice } from '@packages/contract';
import type { Summary } from '@packages/contract';
import { generateQris, checkPayment, type Payment } from '@/services/paymentApi';
import { fetchStorePublic } from '@/services/adminApi';
import { ArrowLeft, CheckCircle, Download, Info, QrCode, Search, Zap } from 'lucide-react';

const INFO_SECTIONS = [
  {
    icon: <Info className="w-5 h-5 text-indigo-500" />,
    title: 'Bagaimana akses bekerja?',
    desc: 'Akses melekat ke toko, bukan akun. Selama paket aktif, siapapun yang punya file ekspor toko itu bisa upload & lihat rekap.',
  },
  {
    icon: <Zap className="w-5 h-5 text-indigo-500" />,
    title: 'Toko baru?',
    desc: '2 minggu trial otomatis aktif saat upload pertama. Tidak perlu daftar.',
  },
  {
    icon: <QrCode className="w-5 h-5 text-indigo-500" />,
    title: 'Bayar dengan apa?',
    desc: 'QRIS — satu kode untuk semua bank dan e-wallet. Status terverifikasi otomatis.',
  },
];

const QRIS_SECS = 15 * 60;

function formatPrice(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function perDayPrice(price: number, time: number, bonus = 0) {
  const days = Math.round((time + bonus) / 86_400);
  return `setara Rp ${Math.round(price / days).toLocaleString('id-ID')}/hari`;
}

function totalDaysStr(time: number, bonus = 0) {
  return `untuk ${Math.round((time + bonus) / 86_400)} hari`;
}

function projectedRange(totalDays: number) {
  const start = new Date();
  const end = new Date(start.getTime() + totalDays * 86_400_000);
  const fmt = (d: Date) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function getStoreName(): string {
  try {
    const raw = sessionStorage.getItem('klerek_summary');
    if (!raw) return '';
    return (JSON.parse(raw) as Summary).store_name ?? '';
  } catch {
    return '';
  }
}

function useCountdown(secs: number) {
  const [rem, setRem] = useState(secs);
  useEffect(() => {
    const id = setInterval(() => setRem((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(rem / 60).toString().padStart(2, '0');
  const s = (rem % 60).toString().padStart(2, '0');
  return { str: `${m}:${s}`, m, s };
}

type PollStatus = 'polling' | 'paid' | 'expired';

// ── QRIS full-screen view ────────────────────────────────────────────────────

function QrisView({
  payment,
  pkgIdx,
  storeName,
  pollStatus,
  onBack,
  onCheckNow,
}: {
  payment: Payment;
  pkgIdx: number;
  storeName: string;
  pollStatus: PollStatus | null;
  onBack: () => void;
  onCheckNow: () => void;
}) {
  const { str: countdownStr, m, s } = useCountdown(QRIS_SECS);
  const pkg = dataPrice[pkgIdx];
  const totalDays = pkg ? Math.round((pkg.time + (pkg.bonus ?? 0)) / 86_400) : 0;

  const handleSaveQr = async () => {
    if (!payment.qrisUrl) return;
    try {
      const res = await fetch(payment.qrisUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qris-${payment.invoiceId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(payment.qrisUrl, '_blank');
    }
  };

  const renderQrisCard = () => (
    <div className="bg-white rounded-3xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-red-600 font-black text-lg tracking-tight">QRIS</span>
        <span className="text-[10px] text-slate-400 font-medium tracking-wider">
          SATU QR · SEMUA BANK
        </span>
      </div>

      {payment.qrisUrl ? (
        <img src={payment.qrisUrl} alt="QRIS" className="w-full aspect-square object-contain rounded-xl" />
      ) : (
        <div className="w-full aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
          <p className="text-sm text-slate-400 animate-pulse">Memuat QR...</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
          {payment.invoiceId}
        </p>
        <button
          onClick={handleSaveQr}
          disabled={!payment.qrisUrl}
          className="flex items-center gap-1.5 text-xs text-slate-600 font-medium border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <Download className="w-3 h-3" />
          Simpan
        </button>
      </div>
    </div>
  );

  const resultContent = pollStatus === 'paid' ? (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6 py-12">
      <CheckCircle className="w-20 h-20 text-emerald-400" />
      <h2 className="text-2xl font-bold text-white">Pembayaran Berhasil!</h2>
      <p className="text-white/60 max-w-xs">Subscription toko Anda sudah diperbarui. Selamat berjualan!</p>
      <button
        onClick={onBack}
        className="mt-2 px-8 py-3 rounded-full bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-400 transition-colors"
      >
        Kembali ke Paket
      </button>
    </div>
  ) : pollStatus === 'expired' ? (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6 py-12">
      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
        <span className="text-red-400 text-5xl leading-none">✕</span>
      </div>
      <h2 className="text-2xl font-bold text-white">QRIS Kedaluwarsa</h2>
      <p className="text-white/60 max-w-xs">Silakan pilih paket kembali untuk membuat QRIS baru.</p>
      <button
        onClick={onBack}
        className="mt-2 px-8 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-colors"
      >
        Pilih Ulang Paket
      </button>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1b3e] flex flex-col">
      {/* Desktop navbar */}
      <nav className="hidden md:flex items-center justify-between px-8 py-5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-white text-sm tracking-tight">klerek</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-white/50 hover:text-white cursor-pointer">Upload</span>
          <span className="text-white font-semibold">Harga</span>
          <span className="text-white/50 hover:text-white cursor-pointer">Panduan</span>
          <span className="text-white/50 hover:text-white cursor-pointer">Kontak</span>
        </div>
      </nav>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-center px-5 py-4 shrink-0 relative">
        <button
          onClick={onBack}
          className="absolute left-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <span className="font-semibold text-white text-sm">Pembayaran QRIS</span>
      </div>

      {resultContent ? (
        resultContent
      ) : (
        <>
          {/* Mobile layout */}
          <div className="md:hidden flex-1 overflow-y-auto px-5 pb-32">
            {/* Store + package info */}
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span>Untuk toko: {storeName || 'Toko Anda'}</span>
              </div>
              <p className="text-white/70 text-base font-medium">Paket {pkg?.name}</p>
              <p className="text-white font-bold text-4xl mt-0.5">{pkg ? formatPrice(pkg.price) : ''}</p>
            </div>

            {/* QRIS card */}
            {renderQrisCard()}

            {/* Timer */}
            <div className="flex items-center justify-between mt-5 px-1">
              <p className="text-white/50 text-sm">QR berlaku selama</p>
              <p className="text-white font-bold text-2xl font-mono tracking-[0.2em]">{m} : {s}</p>
            </div>
          </div>

          {/* Mobile sticky CTA */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#0d1b3e] via-[#0d1b3e]/95 to-transparent">
            <button
              onClick={onCheckNow}
              className="w-full py-4 rounded-2xl bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Saya sudah bayar · Cek status
            </button>
            <p className="text-center text-white/40 text-xs mt-2">
              Status diperiksa otomatis tiap 5 detik
            </p>
          </div>

          {/* Desktop two-column layout */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-10 px-16 py-10">
            {/* Left */}
            <div className="w-full max-w-md">
              <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4">
                Konfirmasi Pembayaran
              </p>
              <h1 className="text-5xl font-bold text-white leading-tight mb-8">
                Scan untuk<br />aktifkan akses.
              </h1>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-white">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50 mb-0.5">Untuk toko</p>
                    <p className="font-semibold truncate">{storeName || 'Toko Anda'}</p>
                  </div>
                  <span className="text-xs bg-white/10 text-white/60 px-2.5 py-1 rounded-full shrink-0">
                    Pay-as-you-go
                  </span>
                </div>
                <div className="py-4 border-b border-white/10 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">Paket {pkg?.name}</p>
                    <p className="text-xs text-white/50 mt-0.5">{projectedRange(totalDays)}</p>
                  </div>
                  <p className="font-semibold">{pkg ? formatPrice(pkg.price) : ''}</p>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <p className="text-sm text-white/60">Total bayar</p>
                  <p className="text-xl font-bold">{pkg ? formatPrice(pkg.price) : ''}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-white/40">
                QR berlaku selama{' '}
                <span className="text-white font-semibold font-mono">{countdownStr}</span>
                {' '}· status diperiksa otomatis
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-72">{renderQrisCard()}</div>
              <button
                onClick={onCheckNow}
                className="bg-white text-slate-900 font-semibold text-sm rounded-full px-8 py-3.5 hover:bg-white/90 transition-colors shadow-lg"
              >
                Saya sudah bayar · Cek status
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Package selection view ───────────────────────────────────────────────────

export default function MembershipPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'packages' | 'qris'>('packages');
  const [selectedPkg, setSelectedPkg] = useState(4);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus | null>(null);
  const [resolvedStoreName, setResolvedStoreName] = useState(getStoreName);
  const [storeInput, setStoreInput] = useState('');
  const [storeInputLoading, setStoreInputLoading] = useState(false);
  const [storeInputError, setStoreInputError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  useEffect(() => {
    if (pollStatus !== 'polling' || !payment) return;
    intervalRef.current = setInterval(async () => {
      try {
        const updated = await checkPayment(payment.invoiceId);
        if (updated.status === 'paid') { setPollStatus('paid'); stopPolling(); }
        else if (updated.status === 'expired' || updated.status === 'failed') {
          setPollStatus('expired'); stopPolling();
        }
      } catch { /* keep polling on transient errors */ }
    }, 5000);
    return stopPolling;
  }, [pollStatus, payment]);

  const handleCheckNow = async () => {
    if (!payment) return;
    try {
      const updated = await checkPayment(payment.invoiceId);
      if (updated.status === 'paid') { setPollStatus('paid'); stopPolling(); }
      else if (updated.status === 'expired' || updated.status === 'failed') {
        setPollStatus('expired'); stopPolling();
      }
    } catch { /* ignore */ }
  };

  const handlePilih = async (idx: number) => {
    setLoading(idx);
    setError(null);
    try {
      const result = await generateQris(idx);
      setPayment(result);
      setSelectedPkg(idx);
      setPollStatus('polling');
      setView('qris');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(
        msg.toLowerCase().includes('unauthorized') || msg.includes('401')
          ? 'Upload file terlebih dahulu untuk mengaktifkan toko.'
          : msg,
      );
    } finally {
      setLoading(null);
    }
  };

  const handleLookupStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = storeInput.trim().toUpperCase();
    if (id.length !== 4) { setStoreInputError('ID toko harus 4 karakter'); return; }
    setStoreInputLoading(true);
    setStoreInputError('');
    try {
      const data = await fetchStorePublic(id);
      setResolvedStoreName(data.name);
      setStoreInput('');
    } catch (err) {
      setStoreInputError(err instanceof Error ? err.message : 'Toko tidak ditemukan');
    } finally {
      setStoreInputLoading(false);
    }
  };

  const handleBack = () => {
    stopPolling();
    setPayment(null);
    setPollStatus(null);
    setView('packages');
  };

  if (view === 'qris' && payment) {
    return (
      <QrisView
        payment={payment}
        pkgIdx={selectedPkg}
        storeName={resolvedStoreName}
        pollStatus={pollStatus}
        onBack={handleBack}
        onCheckNow={handleCheckNow}
      />
    );
  }

  return (
    <div className="pb-28 md:pb-0 md:py-16">

      {/* ── Mobile header ── */}
      <div className="md:hidden flex items-center justify-center px-5 pt-2 pb-4 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="font-semibold text-slate-900 text-sm">Pilih Paket</span>
      </div>

      {/* ── Mobile heading + subtitle ── */}
      <div className="md:hidden px-5 mb-5">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bayar sesuai pakai.</h1>
        {resolvedStoreName ? (
          <p className="text-slate-500 text-sm">
            Aktifkan untuk toko{' '}
            <span className="font-semibold text-slate-800">{resolvedStoreName}</span>.{' '}
            Tanpa langganan otomatis.
          </p>
        ) : (
          <p className="text-slate-500 text-sm">Tanpa langganan otomatis.</p>
        )}
      </div>

      {/* ── Mobile store input ── */}
      {!resolvedStoreName && (
        <div className="md:hidden px-5 mb-5">
          <form onSubmit={handleLookupStore} className="flex gap-2">
            <input
              value={storeInput}
              onChange={(e) => { setStoreInput(e.target.value.toUpperCase()); setStoreInputError(''); }}
              maxLength={4}
              placeholder="ID toko (4 karakter)"
              className="flex-1 text-sm font-mono tracking-widest uppercase border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={storeInputLoading || storeInput.length === 0}
              className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 disabled:opacity-40 transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          {storeInputError && <p className="text-xs text-red-500 mt-1.5">{storeInputError}</p>}
        </div>
      )}

      {/* ── Desktop: store badge / input ── */}
      <div className="hidden md:flex justify-center mb-6">
        {resolvedStoreName ? (
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span>▶</span>
            <span>Untuk: {resolvedStoreName}</span>
            <button
              onClick={() => setResolvedStoreName('')}
              className="ml-1 text-indigo-400 hover:text-indigo-600 leading-none"
              title="Ganti toko"
            >
              ×
            </button>
          </div>
        ) : (
          <form onSubmit={handleLookupStore} className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <input
                value={storeInput}
                onChange={(e) => { setStoreInput(e.target.value.toUpperCase()); setStoreInputError(''); }}
                maxLength={4}
                placeholder="ID toko (4 karakter)"
                className="w-44 text-center text-sm font-mono tracking-widest uppercase border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white placeholder:normal-case placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={storeInputLoading || storeInput.length === 0}
                className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 disabled:opacity-40 transition-colors shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            {storeInputError && <p className="text-xs text-red-500">{storeInputError}</p>}
            <p className="text-xs text-slate-400">Masukkan ID toko untuk melihat nama toko</p>
          </form>
        )}
      </div>

      {/* ── Desktop heading ── */}
      <div className="hidden md:block text-center max-w-xl mx-auto mb-12 px-4">
        <h1 className="text-5xl font-bold text-slate-900 mb-3">Bayar sesuai pakai.</h1>
        <p className="text-slate-500 text-base">
          Tanpa langganan otomatis. Aktifkan akses upload untuk satu toko, kapanpun butuh.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 md:max-w-2xl md:mx-auto mb-5">
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 text-center">{error}</p>
        </div>
      )}

      {/* ── Mobile: radio list ── */}
      <div className="md:hidden flex flex-col gap-2 px-5">
        {dataPrice.map((p, idx) => {
          const isSelected = selectedPkg === idx;
          const totalDays = Math.round((p.time + (p.bonus ?? 0)) / 86_400);
          return (
            <button
              key={idx}
              onClick={() => setSelectedPkg(idx)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              {/* Radio indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'border-white bg-white' : 'border-slate-300'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
              </div>

              {/* Name + desc */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {p.name}
                  </span>
                  {p.badge && (
                    <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : p.badge === 'POPULER'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-slate-900 text-white'
                    }`}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {p.desc} · setara Rp {Math.round(p.price / totalDays).toLocaleString('id-ID')}/hari
                </p>
              </div>

              {/* Price + duration */}
              <div className="text-right shrink-0">
                <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  Rp {p.price.toLocaleString('id-ID')}
                </p>
                <p className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  / {totalDays} hari
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile info note */}
      <div className="md:hidden flex items-start gap-2 px-5 mt-5 text-slate-400 text-xs">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Selama paket aktif, siapapun yang pegang file ekspor toko ini bisa upload &amp; lihat rekap.
        </span>
      </div>

      {/* ── Desktop: card scroll ── */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="flex gap-4 px-4 w-max mx-auto snap-x snap-mandatory">
          {dataPrice.map((p, idx) => {
            const isPopular = p.badge === 'POPULER';
            return (
              <div
                key={idx}
                className={`shrink-0 w-44 flex flex-col rounded-3xl p-5 snap-start transition-all ${
                  isPopular
                    ? 'bg-indigo-600 border-2 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-slate-200'
                }`}
              >
                <div className="h-6 flex items-center mb-3">
                  {p.badge && (
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full ${
                      isPopular ? 'bg-white text-indigo-600' : 'bg-slate-900 text-white'
                    }`}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {p.name}
                </p>
                <p className="text-2xl font-bold leading-tight mb-1">{formatPrice(p.price)}</p>
                <p className={`text-[11px] leading-snug ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {totalDaysStr(p.time, p.bonus)}
                </p>
                <p className={`text-[11px] leading-snug ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {perDayPrice(p.price, p.time, p.bonus)}
                </p>
                <p className={`text-xs flex-1 mt-3 ${isPopular ? 'text-indigo-100' : 'text-slate-600'}`}>
                  {p.desc}
                </p>
                <button
                  onClick={() => handlePilih(idx)}
                  disabled={loading !== null}
                  className={`mt-5 w-full py-2.5 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-60 ${
                    isPopular
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-slate-900 text-white hover:bg-slate-700'
                  }`}
                >
                  {loading === idx ? 'Memproses...' : `Pilih ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop info sections */}
      <div className="hidden md:grid max-w-4xl mx-auto mt-16 grid-cols-3 gap-8 px-4">
        {INFO_SECTIONS.map((item) => (
          <div key={item.title}>
            <div className="mb-2">{item.icon}</div>
            <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-white border-t border-slate-100">
        <button
          onClick={() => handlePilih(selectedPkg)}
          disabled={loading !== null}
          className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-60 hover:bg-indigo-600 transition-colors"
        >
          <QrCode className="w-5 h-5" />
          <span>
            {loading !== null
              ? 'Memproses...'
              : `Lanjut bayar — ${formatPrice(dataPrice[selectedPkg]?.price ?? 0)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
