import express from "express";
import { drizzlePool } from "../../db/conn.js";
import { checkAuthenticated, checkAdmin } from "../middleware/auth.js";
import {
  incomingPixelianMemberProofTable,
  membershipTierTable,
  oauthPixelianMembershipTable,
  pixelianMemberShipTable,
  vtuberTable,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// { /api/admins }

// Routes

// <Get All-Users Route>
router
  .route("/get/users")
  .get(checkAuthenticated, checkAdmin, async (req, res) => {
    let users;
    // get all normal authen. users
    let normalUsers;
    let formattedNormalUsers;
    try {
      normalUsers = await drizzlePool.query.pixelianTable.findMany({
        columns: { id: true, name: true, email: true, profile_picture: true },
      });
      if (normalUsers.length !== 0) {
        const tempUsers = [];
        for (const user of normalUsers) {
          tempUsers.push({ isOauth: false, ...user });
        }
        formattedNormalUsers = [...tempUsers];
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Someting went wrong", ok: false });
    }

    // get all oauth users
    let oauthUsers;
    let formattedOauthUsers;
    try {
      oauthUsers = await drizzlePool.query.oauthPixelianTable.findMany({
        columns: {
          id: true,
          provider: true,
          name: true,
          email: true,
          profile_picture: true,
        },
      });
      if (oauthUsers.length !== 0) {
        const tempUsers = [];
        for (const user of oauthUsers) {
          tempUsers.push({ isOauth: true, ...user });
        }
        formattedOauthUsers = [...tempUsers];
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // setting up final users
    if (formattedNormalUsers && formattedOauthUsers) {
      users = [...formattedNormalUsers, ...formattedOauthUsers];
    } else if (formattedNormalUsers && !formattedOauthUsers) {
      users = [...formattedNormalUsers];
    } else if (!formattedNormalUsers && formattedOauthUsers) {
      users = [...formattedOauthUsers];
    }

    // impossible to happen
    if (!users) {
      return res.status(200).json({ msg: "No users existed", ok: true });
    }

    res
      .status(200)
      .json({ msg: "Successfully retrieved all users", ok: true, data: users });
  });

// <Get All memberships>
router
  .route("/get/memberships")
  .get(checkAuthenticated, checkAdmin, async (req, res) => {
    let getMemberships;
    try {
      getMemberships = await drizzlePool
        .select({
          id: membershipTierTable.id,
          vtuber_name: vtuberTable.name,
          tier: membershipTierTable.tier,
          tier_name: membershipTierTable.tierName,
        })
        .from(membershipTierTable)
        .innerJoin(
          vtuberTable,
          eq(membershipTierTable.vtuber_name, vtuberTable.name)
        );
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    if (getMemberships.length === 0) {
      return res.status(200).json({ msg: "No memberships exist", ok: true });
    }

    res.status(200).json({
      msg: "Successfully retrieve all memberships",
      ok: true,
      data: getMemberships,
    });
  });

// <Get memberships of a vtuber by { id }>
router
  .route("/get/memberships/:vtuberId")
  .get(checkAuthenticated, checkAdmin, async (req, res) => {
    const { vtuberId } = req.params;
    if (!vtuberId) {
      return res.json(403).json({ msg: "missing parameters", ok: false });
    }
    let getVtuberMemberships;
    try {
      getVtuberMemberships = await drizzlePool
        .select({
          id: membershipTierTable.id,
          vtuber_name: vtuberTable.name,
          tier: membershipTierTable.tier,
          tier_name: membershipTierTable.tierName,
        })
        .from(membershipTierTable)
        .innerJoin(
          vtuberTable,
          eq(membershipTierTable.vtuber_name, vtuberTable.name)
        )
        .where(eq(vtuberTable.id, vtuberId));
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    if (getVtuberMemberships.length === 0) {
      return res
        .status(200)
        .json({ msg: "This vtuber doesn't have any memberships", ok: true });
    }

    res.status(200).json({
      msg: `Successfully retrieve vtuber: ${getVtuberMemberships[0].vtuber_name}'s memberships`,
      ok: true,
      data: getVtuberMemberships,
    });
  });

// <Add vtuber membership>
router
  .route("/add/memberships")
  .post(checkAuthenticated, checkAdmin, async (req, res) => {
    const { vtuber_name, tier, tier_name } = req.body;
    if (!vtuber_name || !tier || !tier_name) {
      return res.status(400).json({ msg: "missing credentials", ok: false });
    }

    // inserting into database
    try {
      await drizzlePool
        .insert(membershipTierTable)
        .values({ vtuber_name: vtuber_name, tier: tier, tierName: tier_name });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res
      .status(201)
      .json({ msg: "Successfully insert membership tier", ok: true });
  });

// <Approved of Membership Route>
router
  .route("/membership/approve/:id")
  .post(checkAuthenticated, checkAdmin, async (req, res) => {
    const { membership_tier_id } = req.body;
    const { id } = req.params;
    if (!membership_tier_id) {
      return res.status(400).json({ msg: "missing credentials", ok: false });
    }
    if (!id) {
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    let membershipProof;
    // deleting membershipProof from pending table
    try {
      membershipProof = await drizzlePool
        .delete(incomingPixelianMemberProofTable)
        .where(eq(incomingPixelianMemberProofTable.id, id))
        .returning({
          pixelian_id: incomingPixelianMemberProofTable.pixelian_id,
          oauth_pixelian_id: incomingPixelianMemberProofTable.oauth_pixelian_id,
        });
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }
    // membershipProof doesn't existed
    if (membershipProof.length === 0) {
      return res
        .status(400)
        .json({ msg: "No pending membership-proof existed", ok: false });
    }

    // give the membership to the user
    // from oauth user
    if (
      !membershipProof[0].pixelian_id &&
      membershipProof[0].oauth_pixelian_id
    ) {
      try {
        await drizzlePool.insert(oauthPixelianMembershipTable).values({
          oauth_pixelian_id: membershipProof[0].oauth_pixelian_id,
          membership_tier_id: membership_tier_id,
        });
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }
    }
    // from authen user
    else if (
      membershipProof[0].pixelian_id &&
      !membershipProof[0].oauth_pixelian_id
    ) {
      try {
        await drizzlePool.insert(pixelianMemberShipTable).values({
          pixelian_id: membershipProof[0].pixelian_id,
          membership_tier_id: membership_tier_id,
        });
      } catch (error) {
        console.log(error);
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }
    } else {
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res.status(200).json({
      msg: "Successfully approved pixelian's membership proof",
      ok: true,
    });
  });

// <Deny-Membership Route>
router
  .route("/membership/deny/:id")
  .delete(checkAuthenticated, checkAdmin, async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // deleting from pending membership-proof table
    try {
      await drizzlePool
        .delete(incomingPixelianMemberProofTable)
        .where(eq(incomingPixelianMemberProofTable.id, id));
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res.status(200).json({
      msg: "Succesfully denied pixelian's membership proof",
      ok: true,
    });
  });

export { router };
