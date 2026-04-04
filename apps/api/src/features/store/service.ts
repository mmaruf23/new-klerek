import { desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { store, subscription, type StoreInsert } from '../../db/schema.js';
import { Exception } from '../../error.js';

interface PageQuery {
  limit: number;
  offset: number;
}

export const getAllStore = async ({ limit, offset }: PageQuery) => {
  const count = await db.$count(store);
  if (!count) {
    return { data: [], count };
  }
  const stores = await db.query.store.findMany({ limit, offset });
  // todo : bikin meta pagination disini
  return { data: stores, count };
};

export const getStoreByIDWithActiveSubsDescending = async (id: string) => {
  const storeResult = await db.query.store.findFirst({
    where: eq(store.id, id),
    with: {
      subs: {
        where: gt(subscription.expiresAt, new Date()),
        orderBy: desc(subscription.expiresAt),
      },
    },
  });

  if (storeResult && !storeResult.subs) {
    storeResult.subs = [];
  }

  return storeResult;
};
export const getStoreByIDWithLatestSubs = async (id: string) => {
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
  if (!result.rowCount)
    throw Exception.ServerError('Failed add new store to database');
};
