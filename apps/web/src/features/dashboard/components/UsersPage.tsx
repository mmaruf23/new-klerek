import { useState } from "react";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import { Search, X, ChevronRight } from "lucide-react";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { formatRupiah } from "@/utils/format";
import { UserDetailModal } from "./UserDetailModal";
import { useUsersQuery } from "../hooks/useUsers";

export const ROLE_LABEL: Record<string, string> = { user: "User", admin: "Admin", superadmin: "Superadmin" };
export const ROLE_COLOR: Record<string, string> = {
  user: "bg-slate-100 text-slate-600",
  admin: "bg-indigo-100 text-indigo-700",
  superadmin: "bg-amber-100 text-amber-700",
};



function SkeletonUserItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="w-11 h-11 bg-slate-200 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="space-y-1 text-right shrink-0">
        <div className="h-4 bg-slate-200 rounded w-16 ml-auto" />
        <div className="h-3 bg-slate-100 rounded w-10 ml-auto" />
      </div>
    </div>
  );
}



export default function UsersPage() {
  const [searchParams, setSearchParams] = useAppSearchParams();

  const offset = Number(searchParams.get("offset") ?? "0");
  const q = searchParams.get("q") ?? "";

  // const [users, setUsers] = useState<AdminUserItem[]>([]);
  // const [page, setPage] = useState<ApiResponse["page"] | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(q);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {data, error, isLoading: loading} = useUsersQuery({q, offset})
  const {data: users, page} = data;

  // const loadData = async (isAppend = false) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await fetchUsersApi({ offset, q });
  //     setUsers((prev) => (isAppend ? [...prev, ...res.data] : res.data));
  //     setPage(res.page);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Gagal memuat data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   setSearch(q);
  //   loadData(offset > 0);
  // }, [offset, q]);

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    setSearchParams(search ? { q: search } : {});
  };

  const handleLoadMore = () => {
    setSearchParams({ ...(q ? { q } : {}), offset: String(offset + 20) });
  };

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        {/* <p className="text-sm text-slate-400 mt-0.5">{page?.total ?? users.length} pengguna terdaftar</p> */}
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
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                }}
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
        {error ? (
          <div className="bg-white rounded-2xl py-8 text-center text-sm text-red-500 shadow-sm px-4">{error.message}</div>
        ) : loading && users.length === 0 ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonUserItem key={i} />
            ))}
          </div>
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
                <div
                  className={`w-11 h-11 ${getAvatarColor(user.id)} rounded-xl flex items-center justify-center shrink-0`}
                >
                  <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <span
                      className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_COLOR[user.role]}`}
                    >
                      {ROLE_LABEL[user.role]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`text-xs font-semibold ${user.totalBalance > 0 ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {formatRupiah(user.totalBalance)}
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
            {loading ? "Memuat..." : "Lihat lebih banyak"}
          </button>
        )}
      </div>

      {/* Detail modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onBalanceChanged={() => {}}
        />
      )}
    </>
  );
}
