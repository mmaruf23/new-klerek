import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoreQuery } from "../types";
import {
  fetchStoreCountApi,
  fetchStorePageApi,
  fetchStorePublicApi,
  submitReferralApi,
  subscribeStoreApi,
} from "../services/storeService";

export const STORE_QUERY_KEY = ["stores"] as const;

export function useStoresQuery(query: StoreQuery) {
  return useQuery({
    queryKey: [...STORE_QUERY_KEY, query],
    queryFn: () => fetchStorePageApi(query),
    initialData: () => ({data: [], page: undefined})
  });
}

/** Rekap count toko global dari GET /store/count — dipakai kartu statistik dashboard. */
export function useStoreCountQuery() {
  return useQuery({
    queryKey: [...STORE_QUERY_KEY, "count"],
    queryFn: fetchStoreCountApi,
  });
}

export function useStorePublicQuery(id: string) {
  return useQuery({
    queryKey: ["store", "public", id],
    queryFn: () => fetchStorePublicApi(id),
    enabled: Boolean(id),
  });
}

export function useSubmitReferralMutation() {
  return useMutation({
    mutationFn: (referralCode: string) => submitReferralApi(referralCode),
  });
}

export function useSubscribeStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, packageIndex }: { storeId: string; packageIndex: number }) =>
      subscribeStoreApi(storeId, packageIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORE_QUERY_KEY });
    },
  });
}

