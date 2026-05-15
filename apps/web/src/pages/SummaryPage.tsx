import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { routes } from "@/router";
import type { Summary } from "@packages/contract";
import { ChevronRight, Download, CalendarDays, Users, Receipt, Package } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

function fmtDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(d);
  const date = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  return `${date} · ${day}`;
}

export default function SummaryPage() {
  const summary = useLoaderData() as Summary;
  const navigate = useNavigate();

  const filename = sessionStorage.getItem("klerek_upload_filename") ?? null;

  const totalPenjualan = summary.data.reduce((s, tx) => s + tx.cash, 0);
  const totalTransaksi = summary.data.length;
  const memberCount = summary.data.filter((tx) => !!tx.member.no_member).length;
  const memberPct = totalTransaksi > 0 ? ((memberCount / totalTransaksi) * 100).toFixed(1) : "0";
  const avgTx = totalTransaksi > 0 ? Math.round(totalPenjualan / totalTransaksi) : 0;
  const totalItems = summary.data.reduce((s, tx) => s + tx.items.reduce((si, item) => si + item.qty, 0), 0);
  const uniqueSKU = new Set(summary.data.flatMap((tx) => tx.items.map((i) => i.plu))).size;

  const pluMap = new Map<number, number>();
  summary.data.forEach((tx) =>
    tx.items.forEach((item) => pluMap.set(item.plu, (pluMap.get(item.plu) ?? 0) + item.qty)),
  );
  const topItems = [...pluMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxQty = topItems[0]?.[1] ?? 1;

  return (
    <>
      {/* Mobile content */}
      <div className="md:hidden flex-1 px-5 py-5 pb-28 space-y-4">
        {/* Store info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Membership aktif · 9 hari lagi
            </span>
          </div>
          <h1 className="text-[2rem] font-extrabold text-slate-900 leading-tight">{summary.store_name}</h1>
          {summary.branch_id && <p className="text-xl text-slate-400 font-light">{summary.branch_id}</p>}
          <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
            <CalendarDays className="w-4 h-4" />
            <span>{fmtDateFull(summary.date_tx)}</span>
          </div>
        </div>

        {/* Total Penjualan */}
        <div className="bg-indigo-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold tracking-[0.12em] text-indigo-300 uppercase mb-2">Total Penjualan</p>
          <p className="text-3xl font-extrabold text-white tabular-nums">{fmt(totalPenjualan)}</p>
          <p className="text-sm text-indigo-300 mt-1">{totalTransaksi} transaksi</p>
        </div>

        {/* 2x2 stat grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Users className="w-3.5 h-3.5" />,
              label: "Member",
              value: memberCount,
              sub: `${memberPct}% dari total`,
            },
            {
              icon: <Receipt className="w-3.5 h-3.5" />,
              label: "Rata-rata",
              value: `Rp ${avgTx >= 1000 ? `${(avgTx / 1000).toFixed(1)}K` : avgTx}`,
              sub: "per transaksi",
            },
            {
              icon: <Package className="w-3.5 h-3.5" />,
              label: "Item Terjual",
              value: totalItems,
              sub: `dari ${uniqueSKU} SKU`,
            },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                {s.icon}
                {s.label}
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop content */}
      <main className="hidden md:flex flex-col flex-1 max-w-5xl w-full mx-auto px-8 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Link to={routes.home} className="hover:text-slate-700 transition-colors">
            Upload
          </Link>
          {filename && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{filename}</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">Rekap</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Membership aktif
              </span>
              <span className="text-sm text-slate-400">{fmtDateFull(summary.date_tx)}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {summary.store_name}
              {summary.branch_id && <span className="text-slate-400 font-light"> · {summary.branch_id}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Ekspor PDF
            </button>
            <button
              onClick={() => navigate(routes.home)}
              className="flex items-center gap-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload baru
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-indigo-800 rounded-2xl p-5 flex flex-col justify-between min-h-35">
            <div>
              <p className="text-xs font-bold tracking-widest text-indigo-300 uppercase mb-3">Total Penjualan</p>
              <p className="text-2xl font-extrabold text-white leading-tight tabular-nums">{fmt(totalPenjualan)}</p>
              <p className="text-sm text-indigo-300 mt-1">{totalTransaksi} transaksi</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-35 shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Transaksi Member</p>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{memberCount}</p>
              <p className="text-sm text-slate-400 mt-1">{memberPct}% dari total</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-35 shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Rata-rata</p>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{fmt(avgTx)}</p>
              <p className="text-sm text-slate-400 mt-1">per transaksi</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-35 shadow-sm">
            <div>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Item Terjual</p>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalItems}</p>
              <p className="text-sm text-slate-400 mt-1">dari {uniqueSKU} SKU</p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-[3fr_2fr] gap-4">
          {/* Top items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-slate-800">Top item</h2>
              <Link
                to={routes.detail}
                className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5"
              >
                Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {topItems.length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada data item.</p>
            ) : (
              <div className="space-y-3.5">
                {topItems.map(([plu, qty], idx) => (
                  <div key={plu} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-4 text-right shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700 truncate">PLU {plu}</span>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">×{qty}</span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placeholder: ringkasan faktur */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-800">Ringkasan</h2>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total faktur</span>
              <span className="font-semibold text-slate-900">{totalTransaksi}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Transaksi member</span>
              <span className="font-semibold text-slate-900">{memberCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total item terjual</span>
              <span className="font-semibold text-slate-900">{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rata-rata per transaksi</span>
              <span className="font-semibold text-slate-900">{fmt(avgTx)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total penjualan</span>
              <span className="font-bold text-indigo-700">{fmt(totalPenjualan)}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
