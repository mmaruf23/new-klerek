import type { apiClient } from "@/lib/apiClient";
import type { InferRequestType } from "hono";

export type GeneratePaymentInput = InferRequestType<typeof apiClient.payment.generate.$post>['json']