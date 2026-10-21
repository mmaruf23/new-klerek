import type { ApiResponse, AdminUserItem } from "@packages/contract";
export type { AdminUserDetail } from "@packages/contract";
export interface UsersListData {
  data: AdminUserItem[];
  page: ApiResponse["page"];
}

export interface UserQuery {
  q?: string;
  offset?: number;
}
