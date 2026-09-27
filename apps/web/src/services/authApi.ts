import { config } from "@/config";
import { fetchWithAuth } from "@/lib/http";
import { clearSession } from "@/lib/session";
import type { ApiResponse, LoginResponse, ProfileResponse } from "@packages/contract";

const { API_URL } = config;

export async function loginWithGoogle(credential: string): Promise<LoginResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ credential }),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server.");
  }
  const json: ApiResponse<LoginResponse> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Login Google gagal.");
  return json.data;
}

/**
 * Hapus cookie refresh_token di server lalu bersihkan session lokal.
 * Tanpa hapus cookie, auth guard akan silent-refresh dan user login lagi.
 * Session lokal tetap dibersihkan walau request gagal (mis. offline).
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // abaikan — minimal session lokal tetap dihapus
  } finally {
    clearSession();
  }
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const res = await fetchWithAuth("/auth/me");
  if (res.status === 401) throw new Response("Unauthorized", { status: 401 });
  const json: ApiResponse<ProfileResponse> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Gagal memuat profil.");
  return json.data;
}
