import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username wajib diisi"),
  password: z.string().min(6, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const referStoreSchema = z.object({
  referralCode: z
    .string()
    .length(6, "Kode referral harus 6 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka"),
});

export type ReferStoreInput = z.infer<typeof referStoreSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export interface ReferredStore {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: Date;
}

export interface ProfileResponse {
  id: string;
  name: string;
  username: string;
  role: string;
  referralCode: string | null;
  referredStores: ReferredStore[];
  totalBalance: number;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    username: string;
    role: "admin" | "user" | "superadmin";
  };
  token: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  username: string;
  referralCode: string | null;
}

export interface ReferStoreResponse {
  storeId: string;
  storeName: string;
  referrerName: string;
}
