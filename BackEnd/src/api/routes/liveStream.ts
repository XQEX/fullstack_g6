import express from "express";
import { checkAuthenticated, checkAdmin } from "../middleware/auth.js";
import { drizzlePool } from "../../db/conn.js";
import {
  liveStreamCategoryTable,
  liveStreamTable,
  vtuberTable,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

// utils
import { getThumbnailLink } from "../utils/vtubersLiveUtils.js";

const router = express.Router();

// Routes
// { /api/live-streams }

// <Get all live stream routes> (Base)
// router.route("/get").get(checkAuthenticated, async (req, res) => {
//   let getLives;
//   try {
//     // get all existing live streams
//     getLives = await drizzlePool
//       .select({
//         title: liveStreamTable.name,
//         link: liveStreamTable.link,
//         thumbnail: liveStreamTable.thumbnail_link,
//         category: liveStreamCategoryTable.name,
//         type: liveStreamTable.type,
//         insertType: liveStreamTable.insert_type,
//         byVtuber: vtuberTable.name,
//         vtuberIcon: vtuberTable.icon_image,
//       })
//       .from(liveStreamTable)
//       .innerJoin(vtuberTable, eq(liveStreamTable.vtuber_id, vtuberTable.id))
//       .leftJoin(
//         liveStreamCategoryTable,
//         eq(liveStreamTable.stream_category_id, liveStreamCategoryTable.id)
//       );
//   } catch (error) {
//     console.log(error);
//     return res.status(403).json({ msg: "Something went wrong", ok: false });
//   }

//   if (getLives.length === 0) {
//     return res
//       .status(200)
//       .json({ msg: "No live streams existed at the moment", ok: true });
//   }

//   res.status(200).json({
//     msg: "Successfully retrived all live streams",
//     ok: true,
//     data: getLives,
//   });
// });

// <Get live streams with filter array> (trying first)
// filter format => {vtubers: [vtuberIds...], categories: [categoryNames...]}
router.route("/get").get(checkAuthenticated, async (req, res) => {
  const { filter } = req.query;
  let filterObj;
  // if filter existed
  if (filter) {
    try {
      filterObj = JSON.parse(filter as string);
      // filter query params existed
      if (filterObj) {
        // vtubers key existed in filter and isn't an array
        if (filterObj.vtubers && !Array.isArray(filterObj.vtubers)) {
          console.log("vtubers key isn't an array");
          return res.status(403).json({
            msg: "Something went wrong at vtubers filter",
            ok: false,
          });
        }
        // categories key existed in filter and isn't an array
        if (filterObj.categories && !Array.isArray(filterObj.categories)) {
          console.log("categories key isn't an array");
          return res.status(403).json({
            msg: "Something went wrong at categories filter",
            ok: false,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res
        .status(403)
        .json({ msg: "Something went wrong at parsing filters", ok: false });
    }
  }

  let getLives;
  try {
    // get all existing live streams
    getLives = await drizzlePool
      .select({
        id: liveStreamTable.id,
        title: liveStreamTable.name,
        link: liveStreamTable.link,
        thumbnail: liveStreamTable.thumbnail_link,
        category: liveStreamCategoryTable.name,
        status: liveStreamTable.status,
        insertType: liveStreamTable.insert_type,
        byVtuber: vtuberTable.id,
        vtuberIcon: vtuberTable.icon_image,
      })
      .from(liveStreamTable)
      .innerJoin(vtuberTable, eq(liveStreamTable.vtuber_id, vtuberTable.id))
      .leftJoin(
        liveStreamCategoryTable,
        eq(liveStreamTable.stream_category_id, liveStreamCategoryTable.id)
      );
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }
  // no live streams  existed
  if (getLives.length === 0) {
    return res
      .status(200)
      .json({ msg: "No live streams existed at the moment", ok: true });
  }

  // filtering if there's filter condition(s)
  if (filterObj) {
    const vtuberIds: any[] = filterObj.vtubers;
    const categoryNames: any[] = filterObj.categories;
    // check for vtubers name filter, if it is defined
    if (vtuberIds && vtuberIds.length !== 0) {
      getLives = getLives.filter((live) => vtuberIds.includes(live.byVtuber));
    }
    // check for category-names filter, if it is defined
    if (categoryNames && categoryNames.length !== 0) {
      getLives = getLives.filter((live) => {
        if (!live.category) {
          return false;
        }
        return categoryNames.includes(live.category);
      });
    }
  }

  res.status(200).json({
    msg: "Successfully retrived all live streams",
    ok: true,
    data: getLives,
  });
});

// <Manually add live stream> { ADMIN Only }
router.route("/add").post(checkAuthenticated, checkAdmin, async (req, res) => {
  const { vtuber_id, name, link, stream_category_name, status } = req.body;
  // must included
  if (!vtuber_id || !name || !link) {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  let findStreamCat;
  // get stream category if defined and existed
  if (stream_category_name) {
    try {
      findStreamCat = await drizzlePool.query.liveStreamCategoryTable.findFirst(
        {
          columns: { id: true },
          where: eq(liveStreamCategoryTable.name, stream_category_name),
        }
      );
      if (!findStreamCat) {
        throw Error("can't get findStreamCategory");
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }
  }

  const thumbnail_link = getThumbnailLink(link);

  try {
    // inserting into live stream table
    await drizzlePool.insert(liveStreamTable).values({
      vtuber_id: vtuber_id,
      name: name,
      link: link,
      thumbnail_link: thumbnail_link,
      stream_category_id: findStreamCat ? findStreamCat.id : null,
      status: status ? status : null,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  res.status(201).json({ msg: "Successfully insert live stream", ok: true });
});

// <Edit live stream> { ADMIN Only }
router
  .route("/edit/:id")
  .put(checkAuthenticated, checkAdmin, async (req, res) => {
    const { vtuber_id, name, link, stream_category_name, status } = req.body;
    const { id } = req.params;
    // required fields
    if (!name || !vtuber_id || !link || !status || !id) {
      return res.status(400).json({ msg: "missing credentials" });
    }

    let findStreamCat;
    // get stream category if defined and existed
    if (stream_category_name) {
      try {
        findStreamCat =
          await drizzlePool.query.liveStreamCategoryTable.findFirst({
            columns: { id: true },
            where: eq(liveStreamCategoryTable.name, stream_category_name),
          });
        if (!findStreamCat) {
          throw Error("can't get findStreamCategory");
        }
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }
    }

    const thumbnail_link = getThumbnailLink(link);

    try {
      // updating live stream table
      await drizzlePool
        .update(liveStreamTable)
        .set({
          vtuber_id: vtuber_id,
          name: name,
          link: link,
          thumbnail_link: thumbnail_link,
          stream_category_id: findStreamCat ? findStreamCat.id : null,
          status: status ? status : null,
          insert_type: "MANUAL",
        })
        .where(eq(liveStreamTable.id, id));
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res.status(201).json({ msg: "Successfully update live stream", ok: true });
  });

// <Delete live stream> { ADMIN Only }
router
  .route("/delete/:id")
  .delete(checkAuthenticated, checkAdmin, async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "missing credentials", ok: false });
    }

    let checkDelete;
    let deleteMsg;
    try {
      checkDelete = await drizzlePool
        .delete(liveStreamTable)
        .where(eq(liveStreamTable.id, id))
        .returning({ id: liveStreamTable.id });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    if (checkDelete.length === 0) {
      deleteMsg = "Nothing was deleted";
    } else {
      deleteMsg = "Successfully delete live stream";
    }

    res.status(200).json({ msg: deleteMsg, ok: true });
  });

// <Get liveCategory, use with adding/editing live stream manually> { ADMIN Only }
router.route("/get/categories").get(checkAuthenticated, async (req, res) => {
  let liveCategories;
  try {
    liveCategories = await drizzlePool.query.liveStreamCategoryTable.findMany({
      columns: { name: true },
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  if (liveCategories.length === 0) {
    return res
      .status(200)
      .json({ msg: "No live stream category existed", ok: true });
  }

  res.status(200).json({
    msg: "Successfully retrive live stream categories",
    ok: true,
    data: liveCategories,
  });
});

export { router };
