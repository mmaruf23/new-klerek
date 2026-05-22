import { Hono } from "hono";
import { login, register, getProfile, getBalanceHistory, refreshUserToken } from "./service.js";
import { loginSchema, registerSchema } from "@packages/contract";
import type { ApiResponse, LoginResponse, ProfileResponse, RegisterResponse } from "@packages/contract";
import { authMiddleware } from "./middleware.js";
import type { JwtClaims } from "@packages/contract";
import { setCookie, getCookie } from "hono/cookie";
import { config } from "../../config.js";

export const authHandler = new Hono()
  .post("/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const { user, token, refreshToken } = await login(result.data);
    const isProduction = config.NODE_ENV === "production";
    setCookie(c, "refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return c.json<ApiResponse<LoginResponse>>({ success: true, data: { user, token } });
  })
  .post("/register", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const user = await register(result.data);
    return c.json<ApiResponse<RegisterResponse>>({ success: true, data: user }, 201);
  })
  .post("/refresh", async (c) => {
    const refreshToken = getCookie(c, "refresh_token");
    if (!refreshToken) return c.json<ApiResponse>({ success: false, message: "Refresh token tidak ditemukan" }, 401);
    const data = await refreshUserToken(refreshToken);
    return c.json<ApiResponse<{ token: string }>>({ success: true, data });
  })
  .get("/me", authMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const profile = await getProfile(payload.sub!);
    return c.json<ApiResponse<ProfileResponse>>({ success: true, data: profile });
  })
  .get("/balance", authMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const history = await getBalanceHistory(payload.sub!);
    return c.json<ApiResponse<typeof history>>({ success: true, data: history });
  });
