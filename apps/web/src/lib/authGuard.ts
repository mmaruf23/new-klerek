import { redirect, type MiddlewareFunction } from "react-router-dom";
import type { JwtClaims } from "@packages/contract";
import { config } from "@/config";
import { refreshAccessToken } from "@/lib/http";
import { routes } from "@/routes";

const { ACCESS_TOKEN_KEY } = config;

function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function getClaims(): JwtClaims | null {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;
  const claims = decodeJwt(token);
  if (!claims?.role) return null;
  if (claims.exp && claims.exp * 1000 <= Date.now()) return null;
  return claims;
}

async function getClaimsOrRefresh(): Promise<JwtClaims | null> {
  const claims = getClaims();
  if (claims) return claims;

  const token = await refreshAccessToken();
  if (!token) return null;
  return getClaims();
}

export const requireAuthMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = await getClaimsOrRefresh();
  if (!claims) return redirect(routes.authLogin);

  return next();
};

export const requireAdminMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = await getClaimsOrRefresh();
  if (!claims) return redirect(routes.authLogin);
  if (claims.role !== "admin" && claims.role !== "superadmin") return redirect(routes.authLogin);
  return next();
};

export const requireUserMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = await getClaimsOrRefresh();
  if (!claims) return redirect(routes.authLogin);
  if (claims.role !== "user") return redirect(routes.home);

  return next();
};

export const redirectIfAuthenticatedMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = getClaims();
  if (claims) return redirect(routes.dashboard);

  return next();
};
