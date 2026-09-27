import { redirect } from "react-router-dom";
import type { ApiResponse, StoreResponse } from "@packages/contract";
import { config } from "@/config";
import { fetchWithAuth } from "@/lib/http";
import { clearSession } from "@/lib/session";
import { routes } from "@/routes";

export interface SubscribeResult {
  subscription: { id: number; storeId: string; createdAt: string; expiresAt: string };
  debitAmount: number;
}

export const STORE_PAGE_LIMIT = config.STORE_PAGE_LIMIT;

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

export function parseStoreStatus(value: string | null): StoreStatusFilter | undefined {
  return value === "active" || value === "expired" ? value : undefined;
}

// loader: selalu mulai dari halaman pertama, halaman berikutnya di-append lewat fetchStorePage
export async function fetchStores(request: Request): Promise<StoreListData> {
  const url = new URL(request.url);
  return fetchStorePage({
    q: url.searchParams.get("q") ?? undefined,
    status: parseStoreStatus(url.searchParams.get("status")),
  });
}

export async function fetchStorePage({ q, status, offset = 0 }: StoreQuery): Promise<StoreListData> {
  const params = new URLSearchParams({ limit: String(STORE_PAGE_LIMIT), offset: String(offset) });
  if (q) params.set("q", q);
  if (status) params.set("status", status);

  const res = await fetchWithAuth(`/store?${params}`);

  if (res.status === 401) {
    clearSession();
    throw redirect(routes.authLogin);
  }

  const { success, data, page, message }: ApiResponse<StoreResponse[]> = await res.json();
  if (!success || !data) throw new Response(message ?? "Gagal memuat data.", { status: 500 });

  return { data, page };
}

export async function fetchStorePublic(id: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${config.API_URL}/store/lookup/${id}`, {
    credentials: "include",
  });
  const json: ApiResponse<{ id: string; name: string }> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Toko tidak ditemukan");
  return json.data;
}

export async function submitReferral(referralCode: string): Promise<{ storeId: string; storeName: string; referrerName: string }> {
  const res = await fetch(`${config.API_URL}/store/refer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ referralCode }),
  });

  const json: ApiResponse<{ storeId: string; storeName: string; referrerName: string }> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Gagal menyimpan referral");
  return json.data;
}

export async function subscribeStore(storeId: string, packageIndex: number): Promise<SubscribeResult> {
  const res = await fetchWithAuth(`/store/${storeId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageIndex }),
  });

  const json: ApiResponse<SubscribeResult> = await res.json();

  if (!json.success || !json.data) throw new Error(json.message ?? "Gagal menambah subscription");

  return json.data;
}
