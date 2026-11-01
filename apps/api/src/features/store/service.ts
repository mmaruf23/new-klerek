import { and, count, desc, eq, exists, gt, ilike, not, or, sql } from "drizzle-orm";
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
  userId: string;
  role?: User["role"];
}

/**
 * Filter akses data toko berbasis role dari klaim JWT.
 * - superadmin: `undefined` → tanpa filter (melihat & mengelola semua toko).
 * - admin & user: hanya toko yang `referrerId`-nya sama dengan kode referral miliknya.
 *
 * Subquery kode referral mengembalikan nol baris bila user tidak punya kode referral,
 * sehingga hasilnya kosong (perilaku sama seperti sebelumnya).
 */
export const storeScope = (userId: string, role: User["role"] | undefined) => {
  if (role === "superadmin") return undefined;

  const userReferralCode = db
    .select({ code: users.refferalCode })
    .from(users)
    .where(eq(users.id, userId));

  return eq(store.referrerId, userReferralCode);
};

export const countStore = async ({ userId, role }: Required<UserQuery>) => {
  const now = new Date();

  // subscription terakhir per toko → tepat satu baris per toko (expiresAt terbaru, lalu id terbesar)
  const lastSubs = db
    .selectDistinctOn([subscription.storeId], {
      storeId: subscription.storeId,
      isTrial: subscription.isTrial,
      expiresAt: subscription.expiresAt,
    })
    .from(subscription)
    .orderBy(subscription.storeId, desc(subscription.expiresAt), desc(subscription.id))
    .as("last_subs");

  // toko tanpa subscription → expiresAt NULL → tidak aktif, dihitung expired di bawah
  const [result] = await db
    .select({
      total: count(),
      active: count(sql`case when ${lastSubs.expiresAt} > ${now} then 1 end`),
      trial: count(sql`case when ${lastSubs.expiresAt} > ${now} and ${lastSubs.isTrial} = true then 1 end`),
    })
    .from(store)
    .leftJoin(lastSubs, eq(store.id, lastSubs.storeId))
    .where(storeScope(userId, role));

  const total = result?.total ?? 0;
  const active = result?.active ?? 0;

  return { total, active, trial: result?.trial ?? 0, expired: total - active };
};

export const getAllStore = async ({ limit, offset, search, status, userId, role }: UserQuery & PageQuery) => {
  const empty = { data: [], total: 0, limit, offset, hasNext: false };

  // toko aktif = punya minimal satu subscription yang belum expired
  const hasActiveSub = exists(
    db
      .select({ one: sql`1` })
      .from(subscription)
      .where(and(eq(subscription.storeId, store.id), gt(subscription.expiresAt, new Date()))),
  );

  // superadmin melihat semua toko; admin & user hanya melihat toko referral miliknya
  const where = and(
    storeScope(userId, role),
    search ? or(ilike(store.name, `%${search}%`), eq(store.id, search)) : undefined,
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

  // superadmin bebas; admin & user hanya boleh menambah paket untuk toko referral miliknya
  if (userRole !== "superadmin" && storeData.referrerId !== user.refferalCode)
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
