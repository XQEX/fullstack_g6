import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { super_pool } from "./conn.js";

async function main() {
  await migrate(drizzle(super_pool), {
    migrationsFolder: "./src/db/migrations",
    migrationsSchema: "drizzle", // Default schema
  });
  await super_pool.end();
}

main();
