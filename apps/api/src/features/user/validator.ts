import { validator } from "hono/validator";
import z from "zod";
import type { ApiResponse } from "../../types/response.js";

const createUserSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  password: z.string().min(3),
  email: z.email(),
  role: z.enum(["admin", "user"], { message: "Role harus admin atau user" }),
});

const balanceAdjustSchema = z.object({
  type: z.enum(["credit", "debit"], { message: "Tipe harus credit atau debit" }),
  amount: z.number().int().positive("Jumlah harus lebih dari 0"),
  note: z.string().max(255).optional(),
});

const roleUpdateSchema = z.object({
  role: z.enum(["admin", "user"], { message: "Role harus admin atau user" }),
});

export const createUserValidator = validator("json", (value, c) => {
  const result = createUserSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});

export const balanceAdjustValidator = validator("json", (value, c) => {
  const result = balanceAdjustSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});

export const roleUpdateValidator = validator("json", (value, c) => {
  const result = roleUpdateSchema.safeParse(value);
  if (!result.success) return c.json<ApiResponse>({ success: false, message: result.error.issues[0].message }, 400);

  return result.data;
});

export type BalanceAdjustInput = z.infer<typeof balanceAdjustSchema>
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>