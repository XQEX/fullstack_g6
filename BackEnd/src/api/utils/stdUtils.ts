import "dotenv/config";
import { drizzlePool, drizzleSuperPool } from "../../db/conn.js";
import { pixelianSessionsTable } from "../../db/schema.js";
import { lt } from "drizzle-orm";
import ngrok from "ngrok";
import { closePool } from "../utils/websocketUtils.js";
import { initialize } from "passport";

// Constants

// Colors
export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
};

export const frontEndURL = "http://localhost:3000";

export const allowedDomains = [
  "http://localhost:3000",
  "http://localhost:5173",
];

export const containerPort = 4000;
export const backendPort = process.env.BACKEND_PORT;

export const saltRounds = process.env.BCRYPT_SALTROUNDS;

export const sessionSecret = process.env.SESSION_SECRET as string;

export const cookieTimeToExpires = {
  dev: 1000 * 60 * 10,
  real: 1000 * 60 * 60 * 2,
};

export const youtubeAPIURL = process.env.YOUTUBE_API_URL as string;
export const youtubeAPIKEY = process.env.YOUTUBE_APIKEY as string;

export const ngrokAuthToken = process.env.NGROK_AUTHTOKEN as string;

export const pshbURL = process.env.PUBSUBHUBBUB_URL as string;
export const youtubeFeedURL = process.env.YOUTUBE_FEED_URL as string;

// Functions

export const deleteExpiredSessions = async () => {
  try {
    await drizzleSuperPool
      .delete(pixelianSessionsTable)
      .where(lt(pixelianSessionsTable.expire, new Date()));
  } catch (error) {
    console.log(error);
  }
};

export const initializeServer = async () => {};

export const stopServer = async () => {
  // await ngrok.disconnect();
  await closePool();
};
