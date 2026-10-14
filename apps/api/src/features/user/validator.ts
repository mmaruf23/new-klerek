import { type ApiResponse, createUserSchema } from "@packages/contract";
import { validator } from "hono/validator";

export const createUserValidator = validator("json", (value, c) => {
  const result = createUserSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});
