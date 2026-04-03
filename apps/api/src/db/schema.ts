import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';
import { pgTable, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

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

export const storeRelations = relations(store, ({ many }) => ({
  subs: many(subscription),
}));

export const subsRelations = relations(subscription, ({ one }) => ({
  storee: one(store, {
    fields: [subscription.storeId],
    references: [store.id],
  }),
}));

export type Store = InferSelectModel<typeof store>;
export type StoreInsert = InferInsertModel<typeof store>;

export type Subscription = InferSelectModel<typeof subscription>;
export type SubscriptionInsert = InferInsertModel<typeof subscription>;
