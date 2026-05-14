import {
  useState,
  type Dispatch,
  type FC,
  type HTMLInputAutoCompleteAttribute,
  type HTMLInputTypeAttribute,
  type SetStateAction,
  type SubmitEventHandler,
} from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAdminLogin } from "@/hooks/useAdminLogin";

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  setValue: Dispatch<SetStateAction<string>>;
}
const Field: FC<FieldProps> = ({ label, value, placeholder, type, setValue }) => {
  const [showPassword, setShowPassword] = useState(false);

  function autoCompleteAttribute(label: string): HTMLInputAutoCompleteAttribute | undefined {
    if (label.toLocaleLowerCase() == "username") return "username";
    if (label.toLocaleLowerCase() == "password") return "current-password";
    return undefined;
  }

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">{label}</label>
      <div className="relative">
        <input
          type={type && showPassword ? "text" : type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete={autoCompleteAttribute(label)}
          className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 shadow-sm outline-none"
        />
        {type == "password" && (
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

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading, error } = useAdminLogin();

  const handleSubmit: SubmitEventHandler = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

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

          <h1 className="text-[2rem] font-bold text-slate-900 leading-tight mb-2">Konsol Admin</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-9">
            Masuk untuk mengelola toko, membership, dan riwayat upload.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Username" value={username} setValue={setUsername} placeholder="username" type="text" />
            <Field label="Password" value={password} setValue={setPassword} placeholder="password" type="password" />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                Ingat saya
              </label>
              <button
                type="button"
                className="text-sm text-indigo-500 font-medium hover:text-indigo-600 transition-colors"
              >
                Lupa password?
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-base transition-colors disabled:opacity-60 shadow-lg shadow-indigo-200 mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 leading-relaxed px-8 pb-10 pt-8">
          Akses ini khusus admin Klerek.
          <br />
          Pengguna toko tidak perlu login.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
