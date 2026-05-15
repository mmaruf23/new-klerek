import { redirect, type MiddlewareFunction } from "react-router-dom";
import { decode } from "jsonwebtoken";
import type { JwtClaims } from "@packages/contract";
import { config } from "@/config";

const { ACCESS_TOKEN_KEY } = config;

function getClaims(): JwtClaims | null {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    const claims = decode(token) as JwtClaims;
    if (!claims.role) return null;
    return claims;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export const requireAuthMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = getClaims();
  if (!claims) return redirect("/auth/login");

  return next();
};

export const requireAdminMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = getClaims();
  if (!claims) return redirect("/auth/login");
  if (claims.role !== "admin" && claims.role !== "superadmin") return redirect("/auth/login");
  return next();
};

export const requireUserMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = getClaims();
  if (!claims) return redirect("/auth/login");
  if (claims.role !== "user") return redirect("/");

  return next();
};

export const redirectIfAuthenticatedMiddleware: MiddlewareFunction = async (_, next) => {
  const claims = getClaims();
  if (claims) return redirect("/");

  return next();
};
