import express from "express";
import cors from "cors";
import { drizzlePool, pool, super_pool, drizzleSuperPool } from "../db/conn.js";
import { pixelianSessionsTable, pixelianTable } from "../db/schema.js";
import helmet from "helmet";
import session from "express-session";
import "dotenv/config";
import { router as userRouter } from "./routes/users.js";
import { router as vtuberRouter } from "./routes/vtubers.js";
import { router as adminRouter } from "./routes/admin.js";
import { router as feelingRouter } from "./routes/feelings.js";
import { router as liveStreamRouter } from "./routes/liveStream.js";
import pgSimple from "connect-pg-simple";
import { eq } from "drizzle-orm";
import passport from "./middleware/passport.js";
import cron from "node-cron";
import socketConfig from "./websocket/socket.js";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import { parse } from "node-html-parser";

// variable utils
import {
  allowedDomains,
  containerPort,
  cookieTimeToExpires,
  sessionSecret,
  deleteExpiredSessions,
  stopServer,
  colors,
} from "./utils/stdUtils.js";
import { listenForDatabaseNotification } from "./utils/websocketUtils.js";
import {
  checkAndUpdateAllVtubersLiveStatus,
  checkAndUpdateVtuberLiveStatus,
} from "./utils/vtubersLiveUtils.js";
import { displayPartsToString } from "typescript";

// setting session store
const pgSession = pgSimple(session);
const sessStore = new pgSession({
  pool: super_pool,
  tableName: "pixelianSessions",
  createTableIfMissing: true,
  pruneSessionInterval: 30,
});

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedDomains.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(
  session({
    secret: sessionSecret,
    name: "connSessID",
    saveUninitialized: false,
    resave: false,
    store: sessStore,
    cookie: { maxAge: cookieTimeToExpires.real, httpOnly: true, secure: false },
  })
);
app.use(cookieParser(sessionSecret));

app.use(passport.initialize());
app.use(passport.session());

// <Routes>
// For testing (BRF: UCbOo-f3InU38IZV5tREzsNg, HRK - UC4plRabXFGdAE6HP-tBQKdQ, Insym: UC5uNya42ayhsRnZOR3mO6NA,
// Lofi Girl: UCSJ4gkVC6NrvII8umztf0Ow, MildR: UCknOyz3O0-G6w5SJNAgO7uQ, Me - UCfvAIqsTOy9gikBPLEqsI5g
// Hon-KaSare: UCXm0bpjlfB0AF-ZdPhT0K1A),
// (BRF-Live: https://www.youtube.com/watch?v=T-GZmiTWeUY)
app.get("/", async (req, res) => {
  // const response = await fetch(
  //   "https://www.youtube.com/channel/UCknOyz3O0-G6w5SJNAgO7uQ/live"
  // );
  const response = await fetch(
    "https://youtube.com/channel/UC4plRabXFGdAE6HP-tBQKdQ/live"
  );
  // const response = await fetch(
  //   "https://www.youtube.com/feeds/videos.xml?channel_id=UCknOyz3O0-G6w5SJNAgO7uQ"
  // );

  // const browser = await puppeteer.launch();

  // const page = await browser.newPage();

  // await page.goto("https://youtube.com/channel/UC4plRabXFGdAE6HP-tBQKdQ/live", {
  //   waitUntil: "networkidle0",
  // });

  // try {
  //   await page.waitForFunction(
  //     () => {
  //       const liveStats = document.querySelector("div.ytp-live");
  //       if (!liveStats) {
  //         console.log("No liveStats");
  //         return false;
  //       }
  //       const liveStatstext = window
  //         .getComputedStyle(liveStats)
  //         .getPropertyValue("display");
  //       return liveStatstext !== "none";
  //     },
  //     { timeout: 3000 }
  //   );
  //   console.log("Live");
  // } catch (error) {
  //   console.log("Upcoming");
  // }

  // await browser.close();

  const text = await response.text();
  const html = parse(text);
  // const xml = new xmlParser.XMLParser().parse(text);
  // (xml.feed.entry as []).map((ent) => {
  //   console.log(ent);
  // });
  // console.log(xml);

  const canonicalURLTag = html.querySelector("link[rel=canonical]");
  if (!canonicalURLTag) {
    console.log("CanoicalTag is nulL");
    return res.status(403).send("CanoicalTag is null");
  }
  const canonicalURL = canonicalURLTag.getAttribute("href");
  if (!canonicalURL) {
    console.log("CanoicalUrl is nulL");
    return res.status(403).send("CanoicalUrl is null");
  }
  const isStreaming = canonicalURL.includes("/watch?v=");
  const title = html.querySelector("title");
  if (!title) {
    return res.status(403);
  }
  console.log(`Title: ${title.text}`);
  console.log(`URLTag: ${canonicalURLTag}`);
  console.log(`URL: ${canonicalURL}`);
  console.log(`isStreaming?: ${isStreaming}`);
  res.status(200).json({
    url: canonicalURL,
    isStreaming,
  });

  return res.status(200);
});

app.use("/api/users", userRouter);
app.use("/api/vtubers", vtuberRouter);
app.use("/api/admins", adminRouter);
app.use("/api/feelings", feelingRouter);
app.use("/api/live-streams", liveStreamRouter);

// <Initialized Functions (Pre-Server)>

// <Initialize app>
const server = app.listen(containerPort, async () => {
  console.log(`API(HTTP) -> Listening on port: ${containerPort}...`);
  console.log(
    `API(WebSocket) -> If upgraded, Listening on port: ${containerPort}...`
  );
  console.log(
    `API -> Initializing startup functions, ${colors.yellow}Please wait a moment...${colors.reset}`
  );
});

// <Initialize Websocket>
const wss = new WebSocketServer({ noServer: true });
// <Websocket Setup>
socketConfig(server, wss);

// <Initialized Functions (Post-Server)>

// delete expired sessions once, then do it every 5 minutes (xx.00, xx.05, xx.10, ...)
await deleteExpiredSessions();
console.log(`${colors.blue}Expired Sessions delete complete${colors.reset}`);
cron.schedule("*/5 * * * *", async () => {
  await deleteExpiredSessions();
  console.log(`${colors.blue}Expired Sessions delete complete${colors.reset}`);
});

// check and update lived videos from all vtubers once, then do it every 30 minutes (xx.10, xx.40)
await checkAndUpdateAllVtubersLiveStatus();
console.log(
  `${colors.blue}Operations on all Vtuber's LiveStream complete${colors.reset}`
);
cron.schedule("10,40 * * * *", async () => {
  await checkAndUpdateAllVtubersLiveStatus();
  console.log(
    `${colors.blue}Operations on all Vtuber's LiveStream complete${colors.reset}`
  );
});

// !* For demonstration purpose *!
// await checkAndUpdateVtuberLiveStatus(
//   "UCSJ4gkVC6NrvII8umztf0Ow",
//   "43d85b20-eb07-44ff-b143-90678f493b95"
// );

// setup database notification (FROM CHATGPT)
await listenForDatabaseNotification(wss);
console.log(`API -> ${colors.green}All functions initialized!${colors.reset}`);

process.on("SIGINT", stopServer);
