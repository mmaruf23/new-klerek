import { sign, verify } from "hono/jwt";
import { config } from "../config.js";
import type { JwtClaims } from "@packages/contract";
export type { JwtClaims };

export const setClaims = async (payload: JwtClaims) => {
  const token = await sign(payload, config.JWT_SECRET, "HS256");

  return token;
};

export const getClaims = async (token: string) => {
  let claims: JwtClaims;

  try {
    claims = (await verify(token, config.JWT_SECRET, "HS256")) as JwtClaims;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    console.log("Failed get claims from this : ", token, msg);
    return;
  }
  return claims;
};
