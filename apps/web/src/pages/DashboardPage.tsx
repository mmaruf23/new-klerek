import { useLoaderData, useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import { Bell, Search, SlidersHorizontal, Store, CreditCard, User } from "lucide-react";
import { type StoreListData } from "@/services/adminApi";
import type { StoreResponse } from "@packages/contract";
import { config } from "@/config";

const { ACCESS_TOKEN_KEY, STORE_PAGE_LIMIT } = config;

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-400",
  "bg-rose-400",
  "bg-amber-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-pink-500",
];

// dummy data for fields not yet returned by API
const DUMMY_TX = [184, 64, 412, 0, 91, 23, 156, 307, 55, 228];
const DUMMY_UPLOAD = [
  "2 menit lalu",
  "27 menit lalu",
  "1 jam lalu",
  "3 jam lalu",
  "kemarin",
  "2 hari lalu",
  "3 hari lalu",
  "seminggu lalu",
  "10 menit lalu",
  "5 jam lalu",
];

function getInitials(name: string): string {
  return name
    .split(/[\s—–-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarColor(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getSubStatus(store: StoreResponse): "aktif" | "trial" | "habis" {
  const now = new Date();
  const activeSub = store.subs?.find((s) => new Date(s.expiresAt) > now);
  if (!activeSub) return "habis";
  const duration = new Date(activeSub.expiresAt).getTime() - new Date(activeSub.createdAt).getTime();
  const days = duration / (1000 * 60 * 60 * 24);
  if (days <= 7 && store.subs?.length === 1) return "trial";
  return "aktif";
}

function getSubLabel(subs: StoreResponse["subs"]): string {
  const now = new Date();
  const activeSub = subs?.find((s) => new Date(s.expiresAt) > now);
  if (!activeSub) return "Habis";
  const duration = new Date(activeSub.expiresAt).getTime() - new Date(activeSub.createdAt).getTime();
  const days = Math.round(duration / (1000 * 60 * 60 * 24));
  if (days <= 7) return "Trial";
  if (days <= 31) return "Bulanan";
  if (days <= 93) return "3 Bulan";
  if (days <= 186) return "6 Bulan";
  return "Tahunan";
}

export default function DashboardPage() {
  const stores = useLoaderData() as StoreListData;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const offset = Number(searchParams.get("offset") ?? "0");
  const loading = navigation.state === "loading";

  const now = new Date();
  const activeCount = stores.data.filter((s) => s.subs?.some((sub) => new Date(sub.expiresAt) > now)).length;
  const trialCount = stores.data.filter((s) => getSubStatus(s) === "trial").length;

  const handleLoadMore = () => navigate(`?offset=${offset + STORE_PAGE_LIMIT}`);
  const handleLogout = () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#EDF0F8]">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">Selamat pagi,</p>
            <h1 className="text-2xl font-bold text-slate-900">Admin Klerek</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm relative">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center"
              title="Keluar"
            >
              <span className="text-white text-xs font-bold">AK</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="px-5 flex gap-3 overflow-x-auto pb-1">
          <div className="shrink-0 w-35 bg-indigo-500 rounded-2xl p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75">Toko Aktif</p>
            <p className="text-3xl font-bold mt-1">{activeCount || 147}</p>
            <p className="text-xs opacity-70 mt-1">+8 minggu ini</p>
          </div>
          <div className="shrink-0 w-35 bg-slate-800 rounded-2xl p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75">Dalam Trial</p>
            <p className="text-3xl font-bold mt-1">{trialCount || 23}</p>
            <p className="text-xs opacity-70 mt-1">12 segera habis</p>
          </div>
          <div className="shrink-0 w-35 bg-white rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pendapatan</p>
            <p className="text-2xl font-bold mt-1 text-slate-900">Rp 4.2jt</p>
            <p className="text-xs text-slate-400 mt-1">30 hari</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 mt-4 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 shadow-sm outline-none"
              placeholder="Cari toko, NIK kasir, atau ID..."
            />
          </div>
          <button className="bg-white rounded-2xl px-3.5 flex items-center gap-1.5 text-sm text-slate-600 font-medium shadow-sm shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="px-5 mt-6 pb-28">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Aktivitas Terbaru</h2>
            <button className="text-xs text-indigo-500 font-medium">Lihat semua</button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl py-10 text-center text-sm text-slate-400 shadow-sm">Memuat...</div>
          ) : stores.data.length === 0 ? (
            <div className="bg-white rounded-2xl py-10 text-center text-sm text-slate-400 shadow-sm">
              Belum ada toko terdaftar.
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
              {stores.data.map((store, idx) => {
                const status = getSubStatus(store);
                const initials = getInitials(store.name);
                const avatarColor = getAvatarColor(store.id);
                const subLabel = getSubLabel(store.subs);
                const txCount = DUMMY_TX[idx % DUMMY_TX.length];
                const uploadTime = DUMMY_UPLOAD[idx % DUMMY_UPLOAD.length];

                return (
                  <div key={store.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className={`w-11 h-11 ${avatarColor} rounded-xl flex items-center justify-center shrink-0`}>
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{store.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {subLabel} · upload {uploadTime}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            status === "aktif" ? "bg-emerald-400" : status === "trial" ? "bg-blue-400" : "bg-red-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            status === "aktif"
                              ? "text-emerald-600"
                              : status === "trial"
                                ? "text-blue-600"
                                : "text-red-500"
                          }`}
                        >
                          {status === "aktif" ? "Aktif" : status === "trial" ? "Trial" : "Habis"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5">{txCount} tx</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {stores.hasNext && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full mt-3 py-3 text-sm text-indigo-500 font-medium text-center disabled:opacity-50"
            >
              Lihat lebih banyak
            </button>
          )}
        </div>

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="max-w-sm mx-auto bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-around">
            <button className="flex items-center gap-1.5 bg-slate-900 text-white rounded-full px-5 py-2">
              <Store className="w-4 h-4" />
              <span className="text-xs font-semibold">Toko</span>
            </button>
            <button className="flex items-center gap-1.5 px-5 py-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">Pembayaran</span>
            </button>
            <button className="flex items-center gap-1.5 px-5 py-2">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">Saya</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
