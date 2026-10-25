import { z } from "zod";
import { validator } from "hono/validator";
import type { ApiResponse } from "../../types/response.js";

const loginAuthSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(1, "Password wajib diisi"),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, "Credential wajib diisi"),
});

const referStoreSchema = z.object({
  referralCode: z
    .string()
    .length(6, "Kode referral harus 6 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka"),
});

export type ReferStoreInput = z.infer<typeof referStoreSchema>;

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export type LoginAuthInput = z.infer<typeof loginAuthSchema>;

export const loginValidator = validator("json", (value, c) => {
  const result = loginAuthSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});

export const googleLoginValidator = validator("json", (value, c) => {
  const result = googleAuthSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});
