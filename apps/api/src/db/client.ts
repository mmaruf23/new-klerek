import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  store,
  subscription,
  storeRelations,
  subsRelations,
} from './schema.js';

const connectionString = process.env.DATABASE_URL!;

export const db = drizzle({
  client: new Pool({ connectionString }),
  schema: { store, subscription, storeRelations, subsRelations },
});
