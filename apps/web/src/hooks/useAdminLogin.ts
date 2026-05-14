import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "@/services/authApi";

export function useAdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await loginAdmin(username, password);
      sessionStorage.setItem("klerek_admin_token", token);
      navigate("/admin/stores");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
