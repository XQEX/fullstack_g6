import { url, super_url } from "./url.js";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

// <Pool connection>

const { Pool } = pg;

//appuser
export const pool = new Pool({
  connectionString: url,
});

//postgres(super-user)
export const super_pool = new Pool({
  connectionString: super_url,
});

// <Connect drizzle to pool>

//appuser
export const drizzlePool = drizzle(pool, { schema: schema, logger: true });

//postgres(super-user)
export const drizzleSuperPool = drizzle(super_pool, {
  schema: schema,
  logger: true,
});
