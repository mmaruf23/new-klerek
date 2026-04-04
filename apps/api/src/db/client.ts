import 'dotenv/config';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import {
  store,
  subscription,
  storeRelations,
  subsRelations,
} from './schema.js';

const isProd = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL!;
const schema = { store, subscription, storeRelations, subsRelations };

export const db = isProd
  ? drizzleNeon({ client: neon(connectionString), schema })
  : drizzleNode({ client: new Pool({ connectionString }), schema });
