import { drizzleSuperPool } from "../conn.js";
import { liveStreamCategoryTable } from "../schema.js";

const liveStreamCategoryData = [
  {
    name: "Membership",
  },
  {
    name: "Collab",
  },
  {
    name: "เปิดมือ",
  },
  {
    name: "Games",
  },
  {
    name: "Roleplay",
  },
  {
    name: "กองหนุบหนับ",
  },
  {
    name: "Birthday",
  },
  {
    name: "Soft ASMR/Voice",
  },
  {
    name: "ร้องเพลง",
  },
  {
    name: "อื่น ๆ",
  },
];

export const seeder = async () => {
  // delete everything from vtuber table
  try {
    await drizzleSuperPool.delete(liveStreamCategoryTable);
  } catch (error) {
    console.log(error);
    return;
  }

  // insert current vtuberData into vtuber table
  try {
    await drizzleSuperPool
      .insert(liveStreamCategoryTable)
      .values(liveStreamCategoryData);
  } catch (error) {
    console.log(error);
    return;
  }

  console.log("Seed vtubers successfully!");
  console.log(JSON.stringify(["lol 1", "lmao 2", "wtf 3"]));
};

seeder();
