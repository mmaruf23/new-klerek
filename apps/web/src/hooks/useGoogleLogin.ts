import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "@/services/authApi";
import { routes } from "@/routes";
import { config } from "@/config";

const { ACCESS_TOKEN_KEY, USER_DATA_KEY } = config;

export function useGoogleLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await loginWithGoogle(credential);
      const { id, name, email } = user;
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify({ id, name, email }));
      navigate(routes.dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
