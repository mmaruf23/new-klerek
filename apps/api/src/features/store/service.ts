import { and, count, desc, eq, exists, gt, ilike, max, not, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { store, subscription, users, balance, type StoreInsert, type User } from "../../db/schema.js";
import { Exception } from "../../error.js";
import { dataPrice } from "../subscription/data.js";

export type StoreStatusFilter = "active" | "expired";

interface PageQuery {
  limit: number;
  offset: number;
  search?: string;
  status?: StoreStatusFilter;
}

interface UserQuery {
  userId?: string;
  role?: User["role"];
}

export const countStore = async ({ userId, role }: Required<UserQuery>) => {
  const isSuperAdmin = role === "superadmin";

  const storeSubscriptions = db.$with("store_subs").as(
    db
      .select({
        storeId: subscription.storeId,
        // True jika di tabel subscription ada minimal satu data yang isTrial-nya true
        isTrial: sql`bool_or(${subscription.isTrial})`.as("isTrial"),
        lastSubs: max(subscription.expiresAt).as("lastSubscription"),
      })
      .from(subscription)
      .groupBy(subscription.storeId),
  );

  try {
    const [result] = await db
      .with(storeSubscriptions)
      .select({
        total: count(),
        active: count(sql`case when ${storeSubscriptions.lastSubs} >= NOW() then 1 end`),
        trial: count(
          sql`case when ${storeSubscriptions.lastSubs} >= NOW() and ${storeSubscriptions.isTrial} = true then 1 end`,
        ),
        expired: count(sql`case when ${storeSubscriptions.lastSubs} < NOW() then 1 end`),
      })
      .from(store)
      .leftJoin(storeSubscriptions, eq(store.id, storeSubscriptions.storeId))
      .leftJoin(users, eq(users.refferalCode, store.referrerId))
      .where(!isSuperAdmin ? eq(users.id, userId) : undefined);

    return result;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) throw Exception.ServerError();
  }
};

export const getAllStore = async ({ limit, offset, search, status, userId }: UserQuery & PageQuery) => {
  const empty = { data: [], total: 0, limit, offset, hasNext: false };

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId ?? ""),
  });
  if (!user) return empty;

  // user biasa hanya melihat toko referral miliknya; admin & superadmin melihat semua
  const isUser = user.role === "user";
  if (isUser && !user.refferalCode) return empty;

  // toko aktif = punya minimal satu subscription yang belum expired
  const hasActiveSub = exists(
    db
      .select({ one: sql`1` })
      .from(subscription)
      .where(and(eq(subscription.storeId, store.id), gt(subscription.expiresAt, new Date()))),
  );

  const where = and(
    search ? or(ilike(store.name, `%${search}%`), eq(store.id, search)) : undefined,
    isUser ? eq(store.referrerId, user.refferalCode!) : undefined,
    status === "active" ? hasActiveSub : status === "expired" ? not(hasActiveSub) : undefined,
  );

  const total = await db.$count(store, where);
  if (!total) return empty;

  const stores = await db.query.store.findMany({
    limit,
    offset,
    where,
    // store.id sebagai tie-breaker agar offset stabil (tidak ada toko dobel/terlewat antar halaman)
    orderBy: [desc(store.createdAt), store.id],
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

export const getStoreByIDWithLatestSubs = async (id: string) => {
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

/** ID toko yang direferral user — dipakai untuk membatasi akses data toko. */
export const getReferredStoreIds = async (userId: string): Promise<string[]> => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { refferalCode: true },
  });
  if (!user?.refferalCode) return [];

  const rows = await db.query.store.findMany({
    where: eq(store.referrerId, user.refferalCode),
    columns: { id: true },
  });

  return rows.map((r) => r.id);
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

  if (userRole === "user" && storeData.referrerId !== user.refferalCode)
    throw Exception.Forbidden("Toko ini bukan referral Anda");

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
