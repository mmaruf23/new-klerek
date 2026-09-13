import { config } from "../config.js";

// Endpoint internal Saweria (tidak terdokumentasi resmi) — hasil eksplorasi manual.
// Create: POST {BASE}/donations/snap/{userId} → { data: { id, qr_string, status: "PENDING", ... } }
// Konfirmasi pembayaran datang lewat webhook (lihat SaweriaWebhookPayload), bukan polling.

export interface SaweriaDonation {
  id: string;
  qrString: string;
  amount: number;
}

interface CreateDonationParams {
  amount: number;
  message: string; // dipakai sebagai catatan agar terlacak di dashboard Saweria
  donatorName: string;
  donatorEmail: string; // diinput kasir di frontend, wajib oleh Saweria
}

// Body yang dikirim Saweria ke webhook URL setiap ada donasi masuk.
// `id` = donation id = payment.invoiceId di DB kita.
export interface SaweriaWebhookPayload {
  version: string;
  created_at: string;
  id: string;
  type: "donation";
  amount_raw: number;
  cut: number;
  donator_name: string;
  donator_email: string;
  donator_is_user: boolean;
  message?: string;
}

export const createDonation = async (params: CreateDonationParams): Promise<SaweriaDonation> => {
  if (!config.SAWERIA_USER_ID) throw new Error("SAWERIA_USER_ID belum diisi");

  const res = await fetch(`${config.SAWERIA_BASE_URL}/donations/snap/${config.SAWERIA_USER_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agree: true,
      notUnderage: true,
      message: params.message,
      amount: String(params.amount),
      payment_type: "qris",
      vote: "",
      currency: "IDR",
      customer_info: {
        first_name: params.donatorName,
        email: params.donatorEmail,
        phone: "",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Saweria error ${res.status}: ${err}`);
  }

  const { data } = await res.json();
  if (!data?.id || !data?.qr_string) throw new Error("Saweria: response tidak berisi id/qr_string");

  return {
    id: data.id,
    qrString: data.qr_string,
    amount: data.amount_raw,
  };
};

// Webhook Saweria tidak punya signature — diamankan dengan shared secret di query string (?token=...)
// yang diset pada URL webhook di dashboard Saweria.
export const verifyWebhookToken = (token: string | undefined): boolean =>
  !!config.SAWERIA_WEBHOOK_TOKEN && token === config.SAWERIA_WEBHOOK_TOKEN;
