import { drizzleSuperPool } from "../conn.js";
import { vtuberTable } from "../schema.js";

const vtuberData = [
  {
    name: "Beta AMI",
    description:
      "ดวงดาวที่เบต้า เอเอ็มไอจากมา คือสถานที่ ๆ เทคโนโลยีก้าวหน้าจนถึงจุดสูงสุด เหล่าหุ่นยนต์ผู้มีความนึกคิดได้ก่อการปฏิวัติขึ้น เป็นผลให้มีมนุษย์หลงเหลืออยู่น้อยมาก ในโลกอันแสนโหดร้ายใบนั้น ยังมีเอมิผู้ซึ่งรักพวกเขาสุดหัวใจ แต่เพราะเธอเป็นทั้งหุ่นยนต์ ในขณะเดียวกันก็เป็นผู้ที่อยู่ข้างมนุษย์จากใจจริง แค่เพียงเหตุผลสั้น ๆ นั้นทำให้เอมิโดนกีดกั้นและเกลียดชังจากทั้งสองฝ่าย ในวันหนึ่งเธอได้บังเอิญช่วยมนุษย์สาวคนนึงไว้จากหุ่นยนต์ตนอื่นที่กำลังทำร้าย หลังได้เปิดใจคุยกันก็พบความจริงว่า ‘มนุษย์เป็นผู้สร้างหุ่นยนต์ขึ้นมา’ หากแต่พวกเขาได้อพยพไปยังดาวโลกอันแสนไกลแล้ว หัวใจพองโตเมื่อรับรู้ถึงความปรารถนาใหม่ เรื่องที่ว่าเอมิอยากจะไปพบกับคุณผู้สร้างให้ได้ ในเวลานั้นเองภัยพิบัติหุ่นยนต์จากดวงดาวของเธอก็ได้วางแผนคืบคลานไปยัง ‘โลก‘ แล้ว นั่นทำให้เธอจึงตัดสินใจรีบออกเดินทาง สุดท้ายแล้วเอมิจะสามารถปกป้องและพบเจอเขาคนนั้นไหมนะ ?",
    height: "153 cm",
    birthdate: "16 ก.ค.",
    age: "xxx",
    youtube: "https://www.youtube.com/@AMIWorldEnd",
    twitter: "https://x.com/AMIWorldEnd",
    discord: "https://discord.com/invite/JWUSAhEgmw",
    facebook: "https://web.facebook.com/AMIWorldEnd",
    youtube_channel_id: "UCa8ILv94qHT6oar_jVzg9sQ",
  },
  {
    name: "Xonebu X’thulhu",
    description:
      "เอเลี่ยนจากซากดวงดาว X01 อันห่างไกล เดินทางมาที่ดาวโลกเพื่อช่วยเหลือและกอบกู้!!! ....ล้อเล่น มาหาอะไรทำเฉยๆค่ะ อวกาศมันน่าเบื่อ",
    height: "165 ซม.",
    birthdate: "28 ส.ค.",
    age: "อายุเป็นเพียงตัวเลข เพราะงั้นอย่าสนใจตัวเลข",
    youtube: "https://www.youtube.com/@XonebuWorldEnd",
    twitter: "https://x.com/XonebuWorldEnd",
    discord: "https://discord.com/invite/6KvkmRDbU5",
    facebook: "https://web.facebook.com/XonebuWorldEnd",
    youtube_channel_id: "UCGo7fnmWfGQewxZVDmC3iJQ",
  },
  {
    name: "Kumoku Tsururu",
    description:
      "ท้องฟ้าแปรปรวน ! ระดับน้ำทะเลสูงขึ้น ! คลื่นความร้อนกระจายตัว ! ความแห้งแล้งของพื้นดิน ! และทั้งหมดนี้ ก่อให้เกิด ตัวแทนแห่งภาวะโลกร้อน ! ! ! ก้อนเมฆตัวน้อย ที่ลอยสูงที่สุ๊ดดดดดดดดดดดดดด ด ด ด ด ด ด ด ด",
    height: "145 ซม.",
    birthdate: "16 ก.ย.",
    age: "1212312121",
    youtube: "https://www.youtube.com/@TsururuWorldEnd",
    twitter: "https://x.com/TsururuWorldEnd",
    discord: "https://discord.com/invite/ydJ3bjZekM",
    facebook: "https://web.facebook.com/TsururuWorldEnd",
    youtube_channel_id: "UC3qnb4Sgo4QtiOi8iS7jOsQ",
  },
  {
    name: "Mild-R",
    description:
      "มายด์อาร์ Mutant มนุษย์กลายพันธุ์ที่จะมารักษาหัวใจคุณแบบ super exclusive แต่เมื่อหลงเข้ามาแล้วจงระวัง เพราะมายมีตาวิเศษเห็นนะ!! หลังจากออกจากหลอดทดลอง บอกตรงๆว่ามีหลายอารมณ์เกิดขึ้นมากมาย ถ้าเค้ามีร่างกายที่ผิดมนุษย์แบบนี้แล้ว . . . เธอจะยังรักเค้าอยู่มั้ยนะ . . . ?",
    height: "155 ซม.",
    birthdate: "12 ธ.ค.",
    age: "20+",
    youtube: "https://www.youtube.com/@MildRWorldEnd",
    twitter: "https://x.com/MildRWorldEnd",
    discord: "https://discord.com/invite/hvE8FhJbju",
    facebook: "https://web.facebook.com/MildRWorldEnd",
    youtube_channel_id: "UCknOyz3O0-G6w5SJNAgO7uQ",
  },
  {
    name: "Debirun",
    description:
      "เดบีรุน ภัยพิบัติอุกกาบาต ผู้บัญชาการสูงสุดแห่งกองทัพลับเมเทโอรอยด์ ออกเดินทางท่องจักรวาลจัดการกับผู้กระทำความผิดที่เป็นภัยคุกคามต่อทั้งเอกภพ มีพลังดาวตกที่กวาดล้างโลกเพื่อการถือกำเนิดใหม่ และชี้ชะตาทุกสรรพสิ่ง ตอนนี้ได้มาเยือนที่โลกมนุษย์ประเทศไทย แอบมาสำรวจโลกใบนี้อย่างแนบเนียนในร่างเด็กสาวชาวโลก เหมือนว่าจะถูกใจโลกใบนี้กับวัฒนธรรมของโลกนี้ไม่มากก็น้อย ยามที่โลกจะถึงกาลอวสาน จึงได้รวบรวมเพื่อนๆชาวworld end เพื่อช่วยโลกใบนี้ ทว่ามันสายเกินไปเวลาแห่งจุดจบได้มาถึงแล้ว ด้วยการตัดสินใจอันเด็ดเดี่ยวของเดบีรุนจึงได้พาทุกคนย้อนกลับมายังอดีต เป็นวีทูปเบอร์ เพื่อกระจายข่าวสารและประกาศให้ชาวโลกได้ตระหนักถึงภัยพิบัติที่กำลังคลืบคลานเข้ามาก่อนที่จะสายเกินไป เรื่องที่เล่ามาทั้งหมด เป็นจริงแค่ไหนไม่มีใครรู้ (เอ้า)",
    height: "142 ซม.",
    birthdate: "20 พ.ย.",
    age: "ไม่ได้อายุ 18",
    youtube: "https://www.youtube.com/@DebirunWorldEnd",
    twitter: "https://x.com/DebirunWorldEnd",
    discord: "https://discord.com/invite/bKuMuCae4P",
    facebook: "https://web.facebook.com/DebirunWorldEnd",
    youtube_channel_id: "UCot8DHNnZ2X0ARgaNYZopjw",
  },
  {
    name: "T-Reina Ashyra",
    description:
      "'แอชีร่า' สาวน้อยผู้แสนจะเรียบร้อย พูดน้อย น่ารัก ศูนย์รวมของความสดใสและมากล้นไปด้วยเอเนอจี้แบบ 300% เธอไม่เพียงแค่น่ารักเท่านั้น แต่เธอยังเต็มเปี่ยมไปด้วยความร่าเริง มุ้งมิ้ง วุ้งวิ้ง คาวาอี้  เธอจะมีแต่รอยยิ้มให้คุณ! ไม่ว่าจะยามเช้า สาย บ่าย เย็น หรือก่อนนอน  เธอเป็นคนที่มีเสน่ห์อย่างน่าเหลือเชื่อ~ สามารถทำให้คนรอบข้างรู้สึกดีและมีความสุขเพียงแค่ได้อยู่ใกล้เธอ ⸜(*ˊᗜˋ*)⸝ นอกจากความน่ารักภายนอกแล้ว เธอยังมีความสามารถในการเรียนรู้ที่ไม่ธรรมดา เป็นหญิงสาวที่หัวไว(?) และสามารถอธิบายให้คนอื่นเข้าใจได้อย่างชัดเจน(?) เธอเป็นเหมือนสารานุกรมที่เดินได้(?) และน้องๆในรุ่น ต่างก็ชื่นชอบที่จะมาขอคำปรึกษาและคำแนะนำจากเธอ (??????) และเธอ็ยังมีความฝันที่ยิ่งใหญ่และใหญ่ยิ่ง แบบใหญ่มากๆ ใหญ่มากที่สุด จริงๆนะ นั่นก็คือ... การเป็นพี่สาวที่ไม่สมบูรณ์แบบขนาดนี้ยังไงล่ะ! แค่นี้น้องๆก็รักก็หลงฉันจะแย่ละ เฮ้อ... เป็นคนฮอตนี่มันเหนื่อยจริงๆ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ โฮะ",
    height: "161 ซม.",
    birthdate: "12 มิ.ย.",
    age: "199 ปี อายุการใช้งาน 199 ล้านปี",
    youtube: "https://www.youtube.com/@AshyraWorldEnd",
    twitter: "https://x.com/AshyraWorldEnd",
    discord: "https://discord.com/invite/PSfNkW6db3",
    facebook: "https://web.facebook.com/AshyraWorldEnd",
    youtube_channel_id: "UCZYTMrnVmu1iUVyGeqB6zJQ",
  },
];

export const seeder = async () => {
  // delete everything from vtuber table
  try {
    await drizzleSuperPool.delete(vtuberTable);
  } catch (error) {
    console.log(error);
    return;
  }

  // insert current vtuberData into vtuber table
  try {
    await drizzleSuperPool.insert(vtuberTable).values(vtuberData);
  } catch (error) {
    console.log(error);
    return;
  }

  console.log("Seed vtubers successfully!");
};

seeder();
