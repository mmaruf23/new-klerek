import { Hono } from "hono";
import type {
  ApiResponse,
  AdminUserItem,
  AdminUserDetail,
  JwtClaims,
  TransactionListItem,
} from "@packages/contract";
import { balanceAdjustSchema, roleUpdateSchema } from "@packages/contract";
import { authMiddleware } from "../auth/middleware.js";
import { listUsers, getUserDetail, adjustUserBalance, updateUserRole } from "./service.js";
import { listTransactions } from "../transaction/service.js";
import { parseTransactionQuery } from "../transaction/guard.js";
import { Exception } from "../../error.js";

const adminGuard = authMiddleware;

const requireAdmin = async (role: string | undefined) => {
  if (role !== "admin" && role !== "superadmin") throw Exception.Forbidden("Akses ditolak");
};

const requireSuperadmin = async (role: string | undefined) => {
  if (role !== "superadmin") throw Exception.Forbidden("Hanya superadmin yang bisa mengubah role");
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

  // GET /admin/transactions — riwayat transaksi semua toko
  // Filter: storeId, userId, date | from+to, q, sort, limit, offset
  .get("/transactions", adminGuard, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    await requireAdmin(payload.role);

    const { data, ...page } = await listTransactions(parseTransactionQuery(c));

    return c.json<ApiResponse<TransactionListItem[]>>({ success: true, data, page });
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
  })

  .post("/users/:id/role", adminGuard, async (c) => {
    const payload = c.get("jwtPayload") as JwtClaims;
    await requireSuperadmin(payload.role);

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
