import { config } from "@/config";
import type { ApiResponse, LoginResponse, ProfileResponse, RegisterResponse } from "@packages/contract";

const { API_URL } = config;

export async function loginAdmin(username: string, password: string): Promise<LoginResponse> {
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
  const json: ApiResponse<LoginResponse> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Username atau password salah.");
  return json.data;
}

export async function registerUser(name: string, username: string, password: string): Promise<RegisterResponse> {
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
  const json: ApiResponse<RegisterResponse> = await res.json();
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
