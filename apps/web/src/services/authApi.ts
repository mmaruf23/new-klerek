import type { ApiResponse, ProfileResponse } from "@packages/contract";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface RegisterResult {
  id: string;
  name: string;
  username: string;
  referralCode: string | null;
}

export async function loginAdmin(username: string, password: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server.");
  }
  const json: ApiResponse<string> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Username atau password salah.");
  return json.data;
}

export async function registerUser(name: string, username: string, password: string): Promise<RegisterResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server.");
  }
  const json: ApiResponse<RegisterResult> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Registrasi gagal.");
  return json.data;
}

export async function fetchProfile(token: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Response("Unauthorized", { status: 401 });
  const json: ApiResponse<ProfileResponse> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Gagal memuat profil.");
  return json.data;
}
