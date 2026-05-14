import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import { Info } from "lucide-react";
import ButtonTabBar from "../ButtonTabBar";

const Layout = () => {
  const location = useLocation();
  return (
    <>
      <div className="min-h-screen bg-white md:bg-[#EDF0F8] flex flex-col">
        {/* ── Desktop navbar ── */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        {/* ── Mobile header ── */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">klerek</span>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Info className="w-4 h-4 text-slate-500" />
          </button>
        </header>
        <Outlet />

        {["/summary", "/detail"].includes(location.pathname) && <ButtonTabBar active={location.pathname} />}
      </div>
    </>
  );
};

export default Layout;
