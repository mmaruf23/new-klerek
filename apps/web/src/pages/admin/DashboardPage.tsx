import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "@/routes";
import {
  Bell,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  X,
  Store as StoreIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  STORE_PAGE_LIMIT,
  fetchStorePage,
  parseStoreStatus,
  subscribeStore,
  type StoreListData,
  type StoreStatusFilter,
} from "@/services/adminApi";
import { dataPrice, type StoreResponse } from "@packages/contract";
import { getCurrentUser } from "@/libs/session";
import { logout } from "@/services/authApi";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { formatDate, formatRupiah } from "@/utils/format";
import {
  formatActiveUntil,
  formatExpiryRelative,
  formatPackageDuration,
  getActiveSub,
  getSubLabel,
  getSubStatus,
} from "@/utils/subscription";
import { config } from "@/config";
import { cn } from "@/libs/utils";

const STATUS_FILTERS: { label: string; value: StoreStatusFilter | undefined }[] = [
  { label: "Semua", value: undefined },
  { label: "Aktif", value: "active" },
  { label: "Expired", value: "expired" },
];

const STATUS_LABEL: Record<StoreStatusFilter, string> = { active: "aktif", expired: "expired" };
const DUMMY_TX = [184, 64, 412, 0, 91, 23, 156, 307, 55, 228];

function SkeletonStoreItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="w-12 md:w-16 h-10 md:h-11 bg-slate-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="space-y-1 text-right shrink-0">
        <div className="h-4 bg-slate-200 rounded w-12 ml-auto" />
        <div className="h-3 bg-slate-100 rounded w-8 ml-auto" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const status = parseStoreStatus(searchParams.get("status"));
  const offset = Number(searchParams.get("offset") ?? "0");
  const [search, setSearch] = useState(q);

  const [stores, setStores] = useState<StoreListData>({ data: [], page: undefined });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStorePage({ q: q || undefined, status, offset });
      setStores(res);
    } catch (err) {
      if (err instanceof Response && err.status >= 300 && err.status < 400) {
        if (config.ENV == "production") navigate(routes.authLogin);
        return;
      }
      setError("Gagal memuat data toko.");
    } finally {
      setLoading(false);
    }
  }, [q, status, offset, navigate]);

  useEffect(() => {
    setSearch(q);
    loadData();
  }, [q, status, offset, loadData]);

  const user = getCurrentUser();
  const displayName = user?.name || "Admin";
  const avatarInitials = getInitials(displayName);

  const activeCount = stores.data.filter((s) => getActiveSub(s.subs)).length;
  const trialCount = stores.data.filter((s) => getSubStatus(s.subs) === "trial").length;

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
      const exp = formatDate(result.subscription.expiresAt);
      setSubResult({ ok: true, msg: `Subscription berhasil! Aktif hingga ${exp}.` });
    } catch (err) {
      setSubResult({ ok: false, msg: err instanceof Error ? err.message : "Gagal menambah subscription" });
    } finally {
      setSubmitting(false);
    }
  };

  const applyQuery = (next: { q?: string; status?: StoreStatusFilter; offset?: number }) => {
    const params: Record<string, string> = {};
    if (next.q) params.q = next.q;
    if (next.status) params.status = next.status;
    if (next.offset && next.offset > 0) params.offset = String(next.offset);
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyQuery({ q: search.trim(), status, offset: 0 });
  };

  const handleClearSearch = () => {
    setSearch("");
    applyQuery({ status, offset: 0 });
  };

  const handleStatusChange = (next: StoreStatusFilter | undefined) => {
    applyQuery({ q, status: next, offset: 0 });
  };

  const handlePageChange = (newOffset: number) => {
    applyQuery({ q, status, offset: newOffset });
  };

  const totalItems = stores.page?.total ?? stores.data.length;
  const limit = stores.page?.limit ?? STORE_PAGE_LIMIT;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  const startItem = totalItems === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + stores.data.length, totalItems);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Non-scrollable Top Content */}
      <div className="shrink-0">
        {/* Header */}
        <div className="px-5 md:px-8 pt-6 md:pt-8 pb-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Selamat pagi,</p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm relative hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full" />
            </button>
            <button
              onClick={async () => {
                await logout();
                navigate(routes.authLogin);
              }}
              className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm hover:bg-indigo-600 transition-colors"
              title="Keluar"
            >
              <span className="text-white text-xs font-bold">{avatarInitials}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-5 md:px-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 my-2">
          <div className="bg-indigo-600 rounded-2xl p-4 md:p-5 text-white shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-200">Toko Aktif</p>
              <p className="text-3xl md:text-4xl font-extrabold mt-2 tabular-nums">{activeCount}</p>
            </div>
            <p className="text-xs text-indigo-200 mt-2">+0 minggu ini</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 md:p-5 text-white shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Dalam Trial</p>
              <p className="text-3xl md:text-4xl font-extrabold mt-2 tabular-nums">{trialCount}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">0 segera habis</p>
          </div>

          <div className="hidden md:flex bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Terdaftar</p>
              <p className="text-4xl font-extrabold mt-2 text-slate-900 tabular-nums">{totalItems}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">Semua outlet & cabang</p>
          </div>
        </div>

        {/* Control Bar */}
        <div className="px-5 md:px-8 mt-4 md:mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex gap-2 order-2 md:order-1 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const selected = status === f.value;
              const disabled = loading && !selected;
              return (
                <button
                  key={f.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleStatusChange(f.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all",
                    selected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50",
                    disabled && "opacity-50 cursor-not-allowed bg-slate-100 text-slate-300 shadow-none",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 order-1 md:order-2 w-full md:w-80">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-indigo-500 transition-colors"
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
              className="bg-indigo-600 text-white px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shrink-0"
            >
              Cari
            </button>
          </form>
        </div>

        <div className="px-5 md:px-8 mt-5 flex items-center justify-between mb-2">
          <h2 className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
            Daftar Toko & Aktivitas
          </h2>
          <span className="text-xs text-slate-400 font-medium">Total: {totalItems} toko</span>
        </div>
      </div>

      {/* Scrollable Table Section Only */}
      <div className="px-5 md:px-8 flex-1 min-h-0 overflow-y-auto">
        {error ? (
          <div className="bg-white rounded-2xl py-8 text-center text-sm text-red-500 border border-slate-100 shadow-sm px-4">
            {error}
          </div>
        ) : loading && stores.data.length === 0 ? (
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonStoreItem key={i} />
            ))}
          </div>
        ) : stores.data.length === 0 ? (
          <div className="bg-white rounded-2xl py-12 text-center text-sm text-slate-400 border border-slate-100 shadow-sm">
            <StoreIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            {q
              ? `Tidak ada toko${status ? ` ${STATUS_LABEL[status]}` : ""} untuk "${q}"`
              : status
                ? `Tidak ada toko ${STATUS_LABEL[status]}.`
                : "Belum ada toko terdaftar."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-[100px_1fr_180px_140px_100px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold tracking-widest text-slate-400 uppercase sticky top-0 z-10">
              <span>ID Outlet</span>
              <span>Nama Toko</span>
              <span>Langganan</span>
              <span>Status & Transaksi</span>
              <span className="text-right">Aksi</span>
            </div>

            <div className="divide-y divide-slate-100">
              {stores.data.map((store, idx) => {
                const subStatus = getSubStatus(store.subs);
                const avatarColor = getAvatarColor(store.id);
                const subLabel = getSubLabel(store.subs);
                const txCount = DUMMY_TX[idx % DUMMY_TX.length];
                const expiryText = formatExpiryRelative(store.subs);

                return (
                  <div
                    key={store.id}
                    className="flex md:grid md:grid-cols-[100px_1fr_180px_140px_100px] items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                  >
                    <div
                      className={`w-14 md:w-16 h-10 ${avatarColor} rounded-xl flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white text-xs md:text-sm font-bold font-mono tracking-wider uppercase">
                        {store.id}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{store.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 md:hidden">
                        {subLabel} · {expiryText}
                      </p>
                    </div>

                    <div className="hidden md:block">
                      <p className="text-xs font-medium text-slate-700">{subLabel}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{expiryText}</p>
                    </div>

                    <div className="flex flex-col items-end md:items-start shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            subStatus === "aktif"
                              ? "bg-emerald-400"
                              : subStatus === "trial"
                                ? "bg-blue-400"
                                : "bg-red-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            subStatus === "aktif"
                              ? "text-emerald-600"
                              : subStatus === "trial"
                                ? "text-blue-600"
                                : "text-red-500"
                          }`}
                        >
                          {subStatus === "aktif" ? "Aktif" : subStatus === "trial" ? "Trial" : "Habis"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5">{txCount} tx</span>
                    </div>

                    <div className="flex justify-end shrink-0">
                      <button
                        onClick={() => handleOpenModal(store)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-semibold"
                        title="Tambah subscription"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Langganan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Pagination Bar */}
      {!loading && totalItems > 0 && (
        <div className="shrink-0 px-5 md:px-8 py-3 bg-[#EDF0F8] border-t border-slate-200/60 flex items-center justify-between pb-20 md:pb-16">
          <span className="text-xs text-slate-400">
            Menampilkan {startItem}–{endItem} dari {totalItems} toko
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(0, offset - limit))}
              disabled={offset === 0 || loading}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(offset + limit)}
              disabled={!stores.page?.hasNext || loading}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Subscribe */}
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
              {modalStore.name} · {formatActiveUntil(modalStore.subs)}
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
                          {formatPackageDuration(p.time, p.bonus)}
                        </span>
                        <span className={`text-sm font-bold ${selected ? "text-indigo-600" : "text-slate-600"}`}>
                          {formatRupiah(p.price)}
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
                  {submitting ? "Memproses..." : `Tambah ${formatRupiah(dataPrice[selectedPkg]?.price ?? 0)}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
