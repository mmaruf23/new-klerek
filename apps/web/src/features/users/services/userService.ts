import { apiClient } from "@/lib/apiClient";
import { getAccessToken } from "@/libs/session";
import type { AdminUserDetail, UserQuery, UsersListData } from "../types";

export async function fetchUsersApi({
  offset = 0,
  q = "",
}: UserQuery): Promise<UsersListData> {
  const token = getAccessToken();
  const res = await apiClient.admin.users.$get(
    {
      query: {
        limit: "20",
        offset: String(offset),
        ...(q ? { q } : {}),
      },
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal memuat data pengguna.");
  }

  return {
    data: json.data as unknown as UsersListData["data"],
    page: json.page,
  };
}

export async function fetchUserDetailApi(
  userId: string,
): Promise<AdminUserDetail> {
  const token = getAccessToken();
  const res = await apiClient.admin.users[":id"].$get(
    {
      param: { id: userId },
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "User tidak ditemukan");
  }
  return json.data as unknown as AdminUserDetail;
}

export async function updateUserRoleApi(
  userId: string,
  role: "admin" | "user",
): Promise<void> {
  const token = getAccessToken();
  const adminClient = apiClient.admin as any;
  const res = await adminClient.users[":id"].role.$post(
    {
      param: { id: userId },
      json: { role },
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? "Gagal mengubah role");
  }
}

export async function adjustBalanceApi(
  userId: string,
  type: "credit" | "debit",
  amount: number,
  note?: string,
): Promise<void> {
  const token = getAccessToken();
  const adminClient = apiClient.admin as any;
  const res = await adminClient.users[":id"].balance.$post(
    {
      param: { id: userId },
      json: { type, amount, note },
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? "Gagal menyesuaikan balance");
  }
}
