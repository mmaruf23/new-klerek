import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import type { ProfileResponse } from "@packages/contract";
import { routes } from "@/routes";
import { config } from "@/config";
import { User, Copy, Check, Store, LogOut, ChevronRight, GitBranch, CalendarDays, BadgeCheck, Wallet } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  user: "Pengguna",
  admin: "Admin",
  superadmin: "Super Admin",
};

const ROLE_COLOR: Record<string, string> = {
  user: "bg-indigo-50 text-indigo-700 border-indigo-200",
  admin: "bg-amber-50 text-amber-700 border-amber-200",
  superadmin: "bg-rose-50 text-rose-700 border-rose-200",
};

function fmtCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function ProfilePage() {
  const profile = useLoaderData() as ProfileResponse;
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!profile.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(config.ACCESS_TOKEN_KEY);
    navigate(routes.authLogin);
  };

  return (
    <div className="min-h-screen bg-[#EDF0F8]">
      {/* Top bar */}
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6">
        <Link to={routes.home} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-xs bg-white rotate-45" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">klerek</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-3xl p-7 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-indigo-500" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-slate-900 truncate">{profile.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5 ${ROLE_COLOR[profile.role] ?? ROLE_COLOR.user}`}
                >
                  <BadgeCheck className="w-3 h-3" />
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </span>
              </div>
              <p className="text-sm text-slate-400">@{profile.username}</p>
            </div>
          </div>

          {/* Referral code */}
          {profile.referralCode && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3">Kode Referral</p>
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4">
                <span className="text-2xl font-extrabold text-slate-900 tracking-[0.2em]">{profile.referralCode}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Bagikan kode ini ke toko lain agar tercatat sebagai referral kamu.
              </p>
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="bg-white rounded-3xl p-7 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">Saldo Komisi</p>
              <p className="text-3xl font-extrabold text-slate-900">{fmtCurrency(profile.totalBalance)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Referred stores */}
        <div className="bg-white rounded-3xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Toko yang direferral</h2>
              <p className="text-xs text-slate-400 mt-0.5">{profile.referredStores.length} toko</p>
            </div>
            <Store className="w-5 h-5 text-slate-300" />
          </div>

          {profile.referredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Store className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">Belum ada toko yang menggunakan kode referral kamu.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {profile.referredStores.map((s) => (
                <li key={s.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">{s.id}</span>
                      {s.branchId && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <GitBranch className="w-3 h-3" />
                          {s.branchId}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <CalendarDays className="w-3 h-3" />
                        {fmtDate(s.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
