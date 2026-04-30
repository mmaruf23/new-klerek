import { LoadConfig } from '../config.js';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';
import {
  store,
  subscription,
  storeRelations,
  subsRelations,
  users,
} from './schema.js';

const config = LoadConfig();

const isProd = config.NODE_ENV === 'production';
const connectionString = config.DB_URL;
const schema = { store, subscription, users, storeRelations, subsRelations };

export const db = isProd
  ? drizzleNeon({ client: neon(connectionString), schema })
  : drizzleNode({ client: new Pool({ connectionString }), schema });

export const isDBOK = !!db;
