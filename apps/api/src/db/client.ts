import 'dotenv/config';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { neon } from '@neondatabase/serverless';

const isProd = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL!;

export const db = isProd
  ? drizzleNeon({
      client: neon(connectionString),
      schema,
    })
  : drizzlePg({
      client: new Pool({ connectionString }),
      schema,
    });
