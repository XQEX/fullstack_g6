import express, { NextFunction } from "express";
import { drizzlePool } from "../../db/conn.js";
import { and, eq } from "drizzle-orm";
import {
  membershipTierTable,
  pixelianTable,
  vtuberTable,
} from "../../db/schema.js";
import {
  uploadVtuberIconImage,
  uploadVtuberPortImage,
} from "../middleware/multer.js";
import { checkAuthenticated, checkAdmin } from "../middleware/auth.js";

const router = express.Router();

// custom middlewares (with authentication)
const multerUploadVtuberIconMiddleware = (
  req: any,
  res: any,
  next: NextFunction
) => {
  uploadVtuberIconImage.single("vtuber_icon_image")(req, res, (err) => {
    // check for error
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image size exceeded 9MB.", ok: false });
      }
      console.log(err.code);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // continue
    next();
  });
};
const multerUploadVtuberPortMiddleware = (
  req: any,
  res: any,
  next: NextFunction
) => {
  uploadVtuberPortImage.single("vtuber_port_image")(req, res, (err) => {
    // check for error
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image size exceeded 10MB.", ok: false });
      }
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // continue
    next();
  });
};
// const fetchVtuberNameMiddleware = async (
//   req: any,
//   res: any,
//   next: NextFunction
// ) => {
//   const { id } = req.body;
//   if (!id) {
//     return res.status(403).json({
//       msg: "missing credentials in vtuber fetching middleware",
//       ok: false,
//     });
//   }
//   let getVtuber;
//   try {
//     getVtuber = await drizzlePool.query.vtuberTable.findFirst({
//       columns: { name: true },
//       where: eq(vtuberTable.id, id),
//     });
//     if (!getVtuber) {
//       throw Error("getVtuber is undefined");
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(403).json({ msg: "Something went wrong", ok: false });
//   }

//   req.getVtuber = getVtuber;

//   // continue
//   next();
// };

// { /api/vtubers }

// get all vtubers in database

