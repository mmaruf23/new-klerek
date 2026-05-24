import { desc, eq, gt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { store, subscription, users, balance, type StoreInsert } from "../../db/schema.js";
import { Exception } from "../../error.js";
import type { StoreResponse } from "@packages/contract";
import { dataPrice } from "../subscription/data.js";

interface PageQuery {
  limit: number;
  offset: number;
}

export const getAllStore = async ({ limit, offset }: PageQuery) => {
  const total = await db.$count(store);
  if (!total) {
    return { data: [], total, limit, offset, hasNext: false };
  }
  const stores = await db.query.store.findMany({
    limit,
    offset,
    with: {
      subs: { orderBy: desc(subscription.expiresAt), limit: 1 },
    },
  });
  return { data: stores, total, limit, offset, hasNext: offset + limit < total };
};

export const getStorePublicInfo = async (id: string): Promise<{ id: string; name: string } | undefined> => {
  return db.query.store.findFirst({
    where: eq(store.id, id),
    columns: { id: true, name: true },
  });
};

export const getStoreByIDWithLatestSubs = async (id: string): Promise<StoreResponse | undefined> => {
  const storeResult = await db.query.store.findFirst({
    where: eq(store.id, id),
    with: {
      subs: {
        where: gt(subscription.expiresAt, new Date()),
        orderBy: desc(subscription.expiresAt),
        limit: 1,
      },
    },
  });

  return storeResult;
};

export const setStoreReferrer = async (storeId: string, referralCode: string) => {
  const storeData = await db.query.store.findFirst({ where: eq(store.id, storeId) });
  if (!storeData) throw Exception.NotFound("toko tidak ditemukan");
  if (storeData.referrerId) throw Exception.Validation("toko sudah memiliki referrer");

  const referrer = await db.query.users.findFirst({ where: eq(users.refferalCode, referralCode) });
  if (!referrer) throw Exception.NotFound("kode referral tidak valid");

  await db.update(store).set({ referrerId: referralCode }).where(eq(store.id, storeId));

  return { storeId, storeName: storeData.name, referrerName: referrer.name };
};

export const addNewStore = async (values: StoreInsert) => {
  const result = await db.insert(store).values(values).onConflictDoNothing();
  if (!result.rowCount) throw Exception.ServerError("Failed add new store to database");
};

export const getUserBalance = async (userId: string): Promise<number> => {
  const rows = await db.query.balance.findMany({
    where: eq(balance.userId, userId),
  });
  return rows.reduce((acc, r) => acc + (r.type === "credit" ? r.amount : -r.amount), 0);
};

export const addSubscriptionByBalance = async (
  userId: string,
  userRole: "user" | "admin" | "superadmin",
  storeId: string,
  packageIndex: number,
) => {
  const pkg = dataPrice[packageIndex];
  if (!pkg) throw Exception.BadRequest("invalid package index");

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw Exception.Unauthorized();

  const storeData = await db.query.store.findFirst({ where: eq(store.id, storeId) });
  if (!storeData) throw Exception.NotFound("store not found");

  if (userRole === "user" && storeData.referrerId !== user.refferalCode) throw Exception.Unauthorized();

  if (userRole !== "superadmin") {
    const currentBalance = await getUserBalance(userId);
    if (currentBalance < pkg.price) throw Exception.BadRequest("insufficient balance");

    await db.insert(balance).values({
      userId,
      type: "debit",
      amount: pkg.price,
    });
  }

  const activeSub = await db.query.subscription.findFirst({
    where: eq(subscription.storeId, storeId),
    orderBy: (s, { desc }) => [desc(s.expiresAt)],
  });

  const baseTime = activeSub && activeSub.expiresAt.getTime() > Date.now() ? activeSub.expiresAt.getTime() : Date.now();

  const totalMs = (pkg.time + (pkg.bonus ?? 0)) * 1000;
  const expiresAt = new Date(baseTime + totalMs);

  const [newSub] = await db.insert(subscription).values({ storeId, expiresAt }).returning();

  return { subscription: newSub, debitAmount: userRole !== "superadmin" ? pkg.price : 0 };
};
