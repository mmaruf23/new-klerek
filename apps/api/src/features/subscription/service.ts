import { time } from "@packages/contract";
import { db } from "../../db/client.js";
import { subscription, type SubscriptionInsert } from "../../db/schema.js";
import { sendLog } from "../../utils/telegram.js";

export const addSubscription = async (data: SubscriptionInsert) => {
  const [result] = await db.insert(subscription).values(data).returning();
  return result;
};

export const startTrial = async (storeId: string) => {
  const expiresAt = new Date(new Date().getTime() + 14 * time.DAY);
  const result = await db.insert(subscription).values({ storeId, expiresAt, isTrial: true });

  if (!result.rowCount) {
    // todo : ganti jadi notif ke bot kalau insert trial gagal
    await sendLog(`⚠️ Failed start trial for ${storeId}`);
  }
};
