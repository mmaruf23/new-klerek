import { Hono } from "hono";
import { loginWithGoogle, getProfile, getBalanceHistory, refreshUserToken } from "./service.js";
import { googleAuthSchema } from "@packages/contract";
import type { ApiResponse, LoginResponse, ProfileResponse, RefreshResponse } from "@packages/contract";
import { authMiddleware } from "./middleware.js";
import type { JwtClaims } from "@packages/contract";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { config } from "../../config.js";
import { Balance } from "../../db/schema.js";

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
  .post("/google", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = googleAuthSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const { user, token, refreshToken } = await loginWithGoogle(result.data);
    setCookie(c, REFRESH_COOKIE_KEY, refreshToken, { ...refreshCookieOptions(), maxAge: 60 * 60 * 24 * 7 });
    return c.json<ApiResponse<LoginResponse>>({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  })
  .post("/refresh", async (c) => {
    const refreshToken = getCookie(c, REFRESH_COOKIE_KEY);
    if (!refreshToken) return c.json<ApiResponse>({ success: false, message: "Refresh token tidak ditemukan" }, 401);
    const data = await refreshUserToken(refreshToken);
    return c.json<ApiResponse<RefreshResponse>>({ success: true, data });
  })
  // refresh token stateless (tidak disimpan di DB), jadi logout = hapus cookie-nya
  .post("/logout", (c) => {
    deleteCookie(c, REFRESH_COOKIE_KEY, refreshCookieOptions());
    return c.json<ApiResponse>({ success: true, message: "Berhasil logout" });
  })
  .get("/me", authMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const profile = await getProfile(payload.sub!);
    return c.json<ApiResponse<ProfileResponse>>({ success: true, data: profile });
  })
  .get("/balance", authMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const history = await getBalanceHistory(payload.sub!);
    return c.json<ApiResponse<Balance[]>>({ success: true, data: history });
  });
