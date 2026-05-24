import { useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Check, ArrowLeft, Store } from "lucide-react";
import { routes } from "@/routes";
import { submitReferral } from "@/services/adminApi";

interface SuccessState {
  storeName: string;
  referrerName: string;
}

export default function ReferPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await submitReferral(code.toUpperCase());
      setSuccess({ storeName: data.storeName, referrerName: data.referrerName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#EDF0F8] flex justify-center">
        <div className="w-full max-w-sm flex flex-col min-h-screen">
          <div className="flex items-center px-5 pt-14 pb-2 gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-800 tracking-tight">klerek</span>
          </div>

          <div className="flex-1 px-5 pt-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-7">
              <Check className="w-7 h-7 text-emerald-500" strokeWidth={2.5} />
            </div>

            <h1 className="text-[2rem] font-bold text-slate-900 leading-tight mb-2">Referral tersimpan!</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Toko <span className="font-medium text-slate-700">{success.storeName}</span> sekarang terhubung dengan{" "}
              <span className="font-medium text-slate-700">{success.referrerName}</span> sebagai referrer.
            </p>

            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Toko</p>
                  <p className="text-sm font-semibold text-slate-900">{success.storeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Referrer</p>
                  <p className="text-sm font-semibold text-slate-900">{success.referrerName}</p>
                </div>
              </div>
            </div>

            <Link
              to={routes.summary}
              className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-indigo-200"
            >
              Kembali ke rekap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF0F8] flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-800 tracking-tight">klerek</span>
          </div>
          <Link
            to={routes.summary}
            className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>

        <div className="flex-1 px-5 pt-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-7">
            <Gift className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
          </div>

          <h1 className="text-[2rem] font-bold text-slate-900 leading-tight mb-2">Masukkan referral</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-9">
            Tautkan toko kamu dengan kode referral dari pemilik akun. Referrer akan mendapat komisi 50% dari setiap
            pembayaran langgananmu.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Kode Referral</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="contoh: ABC123"
                maxLength={6}
                required
                className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 shadow-sm outline-none tracking-[0.2em] font-mono uppercase"
              />
              <p className="text-xs text-slate-400">6 karakter — huruf kapital dan angka</p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-base transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200 mt-2"
            >
              {loading ? "Menyimpan..." : "Simpan referral"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 leading-relaxed px-8 pb-10 pt-8">
          Referral hanya bisa diatur satu kali dan tidak bisa diubah.
        </p>
      </div>
    </div>
  );
}
