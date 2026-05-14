import { Link, useLocation } from "react-router-dom";
import { Upload } from "lucide-react";

interface NavLinks {
  label: string;
  href: string;
}

const navs: NavLinks[] = [
  { label: "Home", href: "/" },
  { label: "Membership", href: "/membership" },
  { label: "Kontak", href: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const active = navs.find((n) => n.href === location.pathname) ?? navs[0];

  return (
    <nav className="bg-white shadow h-14 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-xs bg-white rotate-45" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">klerek</span>
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm">
          {navs.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className={`font-medium px-3 py-1.5 ${active.href == href ? "bg-gray-100 rounded-lg text-slate-800" : "text-slate-600 "}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Link to="/admin/login" className="text-sm text-slate-600 hover:text-slate-800 transition-colors">
          Admin masuk
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-md shadow-indigo-500"
        >
          <Upload className="w-3.5 h-3.5" />
          Mulai upload
        </Link>
      </div>
    </nav>
  );
}
