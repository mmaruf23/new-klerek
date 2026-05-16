import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { payment, subscription, store, users, balance, type PaymentInsert } from '../../db/schema.js';

export const createPendingPayment = async (data: PaymentInsert) => {
  const [result] = await db.insert(payment).values(data).returning();
  return result;
};

export const updatePaymentQris = async (id: number, qrisUrl: string) => {
  const [result] = await db
    .update(payment)
    .set({ qrisUrl })
    .where(eq(payment.id, id))
    .returning();
  return result;
};

export const getPaymentByInvoiceId = async (invoiceId: string) => {
  return db.query.payment.findFirst({
    where: eq(payment.invoiceId, invoiceId),
  });
};

export const getPaymentsByStoreId = async (storeId: string) => {
  return db.query.payment.findMany({
    where: eq(payment.storeId, storeId),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
};

// Dipanggil saat callback WijayaPay masuk dengan status "paid".
// Update payment ke paid, lalu extend subscription store.
export const fulfillPayment = async (invoiceId: string, paidAt: Date) => {
  const p = await getPaymentByInvoiceId(invoiceId);
  if (!p || p.status !== 'pending') return null;

  // Update status payment
  const [updated] = await db
    .update(payment)
    .set({ status: 'paid', paidAt })
    .where(eq(payment.invoiceId, invoiceId))
    .returning();

  // Cari expiry aktif store — extend dari sana, atau dari sekarang jika sudah expired
  const activeSub = await db.query.subscription.findFirst({
    where: eq(subscription.storeId, p.storeId),
    orderBy: (s, { desc }) => [desc(s.expiresAt)],
  });

  const baseTime =
    activeSub && activeSub.expiresAt.getTime() > Date.now()
      ? activeSub.expiresAt.getTime()
      : Date.now();

  const expiresAt = new Date(baseTime + p.durationDays * 24 * 60 * 60 * 1000);

  const [newSub] = await db
    .insert(subscription)
    .values({ storeId: p.storeId, expiresAt })
    .returning();

  // Komisi referral 50% — hanya jika store punya referrer
  const storeData = await db.query.store.findFirst({
    where: eq(store.id, p.storeId),
  });

  if (storeData?.referrerId) {
    const referrer = await db.query.users.findFirst({
      where: eq(users.refferalCode, storeData.referrerId),
    });

    if (referrer) {
      await db.insert(balance).values({
        userId: referrer.id,
        type: 'credit',
        amount: Math.floor(p.amount * 0.5),
        paymentId: updated.id,
      });
    }
  }

  return { payment: updated, subscription: newSub };
};

export const expirePayment = async (invoiceId: string) => {
  const [result] = await db
    .update(payment)
    .set({ status: 'expired' })
    .where(eq(payment.invoiceId, invoiceId))
    .returning();
  return result;
};
