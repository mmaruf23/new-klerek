import { eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, store, balance } from "../../db/schema.js";
import { Exception } from "../../error.js";
import type { AdminUserItem, AdminUserDetail, BalanceAdjustInput, RoleUpdateInput } from "@packages/contract";

interface ListUsersQuery {
  limit: number;
  offset: number;
  q?: string;
}

export const listUsers = async ({ limit, offset, q }: ListUsersQuery) => {
  const where = q
    ? or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))
    : undefined;

  const [total, rows] = await Promise.all([
    db.$count(users, where),
    db.query.users.findMany({
      where,
      limit,
      offset,
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    }),
  ]);

  if (!rows.length) return { data: [], total, limit, offset, hasNext: false };

  const userIds = rows.map((u) => u.id);
  const referralCodes = rows.map((u) => u.refferalCode).filter((c): c is string => !!c);

  const [balances, storeCounts] = await Promise.all([
    db
      .select({
        userId: balance.userId,
        total: sql<number>`sum(case when ${balance.type} = 'credit' then ${balance.amount} else -${balance.amount} end)`,
      })
      .from(balance)
      .where(inArray(balance.userId, userIds))
      .groupBy(balance.userId),
    referralCodes.length
      ? db
          .select({ referrerId: store.referrerId, count: sql<number>`count(*)` })
          .from(store)
          .where(inArray(store.referrerId, referralCodes))
          .groupBy(store.referrerId)
      : Promise.resolve([]),
  ]);

  const balanceMap = new Map(balances.map((b) => [b.userId, Number(b.total ?? 0)]));
  const storeCountMap = new Map(storeCounts.map((s) => [s.referrerId, Number(s.count)]));

  const data: AdminUserItem[] = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    role: u.role,
    referralCode: u.refferalCode,
    totalBalance: balanceMap.get(u.id) ?? 0,
    referredStoreCount: u.refferalCode ? (storeCountMap.get(u.refferalCode) ?? 0) : 0,
    createdAt: u.createdAt,
  }));

  return { data, total, limit, offset, hasNext: offset + limit < total };
};

export const getUserDetail = async (userId: string): Promise<AdminUserDetail> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw Exception.NotFound("User tidak ditemukan");

  const [referredStores, balanceResult] = await Promise.all([
    user.refferalCode
      ? db.query.store.findMany({
          where: eq(store.referrerId, user.refferalCode),
          columns: { id: true, name: true, branchId: true, createdAt: true },
        })
      : Promise.resolve([]),
    db
      .select({
        total: sql<number>`sum(case when ${balance.type} = 'credit' then ${balance.amount} else -${balance.amount} end)`,
      })
      .from(balance)
      .where(eq(balance.userId, userId)),
  ]);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    referralCode: user.refferalCode,
    totalBalance: Number(balanceResult[0]?.total ?? 0),
    referredStoreCount: referredStores.length,
    referredStores,
    createdAt: user.createdAt,
  };
};

export const adjustUserBalance = async (userId: string, input: BalanceAdjustInput) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw Exception.NotFound("User tidak ditemukan");

  if (input.type === "debit") {
    const [row] = await db
      .select({
        total: sql<number>`sum(case when ${balance.type} = 'credit' then ${balance.amount} else -${balance.amount} end)`,
      })
      .from(balance)
      .where(eq(balance.userId, userId));

    if ((Number(row?.total ?? 0)) < input.amount) throw Exception.BadRequest("Balance tidak mencukupi");
  }

  const [entry] = await db
    .insert(balance)
    .values({ userId, type: input.type, amount: input.amount, note: input.note })
    .returning();

  return entry;
};

export const updateUserRole = async (userId: string, input: RoleUpdateInput) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw Exception.NotFound("User tidak ditemukan");

  // Role superadmin dilindungi: hanya lewat seed bootstrap, tidak lewat panel.
  if (user.role === "superadmin") throw Exception.Forbidden("Role superadmin tidak bisa diubah dari panel");

  if (user.role === input.role) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  const [updated] = await db
    .update(users)
    .set({ role: input.role, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return { id: updated.id, name: updated.name, email: updated.email, role: updated.role };
};
