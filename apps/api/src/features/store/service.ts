import { desc, eq, gt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { store, subscription, type StoreInsert } from "../../db/schema.js";
import { Exception } from "../../error.js";
import type { StoreResponse } from "@packages/contract";

interface PageQuery {
  limit: number;
  offset: number;
}

export const getAllStore = async ({ limit, offset }: PageQuery) => {
  const total = await db.$count(store);
  if (!total) {
    return { data: [], total, limit, offset, hasNext: false };
  }
  const stores = await db.query.store.findMany({ limit, offset });
  return { data: stores, total, limit, offset, hasNext: offset + limit < total };
};

export const getStoreByIDWithLatestSubs = async (id: string): Promise<StoreResponse | undefined> => {
  const storeResult = await db.query.store.findFirst({
    where: eq(store.id, id),
    with: {
      subs: {
        where: gt(subscription.expiresAt, new Date()),
        orderBy: desc(subscription.expiresAt),
      },
    },
  });

  return storeResult;
};

export const addNewStore = async (values: StoreInsert) => {
  const result = await db.insert(store).values(values).onConflictDoNothing();
  if (!result.rowCount) throw Exception.ServerError("Failed add new store to database");
};
