import { apiClient } from "@/lib/apiClient";
import type { GeneratePaymentInput } from "../types/request";
import type { PaymentResponse } from "../types/response";

export async function generateQrisApi(input: GeneratePaymentInput): Promise<PaymentResponse> {
  const res = await apiClient.payment.generate.$post({
    json: input,
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal membuat QRIS");
  }
  return json.data as unknown as PaymentResponse;
}

export async function checkPaymentApi(invoiceId: string): Promise<PaymentResponse> {
  const res = await apiClient.payment[":invoiceId"].$get({
    param: { invoiceId },
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal cek status pembayaran");
  }
  return json.data as unknown as PaymentResponse;
}
