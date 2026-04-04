import { DAY } from '../../constant/time.js';
import { db } from '../../db/client.js';
import { subscription, type SubscriptionInsert } from '../../db/schema.js';

export const addSubscription = async (data: SubscriptionInsert) => {
  const [result] = await db.insert(subscription).values(data).returning();
  return result;
};

export const startTrial = async (storeId: string) => {
  const expiresAt = new Date(new Date().getTime() + 7 * DAY);
  const result = await db.insert(subscription).values({ storeId, expiresAt });

  if (!result.rowCount) {
    // todo : ganti jadi notif ke bot kalau insert trial gagal
    console.error(`failed start trial for ${storeId}`);
  }
};
