import { drizzleSuperPool } from "../conn.js";
import { seeder as vtuberSeeder } from "./vtuberSeeder.js";
import { seeder as memberShipTierSeeder } from "./memberShipTierSeeder.js";
import { seeder as liveCategorySeeder } from "./liveCategorySeeder.js";

const seeder = async () => {
  await vtuberSeeder();
  await memberShipTierSeeder();
  await liveCategorySeeder();
};

seeder();
