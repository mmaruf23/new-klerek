import type { ApiResponse, AdminUserItem, AdminUserDetail } from "@packages/contract";
import { fetchWithAuth } from "@/lib/http";

export interface UsersListData {
  data: AdminUserItem[];
  page: ApiResponse["page"];
}

export async function fetchUsers(request: Request): Promise<UsersListData> {
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const q = url.searchParams.get("q") ?? "";

  const params = new URLSearchParams({ limit: "20", offset: String(offset) });
  if (q) params.set("q", q);

  const res = await fetchWithAuth(`/admin/users?${params}`);
  const json: ApiResponse<AdminUserItem[]> = await res.json();
  if (!json.success || !json.data) throw new Response(json.message ?? "Gagal memuat data", { status: 500 });

  return { data: json.data, page: json.page };
}

export async function fetchUserDetail(userId: string): Promise<AdminUserDetail> {
  const res = await fetchWithAuth(`/admin/users/${userId}`);
  const json: ApiResponse<AdminUserDetail> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "User tidak ditemukan");
  return json.data;
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "user",
): Promise<void> {
  const res = await fetchWithAuth(`/admin/users/${userId}/role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(json.message ?? "Gagal mengubah role");
}

export async function adjustBalance(
  userId: string,
  type: "credit" | "debit",
  amount: number,
  note?: string,
): Promise<void> {
  const res = await fetchWithAuth(`/admin/users/${userId}/balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, amount, note }),
  });
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error(json.message ?? "Gagal menyesuaikan balance");
}
