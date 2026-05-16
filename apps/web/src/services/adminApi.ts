import { redirect } from "react-router-dom";
import type { ApiResponse, StoreResponse } from "@packages/contract";
import { config } from "@/config";

export interface SubscribeResult {
  subscription: { id: number; storeId: string; createdAt: string; expiresAt: string };
  debitAmount: number;
}

export const STORE_PAGE_LIMIT = 20;

export interface StoreListData {
  data: StoreResponse[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

export async function fetchStores(request: Request): Promise<StoreListData> {
  const token = sessionStorage.getItem(config.ACCESS_TOKEN_KEY)!;

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const res = await fetch(`${config.API_URL}/store?limit=${STORE_PAGE_LIMIT}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    sessionStorage.removeItem(config.ACCESS_TOKEN_KEY);
    throw redirect("/admin/login");
  }

  const json: ApiResponse<StoreListData> = await res.json();
  if (!json.success || !json.data) throw new Response(json.message ?? "Gagal memuat data.", { status: 500 });

  return json.data;
}

export async function subscribeStore(
  storeId: string,
  packageIndex: number,
  token: string,
): Promise<SubscribeResult> {
  const res = await fetch(`${config.API_URL}/store/${storeId}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ packageIndex }),
  });

  const json: ApiResponse<SubscribeResult> = await res.json();

  if (res.status === 401) throw new Error('Toko ini bukan referral Anda');
  if (!json.success || !json.data) throw new Error(json.message ?? 'Gagal menambah subscription');

  return json.data;
}
