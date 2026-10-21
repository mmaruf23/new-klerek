import { useState } from "react";
import { Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "@tanstack/react-router";
import { routes } from "@/routes";
import {
  useGoogleLoginMutation,
  usePasswordLoginMutation,
} from "@/features/auth/hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const googleLoginMutation = useGoogleLoginMutation();
  const passwordLoginMutation = usePasswordLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setFormError("Username dan password wajib diisi.");
      return;
    }

    setFormError(null);
    passwordLoginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate({ to: routes.dashboard });
        },
      },
    );
  };

  const handleGoogleSuccess = (credential?: string) => {
    if (!credential) return;
    setGoogleError(null);
    googleLoginMutation.mutate(credential, {
      onSuccess: () => {
        navigate({ to: routes.dashboard });
      },
    });
  };

  const isLoading =
    googleLoginMutation.isPending || passwordLoginMutation.isPending;
  const activeError =
    googleLoginMutation.error?.message ??
    passwordLoginMutation.error?.message ??
    googleError ??
    formError;

  return (
    <div className="min-h-screen bg-[#EDF0F8] flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <Link to={routes.home}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-800 tracking-tight">
                klerek
              </span>
            </div>
          </Link>
          <span className="bg-slate-900 text-white text-xs font-medium px-4 py-1.5 rounded-full">
            Admin
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 px-5 pt-10">
          {/* Lock icon */}
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-7">
            <Lock className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
          </div>

          <div className="space-y-5">
            {/* Form Username & Password */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5 tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800 disabled:bg-slate-50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5 tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-800 disabled:bg-slate-50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 px-4 rounded-xl shadow-sm transition-colors disabled:bg-indigo-400"
              >
                {passwordLoginMutation.isPending ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Pembatas / Divider */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-slate-300"></div>
              <span className="shrink mx-4 text-slate-400 text-xs font-medium uppercase tracking-wider">
                Atau masuk dengan
              </span>
              <div className="grow border-t border-slate-300"></div>
            </div>

            {/* Google Login */}
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  handleGoogleSuccess(response.credential);
                }
              }}
              onError={() => setGoogleError("Login Google gagal. Coba lagi.")}
              width="352"
              text="signin_with"
            />

            {/* Status Loading Umum & Error */}
            {googleLoginMutation.isPending && (
              <p className="text-sm text-slate-500">Memproses Google Login...</p>
            )}
            {activeError && (
              <p className="text-sm text-red-500 font-medium">{activeError}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 leading-relaxed px-8 pb-10 pt-8">
          Kode referral kamu bisa dilihat di halaman profil setelah masuk.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
