import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { JwtClaims, TransactionQueryInput } from "@packages/contract";
import { transactionQuerySchema } from "@packages/contract";
import { config } from "../../config.js";
import { getClaims } from "../../utils/jwt.js";
import { Exception } from "../../error.js";
import { getReferredStoreIds } from "../store/service.js";

/**
 * Riwayat transaksi bisa diakses tiga pihak dengan cakupan berbeda:
 * - `admin`  → semua toko (bearer, role admin/superadmin)
 * - `user`   → hanya toko yang direferral dirinya (bearer, role user)
 * - `store`  → hanya toko sendiri (cookie `store_token` milik kasir)
 */
export type TxScope =
  | { kind: "admin" }
  | { kind: "user"; userId: string; storeIds: string[] }
  | { kind: "store"; storeId: string };

export const resolveTxScope = async (c: Context): Promise<TxScope> => {
  const header = c.req.header("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (match) {
    const claims = await getClaims(match[1].trim());
    if (!claims?.sub || claims.type === "refresh") throw Exception.Unauthorized();

    if (claims.role === "admin" || claims.role === "superadmin") return { kind: "admin" };

    return {
      kind: "user",
      userId: claims.sub,
      storeIds: await getReferredStoreIds(claims.sub),
    };
  }

  const cookie = getCookie(c, config.COOKIE_TOKEN_KEY);
  if (cookie) {
    const claims = (await getClaims(cookie)) as JwtClaims | undefined;
    if (claims?.store_id) return { kind: "store", storeId: claims.store_id };
  }

  throw Exception.Unauthorized();
};

/** Validasi query string filter. Param kosong (`?q=`) dianggap tidak diisi. */
export const parseTransactionQuery = (c: Context): TransactionQueryInput => {
  const raw = Object.fromEntries(Object.entries(c.req.query()).filter(([, v]) => v !== ""));

  const result = transactionQuerySchema.safeParse(raw);
  if (!result.success) throw Exception.BadRequest(result.error.issues[0].message);

  return result.data;
};

/** Batasi filter query sesuai cakupan pemanggil. */
export const scopeQuery = (scope: TxScope, query: TransactionQueryInput) => {
  if (scope.kind === "admin") return { ...query };

  if (scope.kind === "user") {
    if (query.storeId && !scope.storeIds.includes(query.storeId)) {
      throw Exception.Forbidden("Toko ini bukan referral Anda");
    }
    return { ...query, allowedStoreIds: scope.storeIds };
  }

  if (query.storeId && query.storeId !== scope.storeId) throw Exception.Forbidden("Akses ditolak");
  return { ...query, storeId: scope.storeId, allowedStoreIds: [scope.storeId] };
};

export const assertCanAccessStore = (scope: TxScope, storeId: string) => {
  if (scope.kind === "admin") return;
  if (scope.kind === "user" && scope.storeIds.includes(storeId)) return;
  if (scope.kind === "store" && scope.storeId === storeId) return;

  throw Exception.Forbidden("Akses ditolak");
};
