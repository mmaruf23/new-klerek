import { z } from "zod";

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

export const balanceAdjustSchema = z.object({
  type: z.enum(["credit", "debit"], { message: "Tipe harus credit atau debit" }),
  amount: z.number().int().positive("Jumlah harus lebih dari 0"),
  note: z.string().max(255).optional(),
});

export type BalanceAdjustInput = z.infer<typeof balanceAdjustSchema>;

export const roleUpdateSchema = z.object({
  role: z.enum(["admin", "user"], { message: "Role harus admin atau user" }),
});

export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
