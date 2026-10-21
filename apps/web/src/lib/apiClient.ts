import { config } from "@/config";
import type { AppType } from "@apps/api";
import { hc } from "hono/client";

const { API_URL } = config;

export const apiClient = hc<AppType>(API_URL, {
  init: {
    credentials: "include",
  },
});

