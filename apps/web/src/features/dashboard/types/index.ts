import type { ApiResponse, StoreResponse } from "@packages/contract";
import type { AdminUserItem } from "@packages/contract";
export type { AdminUserDetail } from "@packages/contract";

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

export interface UsersListData {
  data: AdminUserItem[];
  page: ApiResponse["page"];
}

export interface UserQuery {
  q?: string;
  offset?: number;
}
