import { useEffect, useRef, useState } from 'react';
import { dataPrice } from '@packages/contract';
import { generateQris, checkPayment, type Payment } from '@/services/paymentApi';
import { CheckCircle, XCircle, X } from 'lucide-react';

function formatDuration(time: number, bonus?: number): string {
  const days = Math.round((time + (bonus ?? 0)) / 86_400);
  if (days >= 365) return `${Math.round(days / 365)} Tahun`;
  if (days >= 30) return `${Math.round(days / 30)} Bulan`;
  return `${days} Hari`;
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

type PollStatus = 'idle' | 'polling' | 'paid' | 'expired';

export default function MembershipPage() {
  const [selectedPkg, setSelectedPkg] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (pollStatus !== 'polling' || !payment) return;

    intervalRef.current = setInterval(async () => {
      try {
        const updated = await checkPayment(payment.invoiceId);
        if (updated.status === 'paid') {
          setPollStatus('paid');
          stopPolling();
        } else if (updated.status === 'expired' || updated.status === 'failed') {
          setPollStatus('expired');
          stopPolling();
        }
      } catch {
        // keep polling on transient errors
      }
    }, 3000);

    return stopPolling;
  }, [pollStatus, payment]);

  const handleBayar = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateQris(selectedPkg);
      setPayment(result);
      setPollStatus('polling');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      if (msg.toLowerCase().includes('unauthorized') || msg.includes('401')) {
        setError('Upload file terlebih dahulu untuk mengaktifkan toko.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    stopPolling();
    setPayment(null);
    setPollStatus('idle');
  };

  const pkg = dataPrice[selectedPkg];

  return (
    <div className="max-w-lg mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Pilih Paket</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Perpanjang akses toko Anda dengan pembayaran QRIS.</p>

      <div className="flex flex-col gap-3">
        {dataPrice.map((p, idx) => {
          const total = formatDuration(p.time, p.bonus);
          const hasBonus = !!p.bonus;
          const baseDays = Math.round(p.time / 86_400);
          const bonusDays = p.bonus ? Math.round(p.bonus / 86_400) : 0;
          const selected = selectedPkg === idx;

          return (
            <button
              key={idx}
              onClick={() => setSelectedPkg(idx)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
                selected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${selected ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {total}
                  {hasBonus && (
                    <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      +{bonusDays} hari bonus
                    </span>
                  )}
                </p>
                {hasBonus && (
                  <p className="text-xs text-slate-400 mt-0.5">{baseDays} hari + {bonusDays} hari gratis</p>
                )}
              </div>
              <p className={`text-sm font-bold ${selected ? 'text-indigo-600' : 'text-slate-700'}`}>
                {formatPrice(p.price)}
              </p>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        onClick={handleBayar}
        disabled={loading}
        className="w-full mt-6 py-3.5 rounded-2xl bg-indigo-500 text-white font-semibold text-sm disabled:opacity-60 hover:bg-indigo-600 transition-colors"
      >
        {loading ? 'Memproses...' : `Bayar ${pkg ? formatPrice(pkg.price) : ''} dengan QRIS`}
      </button>

      {/* QRIS Modal */}
      {payment && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Scan QRIS</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {pollStatus === 'paid' ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
                <p className="text-base font-semibold text-slate-900">Pembayaran Berhasil!</p>
                <p className="text-sm text-slate-500 text-center">Subscription toko Anda sudah diperbarui.</p>
                <button
                  onClick={handleCloseModal}
                  className="mt-2 w-full py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-sm"
                >
                  Selesai
                </button>
              </div>
            ) : pollStatus === 'expired' ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <XCircle className="w-16 h-16 text-red-400" />
                <p className="text-base font-semibold text-slate-900">Pembayaran Gagal</p>
                <p className="text-sm text-slate-500 text-center">QRIS kedaluwarsa atau pembayaran dibatalkan.</p>
                <button
                  onClick={handleCloseModal}
                  className="mt-2 w-full py-3 rounded-2xl bg-slate-800 text-white font-semibold text-sm"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                {payment.qrisUrl ? (
                  <img
                    src={payment.qrisUrl}
                    alt="QRIS"
                    className="w-full rounded-2xl border border-slate-100"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-2xl bg-slate-100 flex items-center justify-center">
                    <p className="text-sm text-slate-400">Memuat QR...</p>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-slate-900">{formatPrice(payment.amount)}</span>
                </div>
                <p className="text-xs text-slate-400 text-center mt-3 animate-pulse">
                  Menunggu pembayaran...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
