import { Link, Outlet } from "@tanstack/react-router";
import Navbar from "../Navbar";
import { AlignJustify, BarChart2, Info } from "lucide-react";
import { useIsActivePath } from "@/hooks/useIsActivePath";

const Layout = () => {
  const activePathSummary = useIsActivePath('/summary');
  const activePathDetail = useIsActivePath('/detail');
  return (
    <>
      <div className="min-h-svh bg-white md:bg-[#EDF0F8] flex flex-col">
        {/* ── Desktop navbar ── */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        {/* ── Mobile header ── */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 1Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">klerek</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Info className="w-4 h-4 text-slate-500" />
          </button>
        </header>
        <Outlet />

        {activePathSummary || activePathDetail && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 flex gap-2 z-10">
            <Link
              to="/summary"
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activePathSummary ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Rekap
            </Link>
            <Link
              to="/detail"
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activePathDetail ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <AlignJustify className="w-4 h-4" />
              Detail Transaksi
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
