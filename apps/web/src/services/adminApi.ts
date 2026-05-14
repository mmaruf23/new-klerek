import { redirect } from "react-router-dom";
import type { ApiResponse, StoreResponse } from "@packages/contract";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const STORE_PAGE_LIMIT = 20;
export const ADMIN_TOKEN_KEY = "klerek_admin_token";

export interface StoreListData {
  data: StoreResponse[];
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

export async function fetchStores(request: Request): Promise<StoreListData> {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY)!;

  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const res = await fetch(`${API_URL}/store?limit=${STORE_PAGE_LIMIT}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    throw redirect("/admin/login");
  }

  const json: ApiResponse<StoreListData> = await res.json();
  if (!json.success || !json.data) throw new Response(json.message ?? "Gagal memuat data.", { status: 500 });

  return json.data;
}
