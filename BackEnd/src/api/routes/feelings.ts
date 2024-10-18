import express from "express";
import { drizzlePool } from "../../db/conn.js";
import { checkAuthenticated } from "../middleware/auth.js";
import { pixelianFeelingsTable, vtuberTable } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// { /api/feelings }
// ( Get by using Websocket )

// Routes

// <Post-feeling Route>
router.route("/post").post(checkAuthenticated, async (req, res) => {
  const { feeling, vtuber_name } = req.body;
  if (!feeling || !vtuber_name) {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  let findVtuber;
  // check if vtuber existed
  try {
    findVtuber = await drizzlePool.query.vtuberTable.findFirst({
      columns: { name: true },
      where: eq(vtuberTable.name, vtuber_name),
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }
  if (!findVtuber) {
    return res.status(400).json({ msg: "Vtuber doesn't existed", ok: false });
  }

  const curUser = req.user as any;
  try {
    // feeling from oauth user
    if (curUser.isOauth) {
      await drizzlePool.insert(pixelianFeelingsTable).values({
        oauth_pixelian_id: curUser.id,
        feeling: feeling,
        vtuber_name: vtuber_name,
      });
    }
    // feeling from authen user
    else {
      await drizzlePool.insert(pixelianFeelingsTable).values({
        pixelian_id: curUser.id,
        feeling: feeling,
        vtuber_name: vtuber_name,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  res.status(201).json({ msg: "Successfully post feeling", ok: true });
});

// <Edit-feeling Route>
router.route("/edit/:id").put(checkAuthenticated, async (req, res) => {
  const { feeling } = req.body;
  if (!feeling) {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  let findFeeling;
  try {
    findFeeling = await drizzlePool.query.pixelianFeelingsTable.findFirst({
      columns: { pixelian_id: true, oauth_pixelian_id: true },
      where: eq(pixelianFeelingsTable.id, id),
    });
    if (!findFeeling) {
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  const curUser = req.user as any;
  // oauth owner check
  if (curUser.isOauth && curUser.id !== findFeeling.oauth_pixelian_id) {
    return res
      .status(401)
      .json({ msg: "Pixelian isn't the owner of this feeling", ok: false });
  }
  // authen owner check
  else if (!curUser.isOauth && curUser.id !== findFeeling.pixelian_id) {
    return res
      .status(401)
      .json({ msg: "Pixelian isn't the owner of this feeling", ok: false });
  }

  try {
    await drizzlePool
      .update(pixelianFeelingsTable)
      .set({ feeling: feeling })
      .where(eq(pixelianFeelingsTable.id, id));
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  res.status(200).json({ msg: "Successfully updated feeling", ok: true });
});

// <Delete-feeling Route> (Admin can delete any feeling)
router.route("/delete/:id").delete(checkAuthenticated, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  const curUser = req.user as any;
  // if user is an Admin(skip this), can delete any feeling of any users
  if (curUser.role !== "ADMIN") {
    let findFeeling;
    // get the feeling owner's id to be checked
    try {
      findFeeling = await drizzlePool.query.pixelianFeelingsTable.findFirst({
        columns: { pixelian_id: true, oauth_pixelian_id: true },
        where: eq(pixelianFeelingsTable.id, id),
      });
      if (!findFeeling) {
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // check oauth owner
    if (curUser.isOauth && curUser.id !== findFeeling.oauth_pixelian_id) {
      return res
        .status(401)
        .json({ msg: "Pixelian isn't the owner of this feeling", ok: false });
    }
    // check authen owner
    else if (!curUser.isOauth && curUser.id !== findFeeling.pixelian_id) {
      return res
        .status(401)
        .json({ msg: "Pixelian isn't the owner of this feeling", ok: false });
    }
  }

  // deleting feeling
  try {
    await drizzlePool
      .delete(pixelianFeelingsTable)
      .where(eq(pixelianFeelingsTable.id, id));
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  res.status(200).json({ msg: "Successfully deleted feeling", ok: true });
});

export { router };
