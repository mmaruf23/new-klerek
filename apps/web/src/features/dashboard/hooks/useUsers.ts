import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserQuery } from "../types";
import {
  fetchUsersApi,
  fetchUserDetailApi,
  updateUserRoleApi,
  adjustBalanceApi,
} from "../services/userService";

export const USERS_QUERY_KEY = ["admin", "users"] as const;

export function useUsersQuery(query: UserQuery) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, query],
    queryFn: () => fetchUsersApi(query),
  });
}

export function useUserDetailQuery(userId: string) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, "detail", userId],
    queryFn: () => fetchUserDetailApi(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "admin" | "user" }) =>
      updateUserRoleApi(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useAdjustBalanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      type,
      amount,
      note,
    }: {
      userId: string;
      type: "credit" | "debit";
      amount: number;
      note?: string;
    }) => adjustBalanceApi(userId, type, amount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

