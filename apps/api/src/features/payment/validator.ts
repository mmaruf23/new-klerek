import { validator } from "hono/validator";
import z from "zod";
import { dataPrice } from "../../constant/price.js";
import type { ApiResponse } from "../../types/response.js";

const generatePaymentSchema = z.object({
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


export const generatePaymentValidator = validator("json", (value, c) => {
  const result = generatePaymentSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
  return result.data;
});
