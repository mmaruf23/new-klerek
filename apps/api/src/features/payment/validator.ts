import { type ApiResponse, generatePaymentSchema } from "@packages/contract";
import { validator } from "hono/validator";

export const createPaymenValidator = validator("json", (value, c) => {
  const result = generatePaymentSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);
  return result.data;
});
