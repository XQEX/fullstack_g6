import { pool, drizzlePool } from "../../db/conn.js";
import { WebSocketServer, WebSocket } from "ws";
import {
  incomingPixelianMemberProofTable,
  oauthPixelianTable,
  pixelianFeelingsTable,
  pixelianTable,
  vtuberTable,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

function websocketPreError(error: Error) {
  console.log(error.message);
}

function websocketPostError(error: Error) {
  console.log(error.message);
}

function setWebsocket(wss: WebSocketServer) {
  webss = wss;
}

export let webss: WebSocketServer;

async function getOnlineUsers() {
  let currentSessionUsers;
  // get all sessions
  try {
    currentSessionUsers =
      await drizzlePool.query.pixelianSessionsTable.findMany({
        columns: { sess: true },
      });
    if (currentSessionUsers.length === 0) {
      return;
    }
  } catch (error) {
    console.log(error);
    return;
  }

  // get only user obj
  const currentUsersObj = [];
  for (const itr of currentSessionUsers) {
    currentUsersObj.push((itr as any).sess.passport.user);
  }
  if (currentUsersObj.length === 0) {
    return;
  }

  // get user from tables
  // try {
  //   for (const itr of currentUsersObj) {
  //     let user;
  //     if (itr.isOauth) {
  //       user = await drizzlePool.query.oauthPixelianTable
  //     }
  //   }
  // } catch (error) {
  // }

  return currentUsersObj;
}

// type: userSessions, return data_type -> [{userId, isOauth}]
async function broadcastSessionChanged(wss: WebSocketServer) {
  let currentOnlineUsers = await getOnlineUsers();
  if (!currentOnlineUsers) {
    currentOnlineUsers = [];
  }
  wss.clients.forEach((client) => {
    const c = client as WebSocket;
    if (c.readyState === WebSocket.OPEN) {
      if (c.userInfo.role === "ADMIN") {
        c.send(
          JSON.stringify({ type: "userSessions", data: currentOnlineUsers })
        );
      }
    }
  });
}

// type: pendingMembershipProof, return data_type -> [{userId, name, profile_picture, membership_proof_imaage}]
async function broadcastIncomingMembershipProof(wss: WebSocketServer) {
  let normalUsersProof;
  // get all incoming to be aproved membership proof from authen users
  try {
    normalUsersProof = await drizzlePool
      .select({
        id: incomingPixelianMemberProofTable.id,
        pixelian_id: pixelianTable.id,
        name: pixelianTable.name,
        profile_picture: pixelianTable.profile_picture,
        membership_proof_image:
          incomingPixelianMemberProofTable.membership_proof_image,
      })
      .from(pixelianTable)
      .innerJoin(
        incomingPixelianMemberProofTable,
        eq(pixelianTable.id, incomingPixelianMemberProofTable.pixelian_id)
      );
  } catch (error) {
    console.log(error);
    return;
  }

  let oauthUsersProof;
  // get all incoming to be aproved membership proof from oauth users
  try {
    oauthUsersProof = await drizzlePool
      .select({
        id: incomingPixelianMemberProofTable.id,
        pixelian_id: oauthPixelianTable.id,
        name: oauthPixelianTable.name,
        profile_picture: oauthPixelianTable.profile_picture,
        membership_proof_image:
          incomingPixelianMemberProofTable.membership_proof_image,
      })
      .from(oauthPixelianTable)
      .innerJoin(
        incomingPixelianMemberProofTable,
        eq(
          oauthPixelianTable.id,
          incomingPixelianMemberProofTable.oauth_pixelian_id
        )
      );
  } catch (error) {
    console.log(error);
    return;
  }

  let usersProof = [...normalUsersProof, ...oauthUsersProof];

  wss.clients.forEach((client) => {
    const c = client as WebSocket;
    if (c.readyState === WebSocket.OPEN && c.userInfo.role === "ADMIN") {
      c.send(
        JSON.stringify({ type: "pendingMembershipProof", data: usersProof })
      );
    }
  });
}

// type: pixelianFeelingsTo{vtuberName}, return data_type -> [{id, pixelian_name, pixelian_profile_picture, feeling, vtuber, isOauth}]
async function broadcastPixeliansFeelings(
  wss: WebSocketServer,
  vtuberName: string
) {
  // get all authen users feelings for specific vtuber { by name }
  let normalUsersFeelings;
  const formattedNormalUsersFeelings = [];
  try {
    normalUsersFeelings = await drizzlePool
      .select({
        id: pixelianFeelingsTable.id,
        pixelian_id: pixelianTable.id,
        pixelian_name: pixelianTable.name,
        pixelian_profile_picture: pixelianTable.profile_picture,
        feeling: pixelianFeelingsTable.feeling,
        vtuber: vtuberTable.name,
        updated_time: pixelianFeelingsTable.updatedAt,
      })
      .from(pixelianTable)
      .innerJoin(
        pixelianFeelingsTable,
        eq(pixelianTable.id, pixelianFeelingsTable.pixelian_id)
      )
      .innerJoin(
        vtuberTable,
        eq(pixelianFeelingsTable.vtuber_name, vtuberTable.name)
      )
      .where(eq(vtuberTable.name, vtuberName));

    if (normalUsersFeelings.length !== 0) {
      for (const user of normalUsersFeelings) {
        const formattedUser = { isOauth: false, ...user };
        formattedNormalUsersFeelings.push(formattedUser);
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }

  // get all oauth users feelings for specific vtuber { by name }
  let oauthUsersFeelings;
  const formattedOauthUsersFeelings = [];
  try {
    oauthUsersFeelings = await drizzlePool
      .select({
        id: pixelianFeelingsTable.id,
        pixelian_id: oauthPixelianTable.id,
        pixelian_name: oauthPixelianTable.name,
        pixelian_profile_picture: oauthPixelianTable.profile_picture,
        feeling: pixelianFeelingsTable.feeling,
        vtuber: vtuberTable.name,
        updated_time: pixelianFeelingsTable.updatedAt,
      })
      .from(oauthPixelianTable)
      .innerJoin(
        pixelianFeelingsTable,
        eq(oauthPixelianTable.id, pixelianFeelingsTable.oauth_pixelian_id)
      )
      .innerJoin(
        vtuberTable,
        eq(pixelianFeelingsTable.vtuber_name, vtuberTable.name)
      )
      .where(eq(vtuberTable.name, vtuberName));

    if (oauthUsersFeelings.length !== 0) {
      for (const user of oauthUsersFeelings) {
        const formattedUser = { isOauth: true, ...user };
        formattedOauthUsersFeelings.push(formattedUser);
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }

  let usersFeelings;
  // both arrays aren't empty
  if (
    formattedNormalUsersFeelings.length !== 0 &&
    formattedOauthUsersFeelings.length !== 0
  ) {
    usersFeelings = [
      ...formattedNormalUsersFeelings,
      ...formattedOauthUsersFeelings,
    ];
  }
  // only authen users array aren't empty
  else if (
    formattedNormalUsersFeelings.length !== 0 &&
    formattedOauthUsersFeelings.length === 0
  ) {
    usersFeelings = [...formattedNormalUsersFeelings];
  }
  // only oauth users array aren't empty
  else if (
    formattedNormalUsersFeelings.length === 0 &&
    formattedOauthUsersFeelings.length !== 0
  ) {
    usersFeelings = [...formattedOauthUsersFeelings];
  }
  // no feelings for this vtuber
  else {
    usersFeelings = [] as any[];
  }

  // console.log("user feelings array ---");
  // console.log(usersFeelings);
  // console.log("normal");
  // console.log(normalUsersFeelings);
  // console.log("oauth");
  // console.log(oauthUsersFeelings);

  wss.clients.forEach((client) => {
    const c = client as WebSocket;
    if (c.readyState === WebSocket.OPEN) {
      c.send(
        JSON.stringify({
          type: `pixelianFeelingsTo${vtuberName}`,
          data: usersFeelings,
        })
      );
    }
  });
}

async function listenForDatabaseNotification(wss: WebSocketServer) {
  const p = await pool.connect();
  try {
    await p.query(
      "LISTEN session_change; LISTEN pending_membership; LISTEN feelings_change"
    );
    // await p.query("LISTEN pending_membership");
    p.on("notification", (msg) => {
      // user's sessions changed
      if (msg.channel === "session_change") {
        console.log("User's sessions changed");
        broadcastSessionChanged(wss);
      }
      // new incoming membership to be approved
      else if (msg.channel === "pending_membership") {
        console.log("incoming membership proof to be approved");
        broadcastIncomingMembershipProof(wss);
      }
      // feelings table got updated
      else if (msg.channel === "feelings_change") {
        console.log("feelings table is updated");
        let parsedData;
        try {
          parsedData = JSON.parse(msg.payload as string);
          if (!parsedData) {
            throw Error("parsed data is null or undefined");
          }
        } catch (error) {
          console.log(error);
          return;
        }
        // console.log(parsedData);
        broadcastPixeliansFeelings(wss, parsedData.data.vtuber_name);
      }
    });
  } catch (error) {
    await closePool();
    console.log(error);
  }
}

async function closePool() {
  console.log("Closing PostgreSQL connection pool...");
  await pool.end();
  console.log("Connection pool closed.");
  process.exit(0);
}

export {
  listenForDatabaseNotification,
  closePool,
  websocketPreError,
  websocketPostError,
  broadcastSessionChanged,
  broadcastIncomingMembershipProof,
  broadcastPixeliansFeelings,
  setWebsocket,
};
