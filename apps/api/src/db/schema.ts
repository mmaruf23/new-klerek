import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  integer,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const store = pgTable('store', {
  id: varchar('id', { length: 4 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  branchId: varchar('branch_id', { length: 4 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscription = pgTable('subscription', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  storeId: varchar('store_id', { length: 4 })
    .notNull()
    .references(() => store.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Status: pending → paid | failed | expired
export const payment = pgTable('payment', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: varchar('invoice_id', { length: 100 }).notNull().unique(),
  storeId: varchar('store_id', { length: 4 })
    .notNull()
    .references(() => store.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  durationDays: integer('duration_days').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  qrisUrl: varchar('qris_url', { length: 500 }),
  note: varchar('note', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
});

export const storeRelations = relations(store, ({ many }) => ({
  subs: many(subscription),
  payments: many(payment),
}));

export const subsRelations = relations(subscription, ({ one }) => ({
  storee: one(store, {
    fields: [subscription.storeId],
    references: [store.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  store: one(store, {
    fields: [payment.storeId],
    references: [store.id],
  }),
}));

export type Store = InferSelectModel<typeof store>;
export type StoreInsert = InferInsertModel<typeof store>;

export type Subscription = InferSelectModel<typeof subscription>;
export type SubscriptionInsert = InferInsertModel<typeof subscription>;

export type Payment = InferSelectModel<typeof payment>;
export type PaymentInsert = InferInsertModel<typeof payment>;
