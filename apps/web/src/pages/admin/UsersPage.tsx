import { useState, useEffect } from "react";
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from "react-router-dom";
import { Search, X, ChevronRight, Plus, Minus, Store, Check, ShieldCheck, User as UserIcon } from "lucide-react";
import type { AdminUserItem, AdminUserDetail } from "@packages/contract";
import type { ApiResponse } from "@packages/contract";
import { fetchUserDetail, adjustBalance, updateUserRole } from "@/services/adminUsersApi";
import { config } from "@/config";

function currentViewerRole(): string | null {
  const token = sessionStorage.getItem(config.ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

const ROLE_LABEL: Record<string, string> = { user: "User", admin: "Admin", superadmin: "Superadmin" };
const ROLE_COLOR: Record<string, string> = {
  user: "bg-slate-100 text-slate-600",
  admin: "bg-indigo-100 text-indigo-700",
  superadmin: "bg-amber-100 text-amber-700",
};

function fmt(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function getInitials(name: string) {
  return name
    .split(/[\s—–-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-emerald-500", "bg-orange-400",
  "bg-rose-400", "bg-amber-500", "bg-blue-500", "bg-teal-500", "bg-pink-500",
];
function avatarColor(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type ModalView = "detail" | "adjust";

interface AdjustState {
  type: "credit" | "debit";
  amount: string;
  note: string;
  submitting: boolean;
  error: string | null;
  done: boolean;
}

function UserDetailModal({
  userId,
  onClose,
  onBalanceChanged,
}: {
  userId: string;
  onClose: () => void;
  onBalanceChanged: () => void;
}) {
  const [view, setView] = useState<ModalView>("detail");
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjust, setAdjust] = useState<AdjustState>({
    type: "credit", amount: "", note: "", submitting: false, error: null, done: false,
  });
  const [pendingRole, setPendingRole] = useState<"admin" | "user" | null>(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const isSuperadminViewer = currentViewerRole() === "superadmin";

  useEffect(() => {
    fetchUserDetail(userId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleRoleChange = async () => {
    if (!detail || !pendingRole) return;
    setRoleSubmitting(true);
    setRoleError(null);
    try {
      await updateUserRole(userId, pendingRole);
      setDetail({ ...detail, role: pendingRole });
      setPendingRole(null);
      onBalanceChanged();
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : "Gagal mengubah role");
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(adjust.amount, 10);
    if (!amount || amount <= 0) return;
    setAdjust((s) => ({ ...s, submitting: true, error: null }));
    try {
      await adjustBalance(userId, adjust.type, amount, adjust.note || undefined);
      setAdjust((s) => ({ ...s, done: true, submitting: false }));
      onBalanceChanged();
      if (detail) setDetail({ ...detail, totalBalance: detail.totalBalance + (adjust.type === "credit" ? amount : -amount) });
    } catch (err) {
      setAdjust((s) => ({ ...s, error: err instanceof Error ? err.message : "Gagal", submitting: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {view === "adjust" && (
              <button onClick={() => { setAdjust((s) => ({ ...s, done: false, error: null, amount: "", note: "" })); setView("detail"); }} className="text-slate-400 hover:text-slate-600 mr-1">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            )}
            <h2 className="text-base font-semibold text-slate-900">
              {view === "detail" ? "Detail User" : "Sesuaikan Balance"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {loading && <p className="text-sm text-slate-400 py-6 text-center">Memuat...</p>}

          {!loading && detail && view === "detail" && (
            <div className="space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${avatarColor(detail.id)} rounded-2xl flex items-center justify-center shrink-0`}>
                  <span className="text-white font-bold">{getInitials(detail.name)}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{detail.name}</p>
                  <p className="text-xs text-slate-400">{detail.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLOR[detail.role]}`}>
                    {ROLE_LABEL[detail.role]}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-2xl p-3">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Balance</p>
                  <p className={`text-lg font-extrabold ${detail.totalBalance < 0 ? "text-red-500" : "text-slate-900"}`}>
                    {fmt(detail.totalBalance)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Kode Referral</p>
                  <p className="text-lg font-extrabold text-slate-900 tracking-wider">
                    {detail.referralCode ?? "—"}
                  </p>
                </div>
              </div>

              {/* Referred stores */}
              {detail.referredStores.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                    Toko Referral ({detail.referredStores.length})
                  </p>
                  <div className="space-y-1.5">
                    {detail.referredStores.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium">{s.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{s.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Joined */}
              <p className="text-xs text-slate-400">
                Bergabung {new Date(detail.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              {/* Role management (superadmin only, tidak untuk target superadmin) */}
              {isSuperadminViewer && detail.role !== "superadmin" && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Kelola Role</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => detail.role !== "user" && setPendingRole("user")}
                      disabled={roleSubmitting}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 font-semibold text-sm transition-all disabled:opacity-60 ${detail.role === "user" ? "border-slate-300 bg-slate-100 text-slate-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                    >
                      <UserIcon className="w-4 h-4" /> User
                    </button>
                    <button
                      type="button"
                      onClick={() => detail.role !== "admin" && setPendingRole("admin")}
                      disabled={roleSubmitting}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 font-semibold text-sm transition-all disabled:opacity-60 ${detail.role === "admin" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-500 hover:border-slate-200"}`}
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin
                    </button>
                  </div>

                  {roleError && <p className="text-sm text-red-500 mt-2">{roleError}</p>}

                  {pendingRole && (
                    <div className="mt-3 bg-amber-50 rounded-2xl p-3">
                      <p className="text-xs text-amber-800 mb-2">
                        Ubah role <span className="font-semibold">{detail.name}</span> menjadi{" "}
                        <span className="font-semibold">{ROLE_LABEL[pendingRole]}</span>?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => { setPendingRole(null); setRoleError(null); }}
                          disabled={roleSubmitting}
                          className="py-2 rounded-xl bg-white text-slate-600 font-semibold text-sm border border-slate-200 disabled:opacity-60"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleRoleChange}
                          disabled={roleSubmitting}
                          className="py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors disabled:opacity-60"
                        >
                          {roleSubmitting ? "Memproses..." : "Ya, ubah"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Adjust balance button */}
              <button
                onClick={() => setView("adjust")}
                className="w-full py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors"
              >
                Sesuaikan Balance
              </button>
            </div>
          )}

          {!loading && view === "adjust" && (
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {adjust.done ? (
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-700 text-center font-medium">Balance berhasil disesuaikan</p>
                  <button type="button" onClick={() => { setView("detail"); setAdjust((s) => ({ ...s, done: false, amount: "", note: "" })); }} className="text-sm text-indigo-500 font-medium">
                    Kembali ke detail
                  </button>
                </div>
              ) : (
                <>
                  {/* Type selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjust((s) => ({ ...s, type: "credit" }))}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${adjust.type === "credit" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-500"}`}
                    >
                      <Plus className="w-4 h-4" /> Kredit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjust((s) => ({ ...s, type: "debit" }))}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${adjust.type === "debit" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-100 text-slate-500"}`}
                    >
                      <Minus className="w-4 h-4" /> Debit
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Jumlah (IDR)</label>
                    <input
                      type="number"
                      min={1}
                      value={adjust.amount}
                      onChange={(e) => setAdjust((s) => ({ ...s, amount: e.target.value }))}
                      placeholder="contoh: 50000"
                      required
                      className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Catatan (opsional)</label>
                    <input
                      type="text"
                      value={adjust.note}
                      onChange={(e) => setAdjust((s) => ({ ...s, note: e.target.value }))}
                      placeholder="alasan penyesuaian"
                      maxLength={255}
                      className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  {adjust.error && <p className="text-sm text-red-500">{adjust.error}</p>}

                  <button
                    type="submit"
                    disabled={adjust.submitting || !adjust.amount}
                    className={`w-full py-3 rounded-2xl font-semibold text-sm text-white transition-colors disabled:opacity-60 ${adjust.type === "credit" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-400 hover:bg-red-500"}`}
                  >
                    {adjust.submitting ? "Memproses..." : `${adjust.type === "credit" ? "Tambah" : "Kurangi"} ${adjust.amount ? fmt(parseInt(adjust.amount) || 0) : "Balance"}`}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { data: users, page } = useLoaderData() as { data: AdminUserItem[]; page: ApiResponse["page"] };
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const loading = navigation.state === "loading";
  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(q);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(search ? { q: search } : {});
  };

  const handleLoadMore = () =>
    setSearchParams({ ...(q ? { q } : {}), offset: String(offset + 20) });

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-400 mt-0.5">{page?.total ?? users.length} pengguna terdaftar</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-300 shadow-sm outline-none"
              placeholder="Cari nama atau email..."
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSearchParams({}); }}
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
      </div>

      {/* List */}
      <div className="px-5 pb-28">
        {loading ? (
          <div className="bg-white rounded-2xl py-10 text-center text-sm text-slate-400 shadow-sm">Memuat...</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl py-10 text-center text-sm text-slate-400 shadow-sm">
            {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada user terdaftar."}
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className={`w-11 h-11 ${avatarColor(user.id)} rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_COLOR[user.role]}`}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`text-xs font-semibold ${user.totalBalance > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {fmt(user.totalBalance)}
                  </p>
                  {user.referredStoreCount > 0 && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{user.referredStoreCount} toko</p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {page?.hasNext && (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full mt-3 py-3 text-sm text-indigo-500 font-medium text-center disabled:opacity-50"
          >
            Lihat lebih banyak
          </button>
        )}
      </div>

      {/* Detail modal */}
      {selectedUserId && (
        <UserDetailModal
          key={`${selectedUserId}-${refreshKey}`}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onBalanceChanged={() => { setRefreshKey((k) => k + 1); navigate(0); }}
        />
      )}
    </>
  );
}
