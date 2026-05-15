import { useState, useMemo } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { routes } from "@/router";
import type { Summary, Data } from "@packages/contract";
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, X, Search } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

type Mode = "QRIS" | "Tunai" | "Debit";

// Deterministic mock — payment mode not available from API
function mockMode(billNo: string): Mode {
  const hash = billNo.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (["QRIS", "Tunai", "Debit"] as Mode[])[hash % 3];
}

function extractKasir(header: string): string {
  const match = header.match(/[Kk]asir[:\s]+([A-Za-z]+)/);
  return match?.[1] ?? "—";
}

function ModeBadge({ mode }: { mode: Mode }) {
  const styles: Record<Mode, string> = {
    QRIS: "bg-slate-800 text-white",
    Tunai: "bg-slate-100 text-slate-600 border border-slate-200",
    Debit: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[mode]}`}>{mode}</span>;
}

const DESKTOP_PAGE_SIZE = 15;
const MOBILE_PAGE_SIZE = 10;
type FilterTab = "semua" | "member" | "qris" | "tunai";

export default function DetailPage() {
  const summary = useLoaderData() as Summary;

  // Shared state
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("semua");

  // Desktop state
  const [selected, setSelected] = useState<Data | null>(null);
  const [desktopPage, setDesktopPage] = useState(1);

  // Mobile state
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [mobileLimit, setMobileLimit] = useState(MOBILE_PAGE_SIZE);
  // const [showMobileSearch, setShowMobileSearch] = useState(false);

  const filename = sessionStorage.getItem("klerek_upload_filename") ?? null;

  const filtered = useMemo(() => {
    return summary.data.filter((tx) => {
      if (search) {
        const q = search.toLowerCase();
        if (!tx.faktur.bill_no.toLowerCase().includes(q) && !extractKasir(tx.header).toLowerCase().includes(q))
          return false;
      }
      if (filter === "member") return !!tx.member.no_member;
      if (filter === "qris") return mockMode(tx.faktur.bill_no) === "QRIS";
      if (filter === "tunai") return mockMode(tx.faktur.bill_no) === "Tunai";
      return true;
    });
  }, [summary.data, search, filter]);

  const handleFilterChange = (f: FilterTab) => {
    setFilter(f);
    setDesktopPage(1);
    setSelected(null);
    setExpandedBill(null);
    setMobileLimit(MOBILE_PAGE_SIZE);
  };

  // Desktop pagination
  const totalDesktopPages = Math.ceil(filtered.length / DESKTOP_PAGE_SIZE);
  const desktopRows = filtered.slice((desktopPage - 1) * DESKTOP_PAGE_SIZE, desktopPage * DESKTOP_PAGE_SIZE);

  // Mobile items
  const mobileRows = filtered.slice(0, mobileLimit);
  const hasMore = mobileLimit < filtered.length;

  const FILTERS: { key: FilterTab; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "member", label: "Member only" },
    { key: "qris", label: "QRIS" },
    { key: "tunai", label: "Tunai" },
  ];

  return (
    <>
      {/* ── Mobile content ── */}
      <div className="md:hidden flex-1 px-4 pt-5 pb-28 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.data.length} transaksi</h1>
          <p className="text-sm text-slate-400 mt-1">
            {summary.date_tx} · {summary.store_name} {summary.branch_id}
          </p>
        </div>

        {/* Filter pills (horizontal scroll) */}
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

        {/* Accordion cards */}
        <div className="space-y-2">
          {mobileRows.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">Tidak ada transaksi.</p>
          ) : (
            mobileRows.map((tx) => {
              const mode = mockMode(tx.faktur.bill_no);
              const kasir = extractKasir(tx.header);
              const isExpanded = expandedBill === tx.faktur.bill_no;
              const isMember = tx.member !== null;

              return (
                <div key={tx.faktur.bill_no} className="border border-slate-100 rounded-2xl overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-4"
                    onClick={() => setExpandedBill(isExpanded ? null : tx.faktur.bill_no)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400 tabular-nums w-10 shrink-0">{tx.time_tx}</span>
                        <span className="text-base font-bold text-slate-900 tabular-nums">{fmt(tx.cash)}</span>
                        {isMember && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <ModeBadge mode={mode} />
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
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                      {tx.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">× PLU {item.plu}</span>
                          {/* Item price not available — only total cash per transaction */}
                          <span className="text-slate-400">×{item.qty}</span>
                        </div>
                      ))}
                      {tx.member && (
                        <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50">
                          Member: {tx.member.member_name ?? tx.member.no_member}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Load more */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400 mb-3">
            ↑ menampilkan {Math.min(mobileLimit, filtered.length)} dari {filtered.length} transaksi
          </p>
          {hasMore && (
            <button
              onClick={() => setMobileLimit((l) => l + MOBILE_PAGE_SIZE)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Muat lebih banyak
            </button>
          )}
        </div>
      </div>

      {/* ── Desktop content ── */}
      <main className="hidden md:flex flex-col flex-1 max-w-7xl w-full mx-auto px-8 py-7">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
          <Link to={routes.summary} className="hover:text-slate-700 transition-colors">
            Rekap
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">Detail Transaksi</span>
        </div>

        {/* Title */}
        <div className="flex items-baseline gap-3 mb-5">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary.data.length} transaksi</h1>
          <span className="text-slate-400 text-base">
            {filename ? (filename.replace(".zip", "").split("_")[1] ?? summary.date_tx) : summary.date_tx}
          </span>
        </div>

        <div className="flex gap-5 flex-1 min-h-0">
          {/* Table side */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Search + filter */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID, kasir..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDesktopPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 text-sm font-medium">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => handleFilterChange(f.key)}
                    className={`px-3.5 py-1.5 rounded-md transition-colors ${
                      filter === f.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 border border-slate-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[80px_110px_1fr_80px_90px_100px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                {["WAKTU", "ID", "KASIR", "ITEMS", "MODE", "TOTAL"].map((col) => (
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
                    const mode = mockMode(tx.faktur.bill_no);
                    const kasir = extractKasir(tx.header);
                    const isSelected = selected?.faktur.bill_no === tx.faktur.bill_no;
                    return (
                      <div
                        key={tx.faktur.bill_no}
                        onClick={() => setSelected(isSelected ? null : tx)}
                        className={`grid grid-cols-[80px_110px_1fr_80px_90px_100px] gap-3 px-5 py-3.5 cursor-pointer transition-colors items-center border-l-2 ${
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
                        <div>
                          <ModeBadge mode={mode} />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 tabular-nums text-right">
                          {fmt(tx.cash)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400">
                Menampilkan {Math.min((desktopPage - 1) * DESKTOP_PAGE_SIZE + 1, filtered.length)}–
                {Math.min(desktopPage * DESKTOP_PAGE_SIZE, filtered.length)} dari {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDesktopPage((p) => Math.max(1, p - 1))}
                  disabled={desktopPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalDesktopPages, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(desktopPage - 2, totalDesktopPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setDesktopPage(p)}
                      className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
                        p === desktopPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setDesktopPage((p) => Math.min(totalDesktopPages, p + 1))}
                  disabled={desktopPage === totalDesktopPages || totalDesktopPages === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-72 shrink-0 border border-slate-100 rounded-xl p-5 space-y-5 h-fit sticky top-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Transaksi</span>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">
                  {selected.faktur.bill_no} · {selected.time_tx}
                </p>
                <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{fmt(selected.cash)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Kasir</p>
                  <p className="text-sm font-medium text-slate-800">{extractKasir(selected.header)}</p>
                </div>
                <div>
                  {/* NIK kasir not available from API */}
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">NIK</p>
                  <p className="text-sm text-slate-400">—</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Mode</p>
                  <ModeBadge mode={mockMode(selected.faktur.bill_no)} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Member</p>
                  <p className="text-sm font-medium text-slate-800">
                    {selected.member ? (selected.member.member_name ?? selected.member.no_member) : "Tidak"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                  Item ({selected.items.length})
                </p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      {/* Item names not available — API only returns PLU codes */}
                      <span className="text-slate-700">PLU {item.plu}</span>
                      <span className="text-slate-400">×{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">Total bayar</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{fmt(selected.cash)}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
