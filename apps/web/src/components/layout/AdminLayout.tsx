import { routes } from "@/routes";
import { getCurrentUser } from "@/lib/session";
import { Store, User, Users } from "lucide-react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";

const AdminLayout = () => {
  const location = useLocation();
  const isSuperadmin = getCurrentUser()?.role === "superadmin";

  return (
    <div className="min-h-svh bg-[#EDF0F8]">
      <div className="max-w-sm md:max-w-6xl mx-auto pb-20 md:pb-10">
        <Outlet />

        {/* Bottom Tab Bar (Mobile) / Floating Nav (Desktop) */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="max-w-sm md:max-w-md mx-auto bg-white/95 backdrop-blur border border-slate-100/80 shadow-lg md:rounded-2xl md:mb-4 px-4 py-3 flex items-center justify-around">
            <Link
              to={routes.dashboard}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 transition-colors ${location.pathname === routes.dashboard ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Store className="w-4 h-4" />
              <span className="text-xs font-semibold">Toko</span>
            </Link>

            {isSuperadmin && (
              <Link
                to={routes.adminUsers}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2 transition-colors ${location.pathname === routes.adminUsers ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold">Users</span>
              </Link>
            )}

            <Link
              to={routes.profile}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 transition-colors ${location.pathname === routes.profile ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <User className="w-4 h-4" />
              <span className="text-xs font-semibold">Saya</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;