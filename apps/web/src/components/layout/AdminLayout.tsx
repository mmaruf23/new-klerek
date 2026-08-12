import { routes } from "@/routes";
import { Store, User, Users } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-svh bg-[#EDF0F8]">
      <div className="max-w-sm mx-auto">
        <Outlet />

        {/* Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="max-w-sm mx-auto bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-around">
            <Link
              to={routes.dashboard}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 ${location.pathname === routes.dashboard ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Store className="w-4 h-4" />
              <span className="text-xs font-semibold">Toko</span>
            </Link>
            {/* <button className="flex items-center gap-1.5 px-5 py-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500">Pembayaran</span>
            </button> */}

            <Link
              to={routes.adminUsers}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 ${location.pathname === routes.adminUsers ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">Users</span>
            </Link>

            <Link
              to={routes.profile}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 ${location.pathname === routes.profile ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <User className="w-4 h-4" />
              <span className="text-xs">Saya</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
