import type { ApiResponse, StoreResponse } from "@packages/contract";

export interface SubscribeResult {
  subscription: { id: number; storeId: string; createdAt: string; expiresAt: string };
  debitAmount: number;
}

export interface StoreListData {
  data: StoreResponse[];
  page: ApiResponse["page"];
}

export type StoreStatusFilter = "active" | "expired";

export interface StoreQuery {
  q?: string;
  status?: StoreStatusFilter;
  offset?: number;
}
