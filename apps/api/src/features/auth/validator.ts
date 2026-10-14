import { type ApiResponse, loginAuthSchema } from "@packages/contract";
import { validator } from "hono/validator";

export const loginValidator = validator("json", (value, c) => {
  const result = loginAuthSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});
