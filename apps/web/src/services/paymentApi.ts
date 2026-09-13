import type { ApiResponse, GeneratePaymentInput, PaymentResponse } from '@packages/contract';
import { config } from '@/config';

export type Payment = PaymentResponse;

export async function generateQris(input: GeneratePaymentInput): Promise<Payment> {
  const res = await fetch(`${config.API_URL}/payment/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const json: ApiResponse<Payment> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? 'Gagal membuat QRIS');
  return json.data;
}

export async function checkPayment(invoiceId: string): Promise<Payment> {
  const res = await fetch(`${config.API_URL}/payment/${invoiceId}`, {
    credentials: 'include',
  });
  const json: ApiResponse<Payment> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? 'Gagal cek status pembayaran');
  return json.data;
}
