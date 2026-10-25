import { Hono } from "hono";
import { loginWithGoogle, refreshUserToken, issueToken, loginWithPassword } from "./service.js";
import { authMiddleware } from "./middleware.js";
import { JwtClaims } from "../../types/jwt.js";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { config } from "../../config.js";
import type { Balance } from "../../db/schema.js";
import { googleLoginValidator, loginValidator } from "./validator.js";
import { getBalanceHistory, getProfile } from "../user/service.js";
import { ApiResponse } from "../../types/response.js";

const REFRESH_COOKIE_KEY = "refresh_token";

// atribut harus sama persis saat set & delete, kalau tidak browser tidak menghapus cookie
const refreshCookieOptions = (): CookieOptions => {
  const isProduction = config.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
  };
};

export const authHandler = new Hono()
  .post("/login", loginValidator, async (c) => {
    const req = c.req.valid("json");

    const user = await loginWithPassword(req);
    const { token, refreshToken } = await issueToken(user);
    const data = { user, token };

    setCookie(c, REFRESH_COOKIE_KEY, refreshToken, { ...refreshCookieOptions(), maxAge: 60 * 60 * 24 * 7 });
    return c.json<ApiResponse<typeof data>>({ success: true, data });
  })
  .post("/google", googleLoginValidator, async (c) => {
    const req = c.req.valid("json");

    const user = await loginWithGoogle(req);
    const { token, refreshToken } = await issueToken(user);

    const data = { user, token };
    setCookie(c, REFRESH_COOKIE_KEY, refreshToken, { ...refreshCookieOptions(), maxAge: 60 * 60 * 24 * 7 });
    return c.json<ApiResponse<typeof data>>({ success: true, data });
  })
  .post("/refresh", async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE_KEY);
    if (!refreshToken) return c.json<ApiResponse>({ success: false, message: "Refresh token tidak ditemukan" }, 401);
    const data = await refreshUserToken(refreshToken);
    return c.json<ApiResponse<typeof data>>({ success: true, data });
  })
  // refresh token stateless (tidak disimpan di DB), jadi logout = hapus cookie-nya
  .post("/logout", (c) => {
    deleteCookie(c, REFRESH_COOKIE_KEY, refreshCookieOptions());
    return c.json<ApiResponse>({ success: true, message: "Berhasil logout" });
  })
  .get("/me", authMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const profile = await getProfile(payload.sub!);
    return c.json<ApiResponse<typeof profile>>({ success: true, data: profile });
  })
  // todo : gabungkan dengan endpoint di atas
  .get("/balance", authMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const history = await getBalanceHistory(payload.sub!);
    return c.json<ApiResponse<Balance[]>>({ success: true, data: history });
  });
