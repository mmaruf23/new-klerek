import { Hono } from "hono";
import type { ApiResponse, AdminUserItem, AdminUserDetail, JwtClaims } from "@packages/contract";
import { balanceAdjustSchema, roleUpdateSchema } from "@packages/contract";
import { adminMiddleware, superAdminMiddleware } from "../auth/middleware.js";
import { listUsers, getUserDetail, adjustUserBalance, updateUserRole, createUser } from "./service.js";
import { Exception } from "../../error.js";
import { createUserValidator } from "./validator.js";
import type { User } from "../../db/schema.js";

export const userHandler = new Hono()

  .post("/users", superAdminMiddleware, createUserValidator, async(c) => {
    const payload = c.req.valid('json');
    const user = await createUser(payload);

    return c.json<ApiResponse<User>>({
      success: true,
      data: user
    })
  })
  .get("/users", adminMiddleware, async (c) => {
    const limit = Math.max(1, Math.min(100, Number(c.req.query("limit") ?? 20) || 20));
    const offset = Math.max(0, Number(c.req.query("offset") ?? 0) || 0);
    const q = c.req.query("q")?.trim() || undefined;

    const { data, ...page } = await listUsers({ limit, offset, q });

    return c.json<ApiResponse<AdminUserItem[]>>({ success: true, data, page });
  })

  .get("/users/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const data = await getUserDetail(id);

    return c.json<ApiResponse<AdminUserDetail>>({ success: true, data });
  })

  .post("/users/:id/balance", adminMiddleware, async (c) => {

    const id = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const result = balanceAdjustSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const entry = await adjustUserBalance(id, result.data);
    return c.json<ApiResponse<typeof entry>>({ success: true, data: entry }, 201);
  })

  .post("/users/:id/role", superAdminMiddleware, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    const id = c.req.param("id");
    if (id === payload.sub) throw Exception.BadRequest("Tidak bisa mengubah role sendiri");

    const body = await c.req.json().catch(() => null);
    const result = roleUpdateSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const updated = await updateUserRole(id, result.data);
    return c.json<ApiResponse<typeof updated>>({ success: true, data: updated });
  });
