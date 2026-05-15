import { Hono } from "hono";
import { login, register, getProfile } from "./service.js";
import { loginSchema, registerSchema } from "@packages/contract";
import type { ApiResponse, ProfileResponse } from "@packages/contract";
import { adminMiddleware } from "./middleware.js";
import type { JwtClaims } from "@packages/contract";

export const authHandler = new Hono()
  .post("/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const token = await login(result.data);
    return c.json<ApiResponse<string>>({ success: true, data: token });
  })
  .post("/register", async (c) => {
    const body = await c.req.json().catch(() => null);
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const user = await register(result.data);
    return c.json<ApiResponse<typeof user>>({ success: true, data: user }, 201);
  })
  .get("/me", adminMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const profile = await getProfile(payload.sub!);
    return c.json<ApiResponse<ProfileResponse>>({ success: true, data: profile });
  });
