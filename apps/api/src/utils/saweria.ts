import { config } from "../config.js";

// Endpoint internal Saweria (tidak terdokumentasi resmi) — hasil eksplorasi manual.
// Create:  POST {BASE}/donations/snap/{userId}         → { data: { id, qr_string, status: "PENDING", ... } }
// Status:  GET  {BASE}/donations/qris/snap/{donationId} → { data: { transaction_status: "PENDING" | "SUCCESS", ... } }

export type SaweriaStatus = "PENDING" | "SUCCESS";

export interface SaweriaDonation {
  id: string;
  qrString: string;
  amount: number;
  status: SaweriaStatus;
}

interface CreateDonationParams {
  amount: number;
  message: string; // dipakai sebagai invoiceId agar terlacak di dashboard Saweria
  donatorName: string;
  donatorEmail: string; // diinput kasir di frontend, wajib oleh Saweria
}

const jsonHeaders = { "Content-Type": "application/json" };

export const createDonation = async (params: CreateDonationParams): Promise<SaweriaDonation> => {
  if (!config.SAWERIA_USER_ID) throw new Error("SAWERIA_USER_ID belum diisi");

  const res = await fetch(`${config.SAWERIA_BASE_URL}/donations/snap/${config.SAWERIA_USER_ID}`, {
    method: "POST",
    headers: jsonHeaders,
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
    status: data.status,
  };
};

export const checkDonationStatus = async (donationId: string): Promise<SaweriaStatus> => {
  const res = await fetch(`${config.SAWERIA_BASE_URL}/donations/qris/snap/${donationId}`, {
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Saweria error ${res.status}: ${err}`);
  }

  const { data } = await res.json();
  return data?.transaction_status === "SUCCESS" ? "SUCCESS" : "PENDING";
};
