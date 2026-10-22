import { apiClient } from "@/lib/apiClient";
import { clearSession, getAccessToken, setAccessToken } from "@/lib/session";
import type { LoginAuthInput, LoginResponse, ProfileResponse } from "../types";

export async function loginWithGoogleApi(credential: string): Promise<LoginResponse> {
  const res = await apiClient.auth.google.$post({
    json: { credential },
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Login Google gagal.");
  }
  return json.data;
}

export async function loginWithPasswordApi(payload: LoginAuthInput): Promise<LoginResponse> {
  const res = await apiClient.auth.login.$post({
    json: payload,
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Login gagal.");
  }
  return json.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.auth.logout.$post();
  } catch {
    // Ignore error so local session is still cleaned up
  } finally {
    clearSession();
  }
}

async function refreshTokenApi(): Promise<string | null> {
  try {
    const res = await apiClient.auth.refresh.$post({});
    const json = await res.json();
    if (!json.success || !json.data) return null;
    setAccessToken(json.data.token);
    return json.data.token;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= refreshTokenApi().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function getProfileApi(): Promise<ProfileResponse> {
  const token = getAccessToken();
  const res = await apiClient.auth.me.$get(
    {},
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal memuat profil.");
  }
  return json.data as unknown as ProfileResponse;
}