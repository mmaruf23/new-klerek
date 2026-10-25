import { Hono } from "hono";
import { adminMiddleware, superAdminMiddleware } from "../auth/middleware.js";
import { listUsers, getUserDetail, adjustUserBalance, updateUserRole, createUser } from "./service.js";
import { Exception } from "../../error.js";
import { balanceAdjustValidator, createUserValidator, roleUpdateValidator } from "./validator.js";
import type { User } from "../../db/schema.js";
import type { ApiResponse } from "../../types/response.js";
import type { JwtClaims } from "../../types/jwt.js";

export const userHandler = new Hono()

  .post("/users", superAdminMiddleware, createUserValidator, async (c) => {
    const payload = c.req.valid("json");
    const user = await createUser(payload);

    return c.json<ApiResponse<User>>({
      success: true,
      data: user,
    });
  })
  .get("/users", adminMiddleware, async (c) => {
    const limit = Math.max(1, Math.min(100, Number(c.req.query("limit") ?? 20) || 20));
    const offset = Math.max(0, Number(c.req.query("offset") ?? 0) || 0);
    const q = c.req.query("q")?.trim() || undefined;

    const { data, ...page } = await listUsers({ limit, offset, q });

    return c.json<ApiResponse<typeof data>>({ success: true, data, page });
  })

  .get("/users/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const data = await getUserDetail(id);

    return c.json<ApiResponse<typeof data>>({ success: true, data });
  })

  .post("/users/:id/balance", adminMiddleware, balanceAdjustValidator, async (c) => {
    const id = c.req.param("id");
    const req = c.req.valid("json");

    const entry = await adjustUserBalance(id, req);
    return c.json<ApiResponse<typeof entry>>({ success: true, data: entry }, 201);
  })
  .post("/users/:id/role", superAdminMiddleware, roleUpdateValidator, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const id = c.req.param("id");
    if (id === payload.sub) throw Exception.BadRequest("Tidak bisa mengubah role sendiri");

    const req = c.req.valid("json");

    const updated = await updateUserRole(id, req);
    return c.json<ApiResponse<typeof updated>>({ success: true, data: updated });
  });
