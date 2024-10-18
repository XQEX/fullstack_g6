import { drizzleSuperPool } from "../conn.js";
import { membershipTierTable } from "../schema.js";

const membershipTierData = [
  {
    vtuber_name: "Beta AMI",
    tier: "1" as "1",
    tierName: "บลูเบลล์ตัวน้อย",
  },
  {
    vtuber_name: "Beta AMI",
    tier: "2" as "2",
    tierName: "เจ้าความน่ารักบลูเบลล์",
  },
  {
    vtuber_name: "Beta AMI",
    tier: "3" as "3",
    tierName: "บลูเบลล์หวานใจ",
  },
  {
    vtuber_name: "Beta AMI",
    tier: "4" as "4",
    tierName: "บลูเบลล์สุดที่รัก",
  },
  {
    vtuber_name: "Xonebu X’thulhu",
    tier: "1" as "1",
    tierName: "แมนต้าคนเก่ง",
  },
  {
    vtuber_name: "Xonebu X’thulhu",
    tier: "2" as "2",
    tierName: "แมนต้าสุดเท่",
  },
  {
    vtuber_name: "Xonebu X’thulhu",
    tier: "3" as "3",
    tierName: "แมนต้าที่โก้ไม่เบา",
  },
  {
    vtuber_name: "Xonebu X’thulhu",
    tier: "4" as "4",
    tierName: "แมนต้าที่เฟี้ยวกว่าใคร",
  },
  {
    vtuber_name: "Kumoku Tsururu",
    tier: "1" as "1",
    tierName: "ห่วงยางไซส์ S",
  },
  {
    vtuber_name: "Kumoku Tsururu",
    tier: "2" as "2",
    tierName: "ห่วงยางไซส์ M",
  },
  {
    vtuber_name: "Kumoku Tsururu",
    tier: "3" as "3",
    tierName: "ห่วงยางไซส์ L",
  },
  {
    vtuber_name: "Kumoku Tsururu",
    tier: "4" as "4",
    tierName: "ห่วงยางไซส์ XL",
  },
  {
    vtuber_name: "Mild-R",
    tier: "1" as "1",
    tierName: "MyHoneyหวานๆ",
  },
  {
    vtuber_name: "Mild-R",
    tier: "2" as "2",
    tierName: "MyHoneyหวานมาก",
  },
  {
    vtuber_name: "Mild-R",
    tier: "3" as "3",
    tierName: "MyHoneyหวานสุดใจ",
  },
  {
    vtuber_name: "Mild-R",
    tier: "4" as "4",
    tierName: "MyHoneyหวานจนร้องขอชีวิต",
  },
  {
    vtuber_name: "Debirun",
    tier: "1" as "1",
    tierName: "พลทหารดัสทีเรี่ยน",
  },
  {
    vtuber_name: "Debirun",
    tier: "2" as "2",
    tierName: "กัปตันดัสทีเรี่ยน",
  },
  {
    vtuber_name: "Debirun",
    tier: "3" as "3",
    tierName: "จอมพลดัสทีเรี่ยน",
  },
  {
    vtuber_name: "Debirun",
    tier: "4" as "4",
    tierName: "ดัสทีเรี่ยนที่รัก",
  },
  {
    vtuber_name: "T-Reina Ashyra",
    tier: "1" as "1",
    tierName: "แตงกวาพึ่งเด็ดออกจากสวน",
  },
  {
    vtuber_name: "T-Reina Ashyra",
    tier: "2" as "2",
    tierName: "แตงกวาดอง",
  },
  {
    vtuber_name: "T-Reina Ashyra",
    tier: "3" as "3",
    tierName: "แตงกวาพันปี",
  },
  {
    vtuber_name: "T-Reina Ashyra",
    tier: "4" as "4",
    tierName: "แตงกวาดึกดำบรรพ์",
  },
];

export const seeder = async () => {
  // delete everything from vtuber table
  try {
    await drizzleSuperPool.delete(membershipTierTable);
  } catch (error) {
    console.log(error);
    return;
  }

  // insert current vtuberData into vtuber table
  try {
    await drizzleSuperPool
      .insert(membershipTierTable)
      .values(membershipTierData);
  } catch (error) {
    console.log(error);
    return;
  }

  console.log("Seed vtubers successfully!");
};

seeder();
