import { config } from "@/config";
import { client, fetchWithAuth } from "@/libs/http";
import { clearSession } from "@/libs/session";
import type { ApiResponse, LoginAuthInput, LoginResponse, ProfileResponse } from "@packages/contract";

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

export async function loginWithPassword(payload: LoginAuthInput) {
  try {
    const result = await client.auth.login.$post({
      json: payload,
    });

    const resultJson = await result.json();
    if (!resultJson.success || !resultJson.data) throw new Error(resultJson.message ?? "Login gagal.");
    return resultJson.data;
  } catch (error) {
    if(error instanceof Error) {
      throw error
    }

    throw new Error("Tidak dapat terhubung ke server.");
  }
}

/**
 * Hapus cookie refresh_token di server lalu bersihkan session lokal.
 * Tanpa hapus cookie, auth guard akan silent-refresh dan user login lagi.
 * Session lokal tetap dibersihkan walau request gagal (mis. offline).
 */
export async function logout(): Promise<void> {
  try {
    // await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    await client.auth.logout.$post();
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
