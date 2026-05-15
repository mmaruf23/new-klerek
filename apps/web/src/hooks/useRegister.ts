import { useState } from "react";
import { registerUser } from "@/services/authApi";

interface RegisterResult {
  id: string;
  name: string;
  username: string;
  referralCode: string | null;
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResult | null>(null);

  const register = async (name: string, username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(name, username, password);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, result };
}
