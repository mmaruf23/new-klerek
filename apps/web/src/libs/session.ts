import type { JwtClaims } from "@packages/contract";
import { config } from "@/config";

const { ACCESS_TOKEN_KEY } = config;

// key lama — dulu data user disimpan terpisah, sekarang diambil dari claims JWT
const LEGACY_USER_DATA_KEY = "user_data";

export type Role = NonNullable<JwtClaims["role"]>;

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** Claims access token yang valid (ada role & belum expired), atau null. */
export function getClaims(): JwtClaims | null {
  const token = getAccessToken();
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims?.role) return null;
  if (claims.exp && claims.exp * 1000 <= Date.now()) return null;
  return claims;
}

/**
 * User yang sedang login, dibaca dari claims access token.
 * Tidak mengecek expiry: token yang baru expired tetap berisi identitas yang sama
 * dan akan diperbarui otomatis oleh fetchWithAuth / auth guard.
 */
export function getCurrentUser(): CurrentUser | null {
  const token = getAccessToken();
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims?.sub || !claims.role) return null;
  return { id: claims.sub, name: claims.name ?? "", role: claims.role };
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_USER_DATA_KEY);
}
