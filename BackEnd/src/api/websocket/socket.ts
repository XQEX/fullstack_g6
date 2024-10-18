import { WebSocketServer, WebSocket } from "ws";
import {
  websocketPreError,
  websocketPostError,
} from "../utils/websocketUtils.js";
import { IncomingMessage, Server } from "http";
import { Request, Response } from "express";
import cookie from "cookie";
import { sessionSecret } from "../utils/stdUtils.js";
import { drizzlePool } from "../../db/conn.js";
import { eq } from "drizzle-orm";
import {
  oauthPixelianTable,
  pixelianSessionsTable,
  pixelianTable,
} from "../../db/schema.js";
import internal from "stream";

// function utils
import { containerPort } from "../utils/stdUtils.js";
import {
  broadcastSessionChanged,
  broadcastIncomingMembershipProof,
  broadcastPixeliansFeelings,
  setWebsocket,
} from "../utils/websocketUtils.js";

function formatSession(preformatSession: string) {
  const prefix = "s%3A";
  const postfix = ".";
  const prefixIndex = preformatSession.indexOf(prefix) + (prefix.length - 1);
  const postfixIndex = preformatSession.indexOf(postfix);

  return preformatSession.substring(prefixIndex, postfixIndex);
}

async function auth(req: IncomingMessage, socket: internal.Duplex) {
  // authentication
  if (!req.headers.cookie || !req.headers.cookie.includes("connSessID=")) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const sessionId = formatSession(cookie.parse(req.headers.cookie).connSessID);

  // console.log(sessionId);

  let cookieObj;
  try {
    cookieObj = await drizzlePool.query.pixelianSessionsTable.findFirst({
      columns: { sess: true },
      where: eq(pixelianSessionsTable.sid, sessionId),
    });
    if (!cookieObj) {
      throw Error("no cookie");
    }
  } catch (error) {
    console.log(error);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  let userObj;
  try {
    userObj = (cookieObj as any).sess.passport.user;
    if (!userObj) {
      throw Error("no userObj");
    }
  } catch (error) {
    console.log(error);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  let userData;
  try {
    // oauth
    if (userObj.isOauth) {
      userData = await drizzlePool.query.oauthPixelianTable.findFirst({
        columns: { id: true, role: true },
        where: eq(oauthPixelianTable.id, userObj.id),
      });
      userData ? (userData = { isOauth: true, ...userData }) : undefined;
    }
    // normal authen
    else {
      userData = await drizzlePool.query.pixelianTable.findFirst({
        columns: { id: true, role: true },
        where: eq(pixelianTable.id, userObj.id),
      });
      userData ? (userData = { isOauth: false, ...userData }) : undefined;
    }

    if (!userData) {
      throw Error("undefined user data");
    }
  } catch (error) {
    console.log(error);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  return userData;
}

export default function configure(server: Server, wss: WebSocketServer) {
  // upgrading server from http to websocket
  server.on("upgrade", async (req, socket, head) => {
    socket.on("error", websocketPreError);

    // authentication
    req.userInfo = await auth(req, socket);
    // authentication fails
    if (!req.userInfo) {
      if (socket) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
      return;
    }

    // console.log(req.userInfo);

    wss.handleUpgrade(req, socket, head, (ws) => {
      socket.removeListener("error", websocketPreError);
      wss.emit("connection", ws, req);
    });
  });

  // have websocket connection to server
  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    // set client's user-info to websocket
    ws.userInfo = req.userInfo;

    // console.log(ws.userInfo);

    ws.onerror = () => websocketPostError;

    ws.onopen = () => {
      console.log("Websocket connection established");
    };

    ws.onmessage = (event) => {
      console.log("incoming message");

      let parsedData;
      try {
        parsedData = JSON.parse(event.data as string);
      } catch (error) {
        console.log(error);
        console.log(event.data);
        return;
      }

      // console.log(parsedData.data);
      switch (parsedData.type) {
        case "message":
          console.log(parsedData.data);
          break;
        case "initSessionsChange": // admins only, monitor online-users
          console.log("getting new sessions");
          broadcastSessionChanged(wss);
          break;
        case "initIncomingMembershipProof": // admins only, monitor pending membership-proof to be approved
          console.log("to be approved");
          broadcastIncomingMembershipProof(wss);
          break;
        case "initFeelingsChange": // all users, monitor feelings table changed
          console.log("getting pixelians feelings for vtubers");
          broadcastPixeliansFeelings(wss, parsedData.data);
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log("Websocket connection closed for userId: " + ws.userInfo.id);
    };

    setWebsocket(wss);
  });
}
