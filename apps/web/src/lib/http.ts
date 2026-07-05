import { config } from "@/config";
import type { ApiResponse, RefreshResponse } from "@packages/contract";

const { API_URL, ACCESS_TOKEN_KEY } = config;

let refreshPromise: Promise<string | null> | null = null;

async function requestNewToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const json: ApiResponse<RefreshResponse> = await res.json();
    if (!json.success || !json.data) return null;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, json.data.token);
    return json.data.token;
  } catch {
    return null;
  }
}

export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= requestNewToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function fetchWithAuth(path: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const res = await doFetch(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  if (res.status !== 401) return res;

  const newToken = await refreshAccessToken();
  if (!newToken) return res;

  return doFetch(newToken);
}
