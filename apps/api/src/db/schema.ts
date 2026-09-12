import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  integer,
  uuid,
  pgEnum,
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const enumRole = pgEnum("role", ["user", "admin", "superadmin"]);
export const enumBalanceType = pgEnum("balance_type", ["credit", "debit"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  googleId: varchar("google_id", { length: 255 }).notNull().unique(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: enumRole().notNull().default("user"),
  refferalCode: varchar("referal_code", { length: 10 }).unique(),
});

export const store = pgTable("store", {
  id: varchar("id", { length: 4 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  branchId: varchar("branch_id", { length: 4 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  referrerId: varchar("referrer_id", { length: 10 }).references(() => users.refferalCode, { onDelete: "set null" }),
});

export const subscription = pgTable("subscription", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  storeId: varchar("store_id", { length: 4 })
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  isTrial: boolean("is_trial"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Status: pending → paid | failed | expired
export const payment = pgTable("payment", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: varchar("invoice_id", { length: 100 }).notNull().unique(),
  storeId: varchar("store_id", { length: 4 })
    .notNull()
    .references(() => store.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  durationDays: integer("duration_days").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  qrisUrl: varchar("qris_url", { length: 500 }),
  note: varchar("note", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const balance = pgTable("balance", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: enumBalanceType().notNull(),
  amount: integer("amount").notNull(),
  note: varchar("note", { length: 255 }),
  paymentId: integer("payment_id").references(() => payment.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rekap harian hasil upload — satu baris per (toko, kasir, tanggal). Upload ulang = upsert.
export const dailySummary = pgTable(
  "daily_summary",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    storeId: varchar("store_id", { length: 4 })
      .notNull()
      .references(() => store.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 8 }).notNull(),
    dateTx: date("date_tx").notNull(),
    totalFaktur: integer("total_faktur").notNull(),
    memberFaktur: integer("member_faktur").notNull().default(0),
    totalCash: integer("total_cash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("daily_summary_store_date_user_uq").on(t.storeId, t.dateTx, t.userId)],
);

export const storeRelations = relations(store, ({ many }) => ({
  subs: many(subscription),
  payments: many(payment),
  dailySummaries: many(dailySummary),
}));

export const dailySummaryRelations = relations(dailySummary, ({ one }) => ({
  store: one(store, {
    fields: [dailySummary.storeId],
    references: [store.id],
  }),
}));

export const subsRelations = relations(subscription, ({ one }) => ({
  store: one(store, {
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

export const balanceRelations = relations(balance, ({ one }) => ({
  user: one(users, {
    fields: [balance.userId],
    references: [users.id],
  }),
  payment: one(payment, {
    fields: [balance.paymentId],
    references: [payment.id],
  }),
}));

export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;

export type Balance = InferSelectModel<typeof balance>;
export type BalanceInsert = InferInsertModel<typeof balance>;

export type Store = InferSelectModel<typeof store>;
export type StoreInsert = InferInsertModel<typeof store>;

export type Subscription = InferSelectModel<typeof subscription>;
export type SubscriptionInsert = InferInsertModel<typeof subscription>;

export type Payment = InferSelectModel<typeof payment>;
export type PaymentInsert = InferInsertModel<typeof payment>;

export type DailySummary = InferSelectModel<typeof dailySummary>;
export type DailySummaryInsert = InferInsertModel<typeof dailySummary>;
