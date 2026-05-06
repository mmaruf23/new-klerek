import { createHash } from 'crypto';
import { config } from '../config.js';

export interface QrisResult {
  invoiceId: string;
  qrisUrl: string;
}

// Payload yang dikirim WijayaPay ke callback URL
export interface WijayapayCallback {
  ref_id: string;     // externalId yang kita kirim saat create payment
  invoice_id: string;
  merchant_id: string;
  amount: number;
  status: string;     // "paid" | "failed" | "expired"
  paid_at?: string;
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

// X-Signature = MD5(code_merchant + api_key + ref_id)
export const verifyCallbackSignature = (
  xSignature: string,
  refId: string,
): boolean => {
  const raw = `${config.WIJAYAPAY_MERCHANT_ID}${config.WIJAYAPAY_API_KEY}${refId}`;
  const expected = createHash('md5').update(raw).digest('hex');
  return xSignature === expected;
};
