import { redirect } from "@tanstack/react-router";
import type { JwtClaims } from "@packages/contract";
import { refreshAccessToken } from "@/features/auth/services/authService";
import { getClaims } from "@/lib/session";
import { config } from "@/config";

export async function getClaimsOrRefresh(): Promise<JwtClaims | null> {
  const claims = getClaims();
  if (claims) return claims;

  const token = await refreshAccessToken();
  if (!token) return null;
  return getClaims();
}

export async function requireAuthGuard() {
  if (config.ENV !== "production") return;
  const claims = await getClaimsOrRefresh();
  if (!claims) {
    throw redirect({ to: "/auth/login" });
  }
  return claims;
}

export async function requireSuperadminGuard() {
  const claims = await getClaimsOrRefresh();
  if (!claims) {
    throw redirect({ to: "/auth/login" });
  }
  if (claims.role !== "superadmin") {
    throw redirect({ to: "/dashboard" });
  }
  return claims;
}

export async function redirectIfAuthenticatedGuard() {
  const claims = getClaims();
  if (claims) {
    throw redirect({ to: "/dashboard" });
  }
}
