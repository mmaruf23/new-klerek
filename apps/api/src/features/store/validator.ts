import z from "zod";
import { validator } from "hono/validator";
import { ApiResponse } from "../../types/response.js";

const referStoreSchema = z.object({
  referralCode: z
    .string()
    .length(6, "Kode referral harus 6 karakter")
    .regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka"),
});

export const referStoreValidator = validator('json', (value, c) => {
  const result = referStoreSchema.safeParse(value);
    if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
    return result.data;
})