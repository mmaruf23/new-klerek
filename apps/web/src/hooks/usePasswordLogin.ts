import { setAccessToken } from "@/libs/session";
import { routes } from "@/routes";
import { loginWithPassword } from "@/services/authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginAuthInput } from "@packages/contract";

export function userPasswordLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = async (input: LoginAuthInput) => {
    setLoading(true);
    setError(null)
    try {
      const {token} = await loginWithPassword(input);
      setAccessToken(token)
      navigate(routes.dashboard)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return {login, loading, error}
}