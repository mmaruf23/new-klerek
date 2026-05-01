import { config } from "../config.js";
import { sql } from "drizzle-orm";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import {
  store,
  subscription,
  storeRelations,
  subsRelations,
  users,
} from "./schema.js";

const isProd = config.NODE_ENV === "production";
const connectionString = config.DATABASE_URL;
const schema = { store, subscription, users, storeRelations, subsRelations };

export const db = isProd
  ? drizzleNeon({ client: neon(connectionString), schema })
  : drizzleNode({ client: new Pool({ connectionString }), schema });

export const checkDB = async (): Promise<boolean> => {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
};
