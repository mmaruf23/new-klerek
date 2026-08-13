import { Hono } from "hono";
import type { ApiResponse, AdminUserItem, AdminUserDetail, JwtClaims } from "@packages/contract";
import { balanceAdjustSchema } from "@packages/contract";
import { authMiddleware } from "../auth/middleware.js";
import { listUsers, getUserDetail, adjustUserBalance } from "./service.js";
import { Exception } from "../../error.js";

const adminGuard = authMiddleware;

const requireAdmin = async (role: string | undefined) => {
  if (role !== "admin" && role !== "superadmin") throw Exception.Forbidden("Akses ditolak");
};

export const adminHandler = new Hono()
  .get("/users", adminGuard, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    await requireAdmin(payload.role);

    const limit = Math.max(1, Math.min(100, Number(c.req.query("limit") ?? 20) || 20));
    const offset = Math.max(0, Number(c.req.query("offset") ?? 0) || 0);
    const q = c.req.query("q")?.trim() || undefined;

    const { data, ...page } = await listUsers({ limit, offset, q });

    return c.json<ApiResponse<AdminUserItem[]>>({ success: true, data, page });
  })

  .get("/users/:id", adminGuard, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    await requireAdmin(payload.role);

    const id = c.req.param("id");
    const data = await getUserDetail(id);

    return c.json<ApiResponse<AdminUserDetail>>({ success: true, data });
  })

  .post("/users/:id/balance", adminGuard, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    await requireAdmin(payload.role);

    const id = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    const result = balanceAdjustSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const entry = await adjustUserBalance(id, result.data);
    return c.json<ApiResponse<typeof entry>>({ success: true, data: entry }, 201);
  });
