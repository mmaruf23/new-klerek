import { config } from "../config.js";
import { sql } from "drizzle-orm";
import { sendLog } from "../utils/telegram.js";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import {
  store,
  subscription,
  payment,
  storeRelations,
  subsRelations,
  paymentRelations,
  users,
  balance,
  balanceRelations,
} from "./schema.js";

const isProd = config.NODE_ENV === "production";
const connectionString = config.DATABASE_URL;
const schema = {
  store,
  subscription,
  payment,
  users,
  balance,
  storeRelations,
  subsRelations,
  paymentRelations,
  balanceRelations,
};

export const db = isProd
  ? drizzleNeon({ client: neon(connectionString), schema })
  : drizzleNode({ client: new Pool({ connectionString }), schema });

export const checkDB = async (): Promise<boolean> => {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("DB health check failed:", msg);
    await sendLog(`🔴 DB HEALTH CHECK FAILED\n${msg}`);
    return false;
  }
};
