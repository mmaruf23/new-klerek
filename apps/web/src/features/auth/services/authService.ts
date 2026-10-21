import { apiClient } from "@/lib/apiClient";
import { clearSession, getAccessToken } from "@/libs/session";
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