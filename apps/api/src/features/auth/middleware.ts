import { jwt } from "hono/jwt";
import { config } from "../../config.js";
import type { MiddlewareHandler } from "hono";
import { getClaims } from "../../utils/jwt.js";
import type { JwtClaims } from "@packages/contract";
import { getCookie } from "hono/cookie";
import { Exception } from "../../error.js";

const jwtMiddleware = jwt({
  secret: config.JWT_SECRET,
  alg: "HS256",
});

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  await jwtMiddleware(c, async () => {
    const payload = c.get("jwtPayload") as JwtClaims;
    if (!payload?.sub) throw Exception.Unauthorized();
    await next();
  });
};

export const cookieMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, config.COOKIE_TOKEN_KEY);

  let claims: JwtClaims | undefined;

  if (token) claims = await getClaims(token);
  if (claims) c.set("jwtPayload", claims);

  await next();
};
