import z from "zod";

export const roleUpdateSchema = z.object({
  role: z.enum(["admin", "user"], { message: "Role harus admin atau user" }),
});

export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;

export const createUserSchema = z.object({
  name: z.string().min(3),
  username: z.string().min(3),
  password: z.string().min(3),
  email: z.email(),
  role: z.enum(["admin", "user"], { message: "Role harus admin atau user" }),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const balanceAdjustSchema = z.object({
  type: z.enum(["credit", "debit"], { message: "Tipe harus credit atau debit" }),
  amount: z.number().int().positive("Jumlah harus lebih dari 0"),
  note: z.string().max(255).optional(),
});

export type BalanceAdjustInput = z.infer<typeof balanceAdjustSchema>;
