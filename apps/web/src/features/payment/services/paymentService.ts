import { apiClient } from "@/lib/apiClient";
import type { GeneratePaymentInput, PaymentResponse } from "@packages/contract";

export type Payment = PaymentResponse;

export async function generateQrisApi(input: GeneratePaymentInput): Promise<Payment> {
  const res = await apiClient.payment.generate.$post({
    json: input,
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal membuat QRIS");
  }
  return json.data as unknown as Payment;
}

export async function checkPaymentApi(invoiceId: string): Promise<Payment> {
  const res = await apiClient.payment[":invoiceId"].$get({
    param: { invoiceId },
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Gagal cek status pembayaran");
  }
  return json.data as unknown as Payment;
}

