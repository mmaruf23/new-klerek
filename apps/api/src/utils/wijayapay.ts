import { config } from '../config.js';

export interface QrisResult {
  invoiceId: string;
  qrisUrl: string;
}

// Payload yang dikirim WijayaPay ke callback URL
export interface WijayapayCallback {
  invoice_id: string;
  merchant_id: string;
  amount: number;
  status: string; // "paid" | "failed" | "expired"
  paid_at?: string;
  signature: string;
}

export const createQris = async (params: {
  externalId: string;
  amount: number;
  storeId: string;
  description: string;
}): Promise<QrisResult> => {
  const res = await fetch(`${config.WIJAYAPAY_BASE_URL}/v1/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.WIJAYAPAY_API_KEY,
    },
    body: JSON.stringify({
      merchant_id: config.WIJAYAPAY_MERCHANT_ID,
      external_id: params.externalId,
      amount: params.amount,
      description: params.description,
      payment_method: 'QRIS',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WijayaPay error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Sesuaikan field name dengan response aktual dari WijayaPay
  return {
    invoiceId: data.invoice_id,
    qrisUrl: data.qris_url,
  };
};

// Verifikasi signature callback dari WijayaPay.
// Sesuaikan implementasi dengan docs WijayaPay.
export const verifyCallbackSignature = (payload: WijayapayCallback): boolean => {
  if (!config.WIJAYAPAY_CALLBACK_SECRET) return true;
  const expected = `${payload.invoice_id}${payload.amount}${config.WIJAYAPAY_CALLBACK_SECRET}`;
  // Ganti dengan algoritma hash yang sesuai docs WijayaPay
  return payload.signature === expected;
};
