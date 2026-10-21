import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { routes } from "@/routes";
import { useProfileQuery, useLogoutMutation } from "@/features/auth/hooks/useAuth";
import { formatDate, formatRupiah } from "@/utils/format";
import {
  User,
  Copy,
  Check,
  Store,
  LogOut,
  ChevronRight,
  GitBranch,
  CalendarDays,
  BadgeCheck,
  Wallet,
} from "lucide-react";

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

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#EDF0F8] animate-pulse">
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded-lg" />
          <div className="w-12 h-4 bg-slate-200 rounded" />
        </div>
        <div className="w-16 h-4 bg-slate-200 rounded" />
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 space-y-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm space-y-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-5 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 rounded-2xl p-4 h-20" />
            <div className="bg-slate-50 rounded-2xl p-4 h-20" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 bg-slate-200 rounded w-36" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
            <div className="w-5 h-5 bg-slate-200 rounded" />
          </div>
          <div className="space-y-4 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfileQuery();
  const logoutMutation = useLogoutMutation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: routes.authLogin });
      },
    });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#EDF0F8] flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto text-red-600">
            !
          </div>
          <p className="text-sm text-slate-600">
            {error instanceof Error ? error.message : "Gagal memuat profil"}
          </p>
          <button
            onClick={() => navigate({ to: routes.authLogin })}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF0F8]">
      <header className="bg-white shadow-sm h-14 flex items-center justify-between px-6">
        <Link to={routes.home} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">klerek</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{logoutMutation.isPending ? "Keluar..." : "Keluar"}</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-indigo-50"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-indigo-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 truncate">{profile.name}</h1>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[profile.role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                >
                  {ROLE_LABEL[profile.role] ?? profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium">Total Saldo Komisi</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {formatRupiah(profile.totalBalance ?? 0)}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <BadgeCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium">Kode Referral</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 tracking-wider">
                  {profile.referralCode ?? "—"}
                </span>
                {profile.referralCode && (
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                    title="Salin kode"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Toko Terhubung</h2>
              <p className="text-xs text-slate-400">
                {profile.referredStores?.length ?? 0} toko menggunakan kode referral kamu
              </p>
            </div>
            <Store className="w-5 h-5 text-slate-300" />
          </div>

          {!profile.referredStores || profile.referredStores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada toko yang terhubung dengan kode referral Anda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {profile.referredStores.map((st) => (
                <div key={st.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{st.name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      {st.branchId && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          Cabang {st.branchId}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(st.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
