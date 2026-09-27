import { redirect, type MiddlewareFunction } from "react-router-dom";
import type { JwtClaims } from "@packages/contract";
import { refreshAccessToken } from "@/lib/http";
import { getClaims } from "@/lib/session";
import { routes } from "@/routes";

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

export const requireSuperadminMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = await getClaimsOrRefresh();
  if (!claims) return redirect(routes.authLogin);
  if (claims.role !== "superadmin") return redirect(routes.dashboard);
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
