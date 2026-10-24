import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoreQuery } from "../types";
import {
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

