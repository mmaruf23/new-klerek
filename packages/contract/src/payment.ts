import { z } from "zod";
import { dataPrice } from "./subscription";

export const generatePaymentSchema = z.object({
  storeId: z
    .string()
    .length(4, "ID toko harus 4 karakter")
    .regex(/^[A-Z0-9]+$/, "ID toko hanya huruf kapital dan angka"),
  packageIndex: z
    .number({ message: "packageIndex harus angka" })
    .int()
    .min(0, "Paket tidak valid")
    .max(dataPrice.length - 1, "Paket tidak valid"),
  email: z.email("Email tidak valid").max(100, "Email terlalu panjang"),
});

export type GeneratePaymentInput = z.infer<typeof generatePaymentSchema>;

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface PaymentResponse {
  id: number;
  invoiceId: string;
  storeId: string;
  amount: number;
  durationDays: number;
  status: PaymentStatus;
  qrString: string | null;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
}
