import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import { routes } from "@/routes";
import { Bell, Search, Plus, CheckCircle, XCircle, X } from "lucide-react";
import {
  STORE_PAGE_LIMIT,
  fetchStorePage,
  parseStoreStatus,
  subscribeStore,
  type StoreListData,
  type StoreStatusFilter,
} from "@/services/adminApi";
import type { StoreResponse } from "@packages/contract";
import { dataPrice } from "@packages/contract";
import { config } from "@/config";

function formatDuration(time: number, bonus?: number): string {
  const days = Math.round((time + (bonus ?? 0)) / 86_400);
  if (days >= 365) return `${Math.round(days / 365)} Tahun`;
  if (days >= 30) return `${Math.round(days / 30)} Bulan`;
  return `${days} Hari`;
}

function formatPrice(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatExpiresAt(subs: StoreResponse["subs"]): string {
  const now = new Date();
  const active = subs?.find((s) => new Date(s.expiresAt) > now);
  if (!active) return "Tidak aktif";
  return `Aktif hingga ${new Date(active.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
}

const { ACCESS_TOKEN_KEY, USER_DATA_KEY } = config;

const STATUS_FILTERS: { label: string; value: StoreStatusFilter | undefined }[] = [
  { label: "Semua", value: undefined },
  { label: "Aktif", value: "active" },
  { label: "Expired", value: "expired" },
];

const STATUS_LABEL: Record<StoreStatusFilter, string> = { active: "aktif", expired: "expired" };

function getUserData() {
  try {
    const raw = sessionStorage.getItem(USER_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { id: string; name: string; email: string };
  } catch {
    return null;
  }
}

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
  if (store.subs?.find((s) => s.isTrial)) return "trial";
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
  const loaderData = useLoaderData() as StoreListData;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const status = parseStoreStatus(searchParams.get("status"));
  const [search, setSearch] = useState(q);
  const loading = navigation.state === "loading";

  // loader memuat halaman pertama; "Lihat lebih banyak" meng-append halaman berikutnya ke state ini
  const [stores, setStores] = useState<StoreListData>(loaderData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  useEffect(() => {
    setStores(loaderData);
    setLoadMoreError(null);
  }, [loaderData]);
  const user = getUserData();
  const displayName = user?.name ?? "Admin";
  const avatarInitials = getInitials(displayName);

  const now = new Date();
  const activeCount = stores.data.filter((s) => s.subs?.some((sub) => new Date(sub.expiresAt) > now)).length;
  const trialCount = stores.data.filter((s) => getSubStatus(s) === "trial").length;

  // Subscribe modal state
  const [modalStore, setModalStore] = useState<StoreResponse | null>(null);
  const [selectedPkg, setSelectedPkg] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [subResult, setSubResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleOpenModal = (store: StoreResponse) => {
    setModalStore(store);
    setSelectedPkg(3);
    setSubResult(null);
  };

  const handleCloseModal = () => {
    setModalStore(null);
    setSubResult(null);
  };

  const handleSubscribe = async () => {
    if (!modalStore) return;

    setSubmitting(true);
    setSubResult(null);
    try {
      const result = await subscribeStore(modalStore.id, selectedPkg);
      const exp = new Date(result.subscription.expiresAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setSubResult({ ok: true, msg: `Subscription berhasil! Aktif hingga ${exp}.` });
    } catch (err) {
      setSubResult({ ok: false, msg: err instanceof Error ? err.message : "Gagal menambah subscription" });
    } finally {
      setSubmitting(false);
    }
  };

  const applyQuery = (next: { q?: string; status?: StoreStatusFilter }) => {
    const params: Record<string, string> = {};
    if (next.q) params.q = next.q;
    if (next.status) params.status = next.status;
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyQuery({ q: search.trim(), status });
  };

  const handleClearSearch = () => {
    setSearch("");
    applyQuery({ status });
  };

  const handleStatusChange = (next: StoreStatusFilter | undefined) => applyQuery({ q, status: next });

  const handleLoadMore = async () => {
    const nextOffset = (stores.page?.offset ?? 0) + (stores.page?.limit ?? STORE_PAGE_LIMIT);

    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const next = await fetchStorePage({ q: q || undefined, status, offset: nextOffset });
      setStores((prev) => {
        // buang duplikat jika ada toko baru masuk di antara dua request
        const seen = new Set(prev.data.map((s) => s.id));
        return { data: [...prev.data, ...next.data.filter((s) => !seen.has(s.id))], page: next.page };
      });
    } catch (err) {
      // fetchStorePage melempar redirect (Response 3xx) saat sesi habis
      if (err instanceof Response && err.status >= 300 && err.status < 400) {
        navigate(routes.authLogin);
        return;
      }
      setLoadMoreError("Gagal memuat toko berikutnya. Coba lagi.");
    } finally {
      setLoadingMore(false);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
    navigate(routes.authLogin);
  };

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">Selamat pagi,</p>
          <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
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
            <span className="text-white text-xs font-bold">{avatarInitials}</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-5 flex gap-3 pb-1 outline">
        <div className="flex-1 bg-indigo-500 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75">Toko Aktif</p>
          <p className="text-3xl font-bold mt-1">{activeCount}</p>
          <p className="text-xs opacity-70 mt-1">+0 minggu ini</p>
        </div>
        <div className="flex-1 bg-slate-800 rounded-2xl p-4 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-75">Dalam Trial</p>
          <p className="text-3xl font-bold mt-1">{trialCount}</p>
          <p className="text-xs opacity-70 mt-1">0 segera habis</p>
        </div>
        {/* <div className="shrink-0 w-35 bg-white rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pendapatan</p>
          <p className="text-2xl font-bold mt-1 text-slate-900">Rp 4.2jt</p>
          <p className="text-xs text-slate-400 mt-1">30 hari</p>
        </div> */}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="px-5 mt-4 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-300 shadow-sm outline-none"
            placeholder="Cari nama toko..."
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 rounded-2xl text-sm font-semibold hover:bg-indigo-600 transition-colors shrink-0"
        >
          Cari
        </button>
      </form>

      {/* Filter status */}
      <div className="px-5 mt-3 flex gap-2">
        {STATUS_FILTERS.map((f) => {
          const selected = status === f.value;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => handleStatusChange(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selected ? "bg-slate-900 text-white" : "bg-white text-slate-500 shadow-sm hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
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
            {q
              ? `Tidak ada toko${status ? ` ${STATUS_LABEL[status]}` : ""} untuk "${q}"`
              : status
                ? `Tidak ada toko ${STATUS_LABEL[status]}.`
                : "Belum ada toko terdaftar."}
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

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end">
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
                    <button
                      onClick={() => handleOpenModal(store)}
                      className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                      title="Tambah subscription"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loadMoreError && <p className="mt-3 text-xs text-center text-red-500">{loadMoreError}</p>}

        {!loading && stores.page?.hasNext && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full mt-3 py-3 text-sm text-indigo-500 font-medium text-center disabled:opacity-50"
          >
            {loadingMore ? "Memuat..." : "Lihat lebih banyak"}
          </button>
        )}
      </div>

      {/* Subscribe Modal */}
      {modalStore && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-900">Tambah Subscription</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {modalStore.name} · {formatExpiresAt(modalStore.subs)}
            </p>

            {subResult ? (
              <div className="flex flex-col items-center py-4 gap-3">
                {subResult.ok ? (
                  <CheckCircle className="w-12 h-12 text-emerald-500" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-400" />
                )}
                <p className={`text-sm text-center ${subResult.ok ? "text-slate-700" : "text-red-500"}`}>
                  {subResult.msg}
                </p>
                <button
                  onClick={handleCloseModal}
                  className="mt-1 w-full py-3 rounded-2xl bg-slate-800 text-white font-semibold text-sm"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
                  {dataPrice.map((p, idx) => {
                    const selected = selectedPkg === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedPkg(idx)}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-xl border-2 transition-all text-left ${
                          selected ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <span className={`text-sm font-medium ${selected ? "text-indigo-700" : "text-slate-700"}`}>
                          {formatDuration(p.time, p.bonus)}
                        </span>
                        <span className={`text-sm font-bold ${selected ? "text-indigo-600" : "text-slate-600"}`}>
                          {formatPrice(p.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm disabled:opacity-60 hover:bg-indigo-600 transition-colors"
                >
                  {submitting ? "Memproses..." : `Tambah ${formatPrice(dataPrice[selectedPkg]?.price ?? 0)}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
