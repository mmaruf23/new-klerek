import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import type { Summary } from "../types/response";

function extractKasir(header: string | null): string {
  const match = header?.match(/[Kk]asir[:\s]+([A-Za-z]+)/);
  return match?.[1] ?? "—";
}

const DESKTOP_PAGE_SIZE = 15;
const MOBILE_PAGE_SIZE = 10;
type FilterTab = "semua" | "member";

export default function DetailPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("klerek_summary");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    try {
      setSummary(JSON.parse(raw) as Summary);
    } catch {
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("semua");
  const [selected, setSelected] = useState<Summary['data'][number] | null>(null);
  const [desktopPage, setDesktopPage] = useState(1);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [mobileLimit, setMobileLimit] = useState(MOBILE_PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!summary) return [];
    return summary.data.filter((tx) => {
      if (search) {
        const q = search.toLowerCase();
        if (!tx.faktur.bill_no.toLowerCase().includes(q) && !extractKasir(tx.header).toLowerCase().includes(q))
          return false;
      }
      if (filter === "member") return !!tx.member.no_member;
      return true;
    });
  }, [summary, search, filter]);

  if (loading || !summary) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-slate-400 animate-pulse">Memuat detail transaksi...</p>
      </div>
    );
  }

  const handleFilterChange = (f: FilterTab) => {
    setFilter(f);
    setDesktopPage(1);
    setSelected(null);
    setExpandedBill(null);
    setMobileLimit(MOBILE_PAGE_SIZE);
  };

  const totalDesktopPages = Math.ceil(filtered.length / DESKTOP_PAGE_SIZE);
  const desktopRows = filtered.slice((desktopPage - 1) * DESKTOP_PAGE_SIZE, desktopPage * DESKTOP_PAGE_SIZE);
  const mobileRows = filtered.slice(0, mobileLimit);
  const hasMore = mobileLimit < filtered.length;

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "member", label: "Member only" },
  ];

  return (
    <>
      <div className="md:hidden flex-1 px-4 pt-5 pb-28 space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.data.length} transaksi</h1>
          <p className="text-sm text-slate-400 mt-1">
            {summary.date_tx} · {summary.store_name} {summary.branch_id}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === f.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {mobileRows.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Tidak ada transaksi.</p>
          ) : (
            mobileRows.map((tx) => {
              const kasir = extractKasir(tx.header);
              const isExpanded = expandedBill === tx.faktur.bill_no;
              const isMember = Boolean(tx.member?.no_member);

              return (
                <div key={tx.faktur.bill_no} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-4"
                    onClick={() => setExpandedBill(isExpanded ? null : tx.faktur.bill_no)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400 tabular-nums w-10 shrink-0">{tx.time_tx}</span>
                        <span className="text-base font-bold text-slate-900 tabular-nums">{formatRupiah(tx.cash)}</span>
                        {isMember && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 ml-12">
                      {tx.faktur.bill_no} · {tx.items.length} item · {kasir}
                    </p>
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 space-y-2">
                      {isMember && (
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Member</span>
                          <span className="font-semibold text-indigo-600">
                            {tx.member?.member_name || tx.member?.no_member}
                          </span>
                        </div>
                      )}
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        Item ({tx.items.length})
                      </p>
                      <div className="space-y-1">
                        {tx.items.map((it) => (
                          <div key={it.sort_no} className="flex justify-between text-xs text-slate-600">
                            <span>PLU {it.plu}</span>
                            <span className="font-semibold">x{it.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {hasMore && (
          <button
            onClick={() => setMobileLimit((l) => l + MOBILE_PAGE_SIZE)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
          >
            Muat lebih banyak
          </button>
        )}
      </div>

      <div className="hidden md:flex flex-1 max-w-7xl mx-auto w-full px-6 py-6 gap-6">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Detail Transaksi</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {summary.date_tx} · {summary.store_name} ({summary.branch_id}) · {filtered.length} transaksi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kasir / bill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-56"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === f.key
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 border border-slate-100 rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-[80px_110px_1fr_80px_100px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
              {["WAKTU", "ID", "KASIR", "ITEMS", "TOTAL"].map((col) => (
                <span key={col} className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {col}
                </span>
              ))}
            </div>
            <div className="divide-y divide-slate-50">
              {desktopRows.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-12">Tidak ada transaksi.</p>
              ) : (
                desktopRows.map((tx) => {
                  const kasir = extractKasir(tx.header);
                  const isSelected = selected?.faktur.bill_no === tx.faktur.bill_no;
                  return (
                    <div
                      key={tx.faktur.bill_no}
                      onClick={() => setSelected(isSelected ? null : tx)}
                      className={`grid grid-cols-[80px_110px_1fr_80px_100px] gap-3 px-5 py-3.5 cursor-pointer transition-colors items-center border-l-2 ${
                        isSelected ? "bg-indigo-50 border-l-indigo-500" : "hover:bg-slate-50 border-l-transparent"
                      }`}
                    >
                      <span className="text-sm text-slate-500 tabular-nums">{tx.time_tx}</span>
                      <span className="text-sm font-mono text-slate-700">{tx.faktur.no_faktur}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-slate-800 truncate">{kasir}</span>
                        {tx.member.no_member && (
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full shrink-0">
                            Member
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-500">{tx.items.length} item</span>
                      <span className="text-sm font-semibold text-slate-800 tabular-nums text-right">
                        {formatRupiah(tx.cash)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-400">
              Menampilkan {Math.min((desktopPage - 1) * DESKTOP_PAGE_SIZE + 1, filtered.length)}–
              {Math.min(desktopPage * DESKTOP_PAGE_SIZE, filtered.length)} dari {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                disabled={desktopPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-600 font-medium">
                {desktopPage} / {Math.max(1, totalDesktopPages)}
              </span>
              <button
                onClick={() => setDesktopPage((p) => Math.min(totalDesktopPages, p + 1))}
                disabled={desktopPage >= totalDesktopPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {selected && (
          <div className="w-80 bg-white border border-slate-100 rounded-xl p-5 shrink-0 flex flex-col gap-4 self-start shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Detail Bill</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">
                {selected.faktur.bill_no} · {selected.time_tx}
              </p>
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{formatRupiah(selected.cash)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Kasir</p>
                <p className="text-sm font-medium text-slate-800">{extractKasir(selected.header)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Member</p>
                <p className="text-sm font-medium text-slate-800">
                  {selected.member?.no_member ? selected.member.member_name || selected.member.no_member : "Tidak"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                Item ({selected.items.length})
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {selected.items.map((it) => (
                  <div key={it.sort_no} className="flex justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-slate-600">PLU {it.plu}</span>
                    <span className="font-semibold text-slate-800">x{it.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