router.route("/get").get(async (req, res) => {
  let findVtubers;
  // getting vtubers
  try {
    findVtubers = await drizzlePool.query.vtuberTable.findMany({
      columns: { createdAt: false, updatedAt: false },
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // no vtuber(s) in database
  if (findVtubers.length === 0) {
    return res
      .status(404)
      .json({ msg: "No vtubers existed in database", ok: false });
  }

  // vtuber(s) existed in database
  res.status(200).json({
    msg: "Successfully retrieved vtuber(s)",
    ok: true,
    data: findVtubers,
  });
});

// get specific vtuber with name
router.route("/get/:name").get(async (req, res) => {
  const { name } = req.params;

  let findVtuber;
  // getting vtuber with requested name
  try {
    findVtuber = await drizzlePool.query.vtuberTable.findFirst({
      columns: { createdAt: false, updatedAt: false },
      where: eq(vtuberTable.name, name),
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // vtuber not found
  if (!findVtuber) {
    return res
      .status(400)
      .json({ msg: "Vtuber doesn't existed in database", ok: false });
  }

  // vtuber existed
  res
    .status(200)
    .json({ msg: "Successfully retrieved vtuber", ok: true, data: findVtuber });
});

// add vtuber { ADMIN }
router
  .route("/add/info")
  .post(checkAuthenticated, checkAdmin, async (req, res) => {
    //* authentication and authority checked in middleware
    const {
      name,
      description,
      height,
      birthdate,
      age,
      youtube,
      twitter,
      discord,
      facebook,
      tier1,
      tier2,
      tier3,
      tier4,
    } = req.body;

    // not enough info to add vtuber
    if (
      !name ||
      !description ||
      !height ||
      !birthdate ||
      !age ||
      !youtube ||
      !twitter ||
      !discord ||
      !facebook ||
      !tier1 ||
      !tier2 ||
      !tier3 ||
      !tier4
    ) {
      return res.status(400).json({ msg: "missing credentials", ok: false });
    }

    let vtuber;
    try {
      vtuber = {
        name,
        description,
        height,
        birthdate,
        age,
        youtube,
        twitter,
        discord,
        facebook,
      };
    } catch (error) {
      console.log(error);
      return res.json(403).json({ msg: "Something went wrong", ok: false });
    }

    let findVtuber;
    // check if vtuber already existed
    try {
      findVtuber = await drizzlePool.query.vtuberTable.findFirst({
        columns: { id: true, name: true },
        where: eq(vtuberTable.name, name),
      });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }

    // vtuber already existed
    if (findVtuber) {
      return res.status(400).json({ msg: "Vtuber already existed", ok: false });
    }

    // can add vtuber

    // * fetch channel_id from youtube data api * TO BE IMPLEMENTED

    let insertedVtuber;
    try {
      insertedVtuber = await drizzlePool
        .insert(vtuberTable)
        .values(vtuber)
        .returning({ id: vtuberTable.id, name: vtuberTable.name });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }

    // add membership tiers
    const membershipTiers = [
      { vtuber_name: vtuber.name, tier: "1" as "1", tierName: tier1 },
      { vtuber_name: vtuber.name, tier: "2" as "2", tierName: tier2 },
      { vtuber_name: vtuber.name, tier: "3" as "3", tierName: tier3 },
      { vtuber_name: vtuber.name, tier: "4" as "4", tierName: tier4 },
    ];
    try {
      await drizzlePool.insert(membershipTierTable).values(membershipTiers);
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }

    res
      .status(201)
      .json({ msg: "Succesfully add vtuber", ok: true, data: insertedVtuber });
  });

// add vtuber port-image { ADMIN Only }
router
  .route("/add/icon-image/:id")
  .post(
    checkAuthenticated,
    checkAdmin,
    multerUploadVtuberIconMiddleware,
    async (req, res) => {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ msg: "missing credentials", ok: false });
      }
      if (!req.file) {
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      try {
        await drizzlePool
          .update(vtuberTable)
          .set({ icon_image: req.file.path })
          .where(eq(vtuberTable.id, id));
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      res.status(200).json({
        msg: "Successfully upload vtuber's icon image",
        ok: true,
        data: req.file.path,
      });
    }
  );

// add vtuber port-image { ADMIN Only }
router
  .route("/add/port-image/:id")
  .post(
    checkAuthenticated,
    checkAdmin,
    multerUploadVtuberPortMiddleware,
    async (req, res) => {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ msg: "missing credentials", ok: false });
      }
      if (!req.file) {
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      try {
        await drizzlePool
          .update(vtuberTable)
          .set({ port_image: req.file.path })
          .where(eq(vtuberTable.id, id));
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      res.status(200).json({
        msg: "Successfully upload vtuber's icon image",
        ok: true,
        data: req.file.path,
      });
    }
  );

// edit vtuber by id { ADMIN }
router
  .route("/edit/:id")
  .put(checkAuthenticated, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      height,
      birthdate,
      age,
      youtube,
      twitter,
      discord,
      facebook,
      tier1,
      tier2,
      tier3,
      tier4,
    } = req.body;

    // not enough info to edit vtuber
    if (
      !id ||
      !name ||
      !description ||
      !height ||
      !birthdate ||
      !age ||
      !youtube ||
      !twitter ||
      !discord ||
      !facebook ||
      !tier1 ||
      !tier2 ||
      !tier3 ||
      !tier4
    ) {
      return res.status(400).json({ msg: "missing credentials", ok: false });
    }

    // update vtuber's info
    try {
      await drizzlePool
        .update(vtuberTable)
        .set({
          name: name,
          description: description,
          height: height,
          birthdate: birthdate,
          age: age,
          youtube: youtube,
          twitter: twitter,
          discord: discord,
          facebook: facebook,
        })
        .where(eq(vtuberTable.id, id))
        .returning({ name: vtuberTable.name });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // update membership tiers for that vtuber
    const membershipTiers = [
      { tier: "1" as "1", tierName: tier1 },
      { tier: "2" as "2", tierName: tier2 },
      { tier: "3" as "3", tierName: tier3 },
      { tier: "4" as "4", tierName: tier4 },
    ];
    try {
      for (const tier of membershipTiers) {
        await drizzlePool
          .update(membershipTierTable)
          .set({ tierName: tier.tierName })
          .where(
            and(
              eq(membershipTierTable.vtuber_name, name),
              eq(membershipTierTable.tier, tier.tier)
            )
          );
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }

    res.status(200).json({ msg: "Vtuber editted successfully", ok: true });
  });
// edit vtuber icon image by id  { ADMIN }
router
  .route("/edit/icon-image/:id")
  .put(
    checkAuthenticated,
    checkAdmin,
    multerUploadVtuberIconMiddleware,
    async (req, res) => {
      if (!req.file) {
        return res
          .status(400)
          .json({ msg: "No image was uploaded", ok: false });
      }

      const { id } = req.params;

      // params check
      if (!id) {
        return res.status(400).json({ msg: "missing parameters", ok: false });
      }

      // updating image
      try {
        await drizzlePool
          .update(vtuberTable)
          .set({ icon_image: req.file.path })
          .where(eq(vtuberTable.id, id));
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      res.status(200).json({ msg: "Image updated successfully", ok: true });
    }
  );
// edit vtuber port image by id  { ADMIN }
router
  .route("/edit/port-image/:id")
  .put(
    checkAuthenticated,
    checkAdmin,
    multerUploadVtuberPortMiddleware,
    async (req, res) => {
      if (!req.file) {
        return res
          .status(400)
          .json({ msg: "No image was uploaded", ok: false });
      }

      const { id } = req.params;

      // params check
      if (!id) {
        return res.status(400).json({ msg: "missing parameters", ok: false });
      }

      // updating image
      try {
        await drizzlePool
          .update(vtuberTable)
          .set({ port_image: req.file.path })
          .where(eq(vtuberTable.id, id));
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      res.status(200).json({ msg: "Image updated successfully", ok: true });
    }
  );

// delete vtuber by id { ADMIN }
router
  .route("/delete/:id")
  .delete(checkAuthenticated, checkAdmin, async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: "missing credentials", ok: false });
    }

    let deletedVtuber;
    // deleting vtuber by id
    try {
      deletedVtuber = await drizzlePool
        .delete(vtuberTable)
        .where(eq(vtuberTable.id, id))
        .returning({ name: vtuberTable.name });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res.status(200).json({
      msg: "Deleted vtuber successfully",
      ok: true,
      data: deletedVtuber[0],
    });
  });

export { router };
