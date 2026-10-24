import { apiClient } from "@/lib/apiClient";
import { config } from "@/config";
import { getAccessToken, clearSession } from "@/lib/session";
import type { StoreQuery, SubscribeResult } from "../types";

export const STORE_PAGE_LIMIT = config.STORE_PAGE_LIMIT;

export async function fetchStorePageApi({ q, status, offset = 0 }: StoreQuery) {
  const token = getAccessToken();
  const res = await apiClient.store.$get(
    {
      query: {
        limit: String(STORE_PAGE_LIMIT),
        offset: String(offset),
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
      },
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (res.status === 401) {
    clearSession();
    throw new Error("Unauthorized");
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal memuat data toko.");
  }

  return {
    data: json.data,
    page: json.page,
  };
}

export async function fetchStorePublicApi(id: string): Promise<{ id: string; name: string }> {
  const res = await apiClient.store.lookup[":id"].$get({
    param: { id },
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Toko tidak ditemukan");
  }
  return json.data;
}

export async function submitReferralApi(
  referralCode: string,
): Promise<{ storeId: string; storeName: string; referrerName: string }> {
  const res = await apiClient.store.refer.$post({
    json: { referralCode },
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal menyimpan referral");
  }
  return json.data;
}

export async function subscribeStoreApi(storeId: string, packageIndex: number): Promise<SubscribeResult> {
  const token = getAccessToken();
  const storeClient = apiClient.store as any;
  const res = await storeClient[":id"].subscribe.$post(
    {
      param: { id: storeId },
      json: { packageIndex },
    },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal menambah subscription");
  }
  return json.data as unknown as SubscribeResult;
}
