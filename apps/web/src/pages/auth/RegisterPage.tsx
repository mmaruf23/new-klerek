import { useState, type Dispatch, type FC, type SetStateAction, type SubmitEventHandler } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Copy, Check, ArrowRight } from "lucide-react";
import { useRegister } from "@/hooks/useRegister";
import { routes } from "@/routes";

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  type?: "text" | "password";
  autoComplete?: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const Field: FC<FieldProps> = ({ label, value, placeholder, type = "text", autoComplete, setValue }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">{label}</label>
      <div className="relative">
        <input
          type={type === "password" && showPassword ? "text" : type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 shadow-sm outline-none"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { register, loading, error, result } = useRegister();

  const handleSubmit: SubmitEventHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationError("Konfirmasi password tidak cocok.");
      return;
    }
    setValidationError(null);
    await register(name, username, password);
  };

  const handleCopy = () => {
    if (!result?.referralCode) return;
    navigator.clipboard.writeText(result.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#EDF0F8] flex justify-center">
        <div className="w-full max-w-sm flex flex-col min-h-screen">
          <div className="flex items-center justify-between px-5 pt-14 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L15 8L8 15L1 8L8 1Z" fill="white" />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-800 tracking-tight">klerek</span>
            </div>
          </div>

          <div className="flex-1 px-5 pt-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-7">
              <Check className="w-7 h-7 text-emerald-500" strokeWidth={2.5} />
            </div>

            <h1 className="text-[2rem] font-bold text-slate-900 leading-tight mb-2">Akun dibuat!</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Selamat datang, <span className="font-medium text-slate-700">{result.name}</span>. Simpan kode referral
              kamu — kode ini dipakai untuk mengajak toko lain bergabung.
            </p>

            {result.referralCode && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3">Kode Referral</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-[0.15em]">
                    {result.referralCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-sm text-indigo-500 font-medium hover:text-indigo-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>
            )}

            <Link
              to={routes.authLogin}
              className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-indigo-200"
            >
              Lanjut ke halaman masuk
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 leading-relaxed px-8 pb-10 pt-8">
            Kode referral tidak bisa ditampilkan ulang.
            <br />
            Pastikan sudah disimpan sebelum melanjutkan.
          </p>
        </div>
      </div>
    );
  }

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
          <span className="bg-slate-900 text-white text-xs font-medium px-4 py-1.5 rounded-full">Daftar</span>
        </div>

        {/* Main content */}
        <div className="flex-1 px-5 pt-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-7">
            <UserPlus className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
          </div>

          <h1 className="text-[2rem] font-bold text-slate-900 leading-tight mb-2">Buat akun</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-9">
            Daftarkan dirimu untuk mulai menggunakan Klerek dan dapatkan kode referral.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="Nama Lengkap"
              value={name}
              setValue={setName}
              placeholder="nama lengkap"
              autoComplete="name"
            />
            <Field
              label="Username"
              value={username}
              setValue={setUsername}
              placeholder="username"
              autoComplete="username"
            />
            <Field
              label="Password"
              value={password}
              setValue={setPassword}
              placeholder="minimal 6 karakter"
              type="password"
              autoComplete="new-password"
            />
            <Field
              label="Konfirmasi Password"
              value={confirmPassword}
              setValue={setConfirmPassword}
              placeholder="ulangi password"
              type="password"
              autoComplete="new-password"
            />

            {(validationError || error) && (
              <p className="text-sm text-red-500">{validationError ?? error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-base transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200 mt-2"
            >
              {loading ? "Mendaftarkan..." : "Buat akun"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 leading-relaxed px-8 pb-10 pt-8">
          Sudah punya akun?{" "}
          <Link to={routes.authLogin} className="text-indigo-500 font-medium hover:text-indigo-600 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
