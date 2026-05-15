import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "@/services/authApi";

const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY ?? "access_token";

export function useAdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await loginAdmin(username, password);
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      navigate("/admin/stores");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
