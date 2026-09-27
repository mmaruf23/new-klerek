import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "@/services/authApi";
import { routes } from "@/routes";
import { setAccessToken } from "@/lib/session";

export function useGoogleLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await loginWithGoogle(credential);
      setAccessToken(token);
      navigate(routes.dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
