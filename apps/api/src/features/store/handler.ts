import type { ApiResponse, JwtClaims, StoreResponse, ReferStoreResponse } from "@packages/contract";
import { referStoreSchema } from "@packages/contract";
import { Hono } from "hono";
import { getAllStore, getStoreByIDWithLatestSubs, getStorePublicInfo, addSubscriptionByBalance, setStoreReferrer } from "./service.js";
import { isValidStoreID } from "./helper.js";
import { Exception } from "../../error.js";
import { authMiddleware, cookieMiddleware } from "../auth/middleware.js";

export const storeHandler = new Hono()
  .post("/refer", cookieMiddleware, async (c) => {
    const claims = c.get("jwtPayload") as JwtClaims | undefined;
    if (!claims?.store_id) throw Exception.Unauthorized();

    const body = await c.req.json().catch(() => null);
    const result = referStoreSchema.safeParse(body);
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    }

    const data = await setStoreReferrer(claims.store_id, result.data.referralCode);
    return c.json<ApiResponse<ReferStoreResponse>>({ success: true, data });
  })

  .get("/lookup/:id", async (c) => {
    const id = c.req.param("id");
    if (!isValidStoreID(id)) throw Exception.Validation("invalid store id");

    const data = await getStorePublicInfo(id);
    if (!data) throw Exception.NotFound("store not found");

    return c.json<ApiResponse<typeof data>>({ success: true, data });
  })

  .get("/", authMiddleware, async (c) => {
    const limit = Math.max(1, Number(c.req.query("limit") ?? 20) || 20);
    const offset = Math.max(0, Number(c.req.query("offset") ?? 0) || 0);
    const { data, ...page } = await getAllStore({ limit, offset });

    console.log(data);

    return c.json<ApiResponse<StoreResponse[]>>({
      success: true,
      data: data,
      page,
    });
  })
  .get("/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    if (!isValidStoreID(id)) throw Exception.Validation("invalid store id");

    const data = await getStoreByIDWithLatestSubs(id);
    if (!data) throw Exception.NotFound("store not found");

    return c.json<ApiResponse<StoreResponse>>({
      success: true,
      data,
    });
  })

  // POST /store/:id/subscribe — tambah subscription via balance
  // Hanya untuk toko yang refer ke akun pemanggil. Superadmin tidak dikenai debit.
  .post("/:id/subscribe", authMiddleware, async (c) => {
    const id = c.req.param("id");
    if (!isValidStoreID(id)) throw Exception.Validation("invalid store id");

    const payload = c.get("jwtPayload") as JwtClaims;
    const userId = payload.sub!;
    const userRole = payload.role ?? "user";

    const body = await c.req.json<{ packageIndex: unknown }>();
    if (typeof body.packageIndex !== "number") throw Exception.BadRequest("packageIndex must be a number");

    const result = await addSubscriptionByBalance(userId, userRole, id, body.packageIndex);

    return c.json<ApiResponse<typeof result>>({ success: true, data: result }, 201);
  });
