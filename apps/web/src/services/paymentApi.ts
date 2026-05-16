import type { ApiResponse } from '@packages/contract';
import { config } from '@/config';

export interface Payment {
  id: number;
  invoiceId: string;
  storeId: string;
  amount: number;
  durationDays: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  qrisUrl: string | null;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
}

export async function generateQris(packageIndex: number): Promise<Payment> {
  const res = await fetch(`${config.API_URL}/payment/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ packageIndex }),
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
