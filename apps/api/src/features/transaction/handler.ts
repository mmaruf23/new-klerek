import { Hono } from "hono";
import type { ApiResponse, TransactionDetail, TransactionListItem } from "@packages/contract";
import { getTransactionDetail, listTransactions } from "./service.js";
import { assertCanAccessStore, parseTransactionQuery, resolveTxScope, scopeQuery } from "./guard.js";
import { Exception } from "../../error.js";

export const transactionHandler = new Hono()

  // GET /transaction — riwayat transaksi untuk kasir (cookie) atau user (bearer).
  // Filter: storeId, userId, date | from+to, q, sort, limit, offset
  .get("/", async (c) => {
    const scope = await resolveTxScope(c);
    const query = parseTransactionQuery(c);

    const { data, ...page } = await listTransactions(scopeQuery(scope, query));

    return c.json<ApiResponse<TransactionListItem[]>>({ success: true, data, page });
  })

  // GET /transaction/:id — detail lengkap (teks struk + items)
  .get("/:id", async (c) => {
    const scope = await resolveTxScope(c);

    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id) || id <= 0) throw Exception.BadRequest("ID transaksi tidak valid");

    const detail = await getTransactionDetail(id);
    assertCanAccessStore(scope, detail.storeId);

    return c.json<ApiResponse<TransactionDetail>>({ success: true, data: detail });
  });
