import { createHash } from "crypto";
import { config } from "../config.js";

export interface QrisResult {
  refId: string;
  qrImage: string;
  qrString: string;
  expiredAt: string;
}

// Payload yang dikirim WijayaPay ke callback URL
export interface WijayapayCallback {
  status: "paid" | "pending" | "expired";
  data: {
    updated_at: "string";
    payment_methode: "QRIS";
    total_dibayar: 1000;
    total_fee: 107;
    amount_received: 893;
    trx_reference: "WP260511222510770";
    ref_id: "klerek-J599-1778513109971";
  };
}

const buildSignature = (refId: string): string =>
  createHash("md5")
    .update(
      `${config.WIJAYAPAY_MERCHANT_ID}${config.WIJAYAPAY_API_KEY}${refId}`,
    )
    .digest("hex");

export const createQris = async (params: {
  refId: string;
  callbackUrl: string;
  nominal: number;
}): Promise<QrisResult> => {
  const signature = buildSignature(params.refId);

  const res = await fetch(`${config.WIJAYAPAY_BASE_URL}/transaction/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": signature,
    },
    body: JSON.stringify({
      code_merchant: config.WIJAYAPAY_MERCHANT_ID,
      api_key: config.WIJAYAPAY_API_KEY,
      code_payment: "QRIS",
      ref_id: params.refId,
      callback_url: params.callbackUrl,
      nominal: params.nominal, // nominal pembayaran dalam rupiah
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WijayaPay error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const data = json.data;

  return {
    refId: data.ref_id,
    qrImage: data.qr_image,
    qrString: data.qr_string,
    expiredAt: data.expired,
  };
};

// X-Signature = MD5(code_merchant + api_key + ref_id)
export const verifyCallbackSignature = (
  xSignature: string,
  refId: string,
): boolean => {
  return xSignature === buildSignature(refId);
};
