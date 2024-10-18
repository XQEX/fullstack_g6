import { drizzlePool } from "../../db/conn.js";
import { parse } from "node-html-parser";

// variables utils
import { youtubeAPIKEY, youtubeAPIURL } from "./stdUtils.js";
import { liveStreamTable, vtuberTable } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";
import puppeteer from "puppeteer";

const getVideoID = (liveURL: string) => {
  const prefix = "watch?v=";
  const prefixIndex = liveURL.indexOf(prefix) + prefix.length;
  const videoID = liveURL.substring(prefixIndex, liveURL.length);

  return videoID;
};

const updateOldLive = async (vtuber_id: string) => {
  try {
    const checkEndedLive = await drizzlePool
      .update(liveStreamTable)
      .set({ status: "END" })
      .where(
        and(
          eq(liveStreamTable.vtuber_id, vtuber_id),
          eq(liveStreamTable.status, "LIVE"),
          eq(liveStreamTable.insert_type, "AUTO")
        )
      )
      .returning({ id: liveStreamTable.id });
    if (checkEndedLive.length !== 0) {
      console.log(
        `Some Lives from vtuber_Id: ${vtuber_id} has ended, updated table`
      );
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const fetchVtuberChannel = async (vtuber_name: string, vtuber_id: string) => {
  console.log("Called youtube data API");
  let response;
  try {
    // getting vtuber channel ID with youtube data api
    response = await fetch(
      `${youtubeAPIURL}/search?part=snippet&type=channel&q=${vtuber_name}&key=${youtubeAPIKEY}`
    );

    if (!response.ok) {
      throw Error("Can't fetch data from youtube data API v3");
    }

    const parsedResponse = await response.json();
    const foundChannels = parsedResponse.items as any[];

    for (const foundCH of foundChannels) {
      const channelName = foundCH.snippet.title as string;
      const channelId = foundCH.snippet.channelId as string;

      // found channel
      if (
        channelName.includes(vtuber_name) &&
        (channelName.includes("Pixela") || channelName.includes("pixela"))
      ) {
        // insert vtuber_channelId into database
        try {
          await drizzlePool
            .update(vtuberTable)
            .set({ youtube_channel_id: channelId })
            .where(eq(vtuberTable.id, vtuber_id));
        } catch (error) {
          // found channel but can't update vtuber channel
          console.log(error);
          return;
        }

        return channelId;
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
};

const updateVtuberLiveDatabase = async (
  vtuber_id: string,
  live_title: string,
  live_url: string,
  live_thumbnail: string
) => {
  let getVtuber;
  try {
    getVtuber = await drizzlePool.query.vtuberTable.findFirst({
      columns: { icon_image: true },
      where: eq(vtuberTable.id, vtuber_id),
    });
    if (!getVtuber) {
      throw Error("Can't find vtuber in database");
    }
  } catch (error) {
    console.log(error);
    return;
  }

  // check if live existed
  let getLives;
  try {
    getLives = await drizzlePool.query.liveStreamTable.findFirst({
      columns: { name: true, link: true },
      with: { streamedBy: { columns: { name: true } } },
      where: and(
        eq(liveStreamTable.vtuber_id, vtuber_id),
        eq(liveStreamTable.link, live_url)
      ),
    });
  } catch (error) {
    console.log(error);
    return;
  }

  // live don't existed in liveStream table for the vtuber yet
  if (!getLives) {
    // inserting into liveStream table
    try {
      await drizzlePool.insert(liveStreamTable).values({
        vtuber_id: vtuber_id,
        name: live_title,
        link: live_url,
        thumbnail_link: live_thumbnail,
        insert_type: "AUTO",
        status: "LIVE",
      });
      console.log("Live inserted!");
    } catch (error) {
      console.log(error);
      return;
    }
  }
  // do something else
  else {
    return;
  }

  console.log(`Successfully update LiveStream table for vtuber: ${vtuber_id}`);
};

// Credits from: {https://stackoverflow.com/questions/32454238/how-to-check-if-youtube-channel-is-streaming-live#:~:text=All%20you%20need%20to%20do,%22canonical%22%20%2F%3E%20tag.}
export const checkAndUpdateVtuberLiveStatus = async (
  channel_id: string,
  vtuber_id: string
) => {
  let response;
  try {
    // fetch directly from youtube url to check live
    response = await fetch(`https://youtube.com/channel/${channel_id}/live`);
  } catch (error) {
    console.log(error);
    return;
  }

  // parse to text
  const responseText = await response.text();

  // parse to HTML
  const responseTextHTML = parse(responseText);

  let canonicalURLTag;
  let canonicalURL;
  // getting the url
  try {
    canonicalURLTag = responseTextHTML.querySelector("link[rel=canonical]");
    if (!canonicalURLTag) {
      throw Error(`Can't get canonicalURL-Tag from channelID: ${channel_id}`);
    }
    canonicalURL = canonicalURLTag.getAttribute("href");
    if (!canonicalURL) {
      throw Error(`Can't get canonicalURL from channelID: ${channel_id}`);
    }
  } catch (error) {
    console.log(error);
    return;
  }

  // get vtuber's live stream status
  const isStreaming = canonicalURL.includes("/watch?v=");
  // vtuber isn't streaming or have upcoming live
  if (!isStreaming) {
    // updated vtuber's ended live type in liveStream table
    if (!(await updateOldLive(vtuber_id))) {
      // if error
      return;
    }
    console.log(
      `VtuberId: ${vtuber_id} doesn't has live stream or upcoming stream`
    );
    return;
  }

  // currently streaming or upcoming live

  // check for existing live (optimization)
  let getLive;
  try {
    getLive = await drizzlePool.query.liveStreamTable.findFirst({
      columns: { id: true },
      where: and(
        eq(liveStreamTable.vtuber_id, vtuber_id),
        eq(liveStreamTable.link, canonicalURL)
      ),
    });
  } catch (error) {
    console.log(error);
    return;
  }

  // live url already existed for that vtuber in live
  if (getLive) {
    console.log(`Live already existed for vtuberId: ${vtuber_id}`);
    return;
  }

  // new live url, update old live url to be an ended live stream
  if (!(await updateOldLive(vtuber_id))) {
    // if error
    return;
  }

  // setup virtual browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(canonicalURL, {
      waitUntil: "domcontentloaded",
    });
  } catch (error) {
    console.log("Can do goto");
    return;
  }

  // check for live or upcoming type
  let checkLive = false;
  try {
    await page.waitForFunction(
      () => {
        const isTrueLiveElem = document.querySelector("div.ytp-live");
        if (!isTrueLiveElem) {
          return false;
        }
        const isTrueLive = window
          .getComputedStyle(isTrueLiveElem)
          .getPropertyValue("display");

        return isTrueLive !== "none";
      },
      { timeout: 7000 }
    );

    console.log(`Video is Live for: ${vtuber_id}`);
    checkLive = true;
  } catch (error) {
    // intentionally thrown error if the url is an upcoming live
    console.log("Video is an Upcoming Live");
    checkLive = false;
  }

  await browser.close();

  // check for upcoming live
  if (!checkLive) {
    return;
  }

  let liveVideoTitle;
  try {
    liveVideoTitle = responseTextHTML.querySelector("title");
    if (!liveVideoTitle) {
      throw Error("Can't get lived video title");
    }
  } catch (error) {
    console.log(error);
    return;
  }

  const videoId = getVideoID(canonicalURL);
  // console.log(`VideoID: ${videoId}`);
  const thumbnailURL = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // updating vtuber's liveStreams table function
  await updateVtuberLiveDatabase(
    vtuber_id,
    liveVideoTitle.text,
    canonicalURL,
    thumbnailURL
  );
};

export const checkAndUpdateAllVtubersLiveStatus = async () => {
  let getVtubers;
  // get all vtubers in database
  try {
    getVtubers = await drizzlePool.query.vtuberTable.findMany({
      columns: {
        id: true,
        name: true,
        icon_image: true,
        youtube_channel_id: true,
      },
    });
    if (getVtubers.length === 0) {
      throw Error("No vtubers existed in database");
    }
  } catch (error) {
    console.log(error);
    return;
  }

  for (const vtuber of getVtubers) {
    let channel_id: string | undefined = vtuber.youtube_channel_id;
    // the vtuber doesn't have a youtube channel ID yet
    if (channel_id === "UNDEFINED") {
      try {
        channel_id = await fetchVtuberChannel(vtuber.name, vtuber.id);
        if (!channel_id) {
          throw Error(
            `Can't fetch youtube channel ID from vtuber: ${vtuber.name}`
          );
        }
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    await checkAndUpdateVtuberLiveStatus(channel_id, vtuber.id);
  }
};

export const getThumbnailLink = (link: string) => {
  const prefix = "v=";
  const prefixInd = link.indexOf(prefix) + prefix.length;
  const postfix = "&";
  const postfixInd = link.indexOf(postfix);
  let videoId;
  // no & or & appears before watch?v=
  if (postfixInd === -1 || postfixInd < prefixInd) {
    videoId = link.substring(prefixInd, link.length);
  } else {
    videoId = link.substring(prefixInd, postfixInd);
  }
  const thumbnail_link = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  console.log(thumbnail_link);
  return thumbnail_link;
};

// subscribe to Pub/Sub functions (*Not Working)
// let publicNgrokURL: string | undefined;
//  export const connectNgrok = async () => {
//   try {
//     if (publicNgrokURL) {
//       await ngrok.disconnect(publicNgrokURL);
//     }
//     publicNgrokURL = await ngrok.connect({
//       proto: "http",
//       addr: backendPort,
//       authtoken: ngrokAuthToken,
//     });
//     console.log(`Successfully get ngrok url: ${publicNgrokURL}`);
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const subscribeToChannel = async (
//   channel_id: string,
//   vtuber_id: string
// ) => {
//   let response;
//   try {
//     console.log(`In subscribe function: ${publicNgrokURL}`);
//     response = await fetch(`${pshbURL}/subscribe`, {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         "hub.mode": "subscribe",
//         "hub.topic": `${youtubeFeedURL}=${channel_id}`,
//         "hub.callback": `${publicNgrokURL}/api/webhook/${vtuber_id}`,
//         "hub.verify": "sync",
//         "hub.lease_seconds": "86400", // 1 day in s
//       }),
//     });
//     console.log(response.status);
//     if (!response.ok) {
//       console.log(`Failed to subscribe to channelId: ${channel_id}`);
//       return;
//     }

//     console.log(
//       `Successfully subscribe to channel notification of channelId: ${channel_id}`
//     );
//   } catch (error) {
//     console.log(error);
//     return;
//   }
// };
// export const subscribeToAllChannel = async () => {
//   const vtubersChannel = await drizzlePool.query.vtuberTable.findMany({
//     columns: { id: true, name: true, youtube_channel_id: true },
//   });

//   // no vtubers in table
//   if (vtubersChannel.length === 0) {
//     return;
//   }

//   // loop through all vtubers in database
//   for (const vtuberCh of vtubersChannel) {
//     let channelId;

//     // vtuber don't have channel ID yet in database, fetch from youtube data api
//     if (vtuberCh.youtube_channel_id === "UNDEFINED") {
//       channelId = await getVtuberChannel(vtuberCh.name, vtuberCh.id);
//       if (!channelId) {
//         return;
//       }
//     }

//     // vtuber channel ID existed
//     channelId = vtuberCh.youtube_channel_id;

//     await subscribeToChannel(channelId, vtuberCh.id);
//   }
// };
