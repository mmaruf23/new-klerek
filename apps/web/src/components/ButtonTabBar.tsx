import { AlignJustify, BarChart2 } from "lucide-react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import { routes } from "@/router";

interface ButtonTabBarProps {
  active?: string;
}

const ButtonTabBar: FC<ButtonTabBarProps> = ({ active = "summary" }) => {
  console.log(active);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3 flex gap-2 z-10">
      <Link
        to={routes.summary}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
          active === routes.summary ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        <BarChart2 className="w-4 h-4" />
        Rekap
      </Link>
      <Link
        to={routes.detail}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
          active === routes.detail ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        <AlignJustify className="w-4 h-4" />
        Detail Transaksi
      </Link>
    </div>
  );
};

export default ButtonTabBar;
