import type { apiClient } from "@/lib/apiClient";
import type { InferResponseType } from "hono";

export type StoreResponse = NonNullable<InferResponseType<typeof apiClient.store.$get>['data']>[number]

/** Rekap jumlah toko dari GET /store/count (selalu global, tidak terpengaruh filter list). */
export type StoreCountResponse = NonNullable<InferResponseType<typeof apiClient.store.count.$get>['data']>

export interface SubscribeResult {
  subscription: { id: number; storeId: string; createdAt: string; expiresAt: string };
  debitAmount: number;
}

export type StoreStatusFilter = "active" | "expired";

export interface StoreQuery {
  q?: string;
  status?: StoreStatusFilter;
  offset?: number;
}

export interface UserQuery {
  q?: string;
  offset?: number;
}
