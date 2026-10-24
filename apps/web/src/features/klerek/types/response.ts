import type { apiClient } from "@/lib/apiClient";
import type { InferResponseType } from "hono";

export type Summary = NonNullable<InferResponseType<typeof apiClient.index.$post>['data']>