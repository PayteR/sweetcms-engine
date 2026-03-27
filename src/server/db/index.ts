import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export type DrizzleDB = typeof db;

/** Transaction or DB — use this as param type for functions that accept either */
export type DrizzleDBOrTx = Parameters<
  Parameters<DrizzleDB['transaction']>[0]
>[0];

export type DbClient = DrizzleDB | DrizzleDBOrTx;
