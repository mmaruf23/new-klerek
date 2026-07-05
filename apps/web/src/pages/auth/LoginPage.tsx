import { useState } from "react";
import { Lock } from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";
import { config } from "@/config";

const LoginPage = () => {
  const { login, loading, error } = useGoogleLogin();
  const [googleError, setGoogleError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#EDF0F8] flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-800 tracking-tight">klerek</span>
          </div>
          <span className="bg-slate-900 text-white text-xs font-medium px-4 py-1.5 rounded-full">Admin</span>
        </div>

        {/* Main content */}
        <div className="flex-1 px-5 pt-10">
          {/* Lock icon */}
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-7">
            <Lock className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
          </div>

          <h1 className="text-[2rem] font-bold text-slate-900 leading-tight mb-2">Masuk</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-9">
            Masuk dengan akun Google untuk mengelola toko, membership, dan riwayat upload. Akun baru otomatis
            terdaftar saat pertama kali masuk.
          </p>

          <div className="space-y-5">
            <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={(response) => {
                  setGoogleError(null);
                  if (response.credential) login(response.credential);
                }}
                onError={() => setGoogleError("Login Google gagal. Coba lagi.")}
                width="352"
                text="signin_with"
              />
            </GoogleOAuthProvider>

            {loading && <p className="text-sm text-slate-500">Memproses...</p>}
            {(error ?? googleError) && <p className="text-sm text-red-500">{error ?? googleError}</p>}
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
