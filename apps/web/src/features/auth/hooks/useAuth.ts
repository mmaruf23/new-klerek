import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setAccessToken } from "@/lib/session";
import type { LoginAuthInput } from "../types";
import {
  loginWithGoogleApi,
  loginWithPasswordApi,
  logoutApi,
  getProfileApi,
} from "../services/authService";

export const AUTH_QUERY_KEY = ["auth", "profile"] as const;

export function useProfileQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getProfileApi,
    retry: false,
  });
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credential: string) => loginWithGoogleApi(credential),
    onSuccess: (data) => {
      setAccessToken(data.token);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function usePasswordLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginAuthInput) => loginWithPasswordApi(payload),
    onSuccess: (data) => {
      setAccessToken(data.token);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}

