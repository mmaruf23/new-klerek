import type { apiClient } from "@/lib/apiClient";
import type { InferResponseType } from "hono";

export type PaymentResponse = NonNullable<InferResponseType<typeof apiClient.payment.generate.$post>['data']>
