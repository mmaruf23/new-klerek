import { sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { store, type StoreInsert } from '../../db/schema.js';
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
  const store = await db.query.store.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
    with: {
      subs: {
        where(fields, operators) {
          return operators.gt(fields.expiresAt, sql`now()`);
        },
        orderBy(fields, operators) {
          return operators.desc(fields.expiresAt);
        },
      },
    },
  });

  return store;
};
export const getStoreByIDWithLatestSubs = async (id: string) => {
  const store = await db.query.store.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
    with: {
      subs: {
        limit: 1,
        orderBy(fields, operators) {
          return operators.desc(fields.expiresAt);
        },
      },
    },
  });

  return store;
};

export const addNewStore = async (values: StoreInsert) => {
  const result = await db.insert(store).values(values).onConflictDoNothing();
  if (!result.rowCount)
    throw Exception.ServerError('Failed add new store to database');
};
