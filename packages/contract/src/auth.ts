import { z } from "zod";

export const loginAuthSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(1, "Credential wajib diisi"),
});

export const referStoreSchema = z.object({
  referralCode: z
    .string()
    .length(6, "Kode referral harus 6 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka"),
});

export type ReferStoreInput = z.infer<typeof referStoreSchema>;

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export type LoginAuthInput = z.infer<typeof loginAuthSchema>;

export interface ReferredStore {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: Date;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  referralCode: string | null;
  referredStores: ReferredStore[];
  totalBalance: number;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user" | "superadmin";
  };
  token: string;
}

export interface RefreshResponse {
  token: string;
}

export interface ReferStoreResponse {
  storeId: string;
  storeName: string;
  referrerName: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "user" | "admin" | "superadmin";
  referralCode: string | null;
  totalBalance: number;
  referredStoreCount: number;
  createdAt: Date;
}

export interface AdminUserDetail extends AdminUserItem {
  referredStores: ReferredStore[];
}

