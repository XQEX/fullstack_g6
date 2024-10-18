import express, { NextFunction } from "express";
import { drizzlePool } from "../../db/conn.js";
import bcrypt from "bcrypt";
import { and, eq, or } from "drizzle-orm";
import {
  incomingPixelianMemberProofTable,
  membershipTierTable,
  oauthPixelianMembershipTable,
  oauthPixelianTable,
  pixelianMemberShipTable,
  pixelianTable,
} from "../../db/schema.js";
import passport from "../middleware/passport.js";
import {
  uploadProfileImage,
  uploadMembershipProofImage,
} from "../middleware/multer.js";
import {
  checkAuthenticated,
  checkUnauthenticated,
  checkAdmin,
} from "../middleware/auth.js";
import { WebSocket } from "ws";

// variable utils
import { frontEndURL, saltRounds } from "../utils/stdUtils.js";

// function utils
import { webss as wss } from "../utils/websocketUtils.js";

// custom middleware
const multerUploadMembership = (req: any, res: any, next: NextFunction) => {
  uploadMembershipProofImage.single("mebmership_image")(req, res, (err) => {
    // check for error
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image size exceeded 5MB.", ok: false });
      }
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // continue
    next();
  });
};
const multerUploadProfileImage = (req: any, res: any, next: NextFunction) => {
  uploadProfileImage.single("profile_image")(req, res, (err) => {
    // handle error
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image size exceeded 3MB.", ok: false });
      }
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    // continue
    next();
  });
};

// custom variables

// { /api/users }
const router = express.Router();

// Routes
// <Dummy Route>
router.get("/", checkAuthenticated, async (req, res) => {
  try {
    // console.log(req);
    res.send("Hello World xD");
  } catch (error) {
    console.log(error);
  }
});

// <Validate-Session Route>
router.route("/info").get(checkAuthenticated, async (req, res) => {
  let curUser = req.user as any;

  // console.log(curUser);

  //normal authen
  if (!curUser.isOauth) {
    delete curUser.password;
  }
  res.status(200).json({
    msg: "Sucessfully get authenticated user",
    ok: true,
    data: curUser,
  });
});

// <Register Route>
router.route("/register").post(checkUnauthenticated, async (req, res) => {
  const { username, email, password } = req.body;

  // check null
  if (!username || !email || !password) {
    return res.status(400).json({
      msg: "missing credentials",
      ok: false,
    });
  }

  // hashing password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, Number(saltRounds));
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  // fail-safe
  if (!hashedPassword) {
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  let findEmailUser;
  try {
    // check duplicate email
    findEmailUser = await drizzlePool.query.pixelianTable.findFirst({
      columns: { email: true },
      where: eq(pixelianTable.email, email),
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  // found duplicate email
  if (findEmailUser) {
    return res.status(400).json({
      msg: "Email is already authenticated. Please try another email",
      ok: false,
    });
  }

  let findUsers;
  try {
    // check duplicate username
    findUsers = await drizzlePool.query.pixelianTable.findMany({
      columns: { name: true, password: true },
      where: eq(pixelianTable.name, username),
    });

    // atleast 1 username existed
    if (findUsers.length > 0) {
      // check duplicate password
      let findExactUser = false;
      for (const user of findUsers) {
        findExactUser = await bcrypt.compare(password, user.password);
        if (findExactUser) break; // found!
      }

      // pixelian already existed
      if (findExactUser) {
        return res
          .status(400)
          .json({ msg: "Pixelian already existed", ok: false });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  //console.log(findExactUser);

  try {
    // register successfully
    const query = await drizzlePool
      .insert(pixelianTable)
      .values({ name: username, password: hashedPassword, email: email })
      .returning({
        id: pixelianTable.id,
        name: pixelianTable.name,
      });

    res.status(201).json({
      msg: "Sucessfully registered!",
      ok: true,
      data: query[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }
});

// <Login Route>
router.route("/login").post(checkUnauthenticated, async (req, res) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) {
      return res.status(403).json({ msg: info.message, ok: false });
    }
    if (!user) {
      return res.status(400).json({ msg: info.message, ok: false });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(403).json({ msg: "Something went wrong", ok: false });
      }

      res.status(200).json({ msg: info.message, data: user, ok: true });
    });
  })(req, res);
});

// <Google-OAuth Route>
router.route("/oauth/google").get(passport.authenticate("google"));
router.route("/oauth/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: `${frontEndURL}?message=failure`,
    successRedirect: `${frontEndURL}?message=success`,
  })
);

// <Twitter-OAuth Route>
router.route("/oauth/twitter").get(passport.authenticate("twitter"));
router.route("/oauth/twitter/callback").get(
  passport.authenticate("twitter", {
    failureRedirect: `${frontEndURL}?message=failure`,
    successRedirect: `${frontEndURL}?message=success`,
  })
);

// <Discord-OAuth Route>
router.route("/oauth/discord").get(passport.authenticate("discord"));
router.route("/oauth/discord/callback").get(
  passport.authenticate("discord", {
    failureRedirect: `${frontEndURL}?message=failure`,
    successRedirect: `${frontEndURL}?message=success`,
  })
);

// <Edit-Name Route>
router.route("/edit/username").put(checkAuthenticated, async (req, res) => {
  if ((req.user as any).isOauth) {
    return res
      .status(400)
      .json({ msg: "OAuth pixelian can't edit profile", ok: false });
  }

  const { username, password } = req.body;

  // no username or password passed in body
  if (!username || username === "" || !password || password === "") {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  //get user's password
  let userPassword;
  try {
    userPassword = await drizzlePool.query.pixelianTable.findFirst({
      columns: { password: true },
      where: eq(pixelianTable.id, (req.user as any).id),
    });
    // fail-safe
    if (!userPassword) {
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }
  // check if password is correct
  try {
    const comparePassword = await bcrypt.compare(
      password,
      userPassword.password
    );
    // wrong password, can't change username
    if (!comparePassword) {
      return res.status(400).json({ msg: "Incorrect password", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // get all users's password with the same new username
  let findUsers;
  try {
    findUsers = await drizzlePool.query.pixelianTable.findMany({
      columns: { password: true },
      where: eq(pixelianTable.name, username),
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // user-password unique constraint check (if find duplicate usernames)
  if (findUsers.length !== 0) {
    try {
      let isExact = false;
      for (const user of findUsers) {
        isExact = await bcrypt.compare(password, user.password);

        // found duplicate user with same username and password
        if (isExact) {
          return res.status(400).json({
            msg: "Can't use this username. Please try another username",
            ok: false,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }
  }

  // updating username
  try {
    await drizzlePool
      .update(pixelianTable)
      .set({ name: username })
      .where(eq(pixelianTable.id, (req.user as any).id));
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  res.status(200).json({
    msg: "successfully updated pixelian's username",
    ok: true,
    data: (req.user as any).id,
  });
});

// <Edit-Email Route>
router.route("/edit/email").put(checkAuthenticated, async (req, res) => {
  if ((req.user as any).isOauth) {
    return res
      .status(400)
      .json({ msg: "OAuth pixelian can't edit profile", ok: false });
  }

  const { email, password } = req.body;

  //get user's password
  let userPassword;
  try {
    userPassword = await drizzlePool.query.pixelianTable.findFirst({
      columns: { password: true },
      where: eq(pixelianTable.id, (req.user as any).id),
    });
    // fail-safe
    if (!userPassword) {
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }
  // check if password is correct
  try {
    const comparePassword = await bcrypt.compare(
      password,
      userPassword.password
    );
    // wrong password
    if (!comparePassword) {
      return res.status(400).json({ msg: "Incorrect password", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // no email passed in body
  if (!email || email === "" || !password || password === "") {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  // check duplicate emails
  try {
    const findExactEmail = await drizzlePool.query.pixelianTable.findFirst({
      columns: { id: true },
      where: eq(pixelianTable.email, email),
    });

    // found duplicate email
    if (findExactEmail) {
      return res.status(400).json({ msg: "Email is already used", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // updating email
  try {
    await drizzlePool
      .update(pixelianTable)
      .set({ email: email })
      .where(eq(pixelianTable.id, (req.user as any).id));
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  res.status(200).json({
    msg: "successfully updated pixelian's email",
    ok: true,
    data: (req.user as any).id,
  });
});

// <Edit-Password Route>
router.route("/edit/password").put(checkAuthenticated, async (req, res) => {
  if ((req.user as any).isOauth) {
    return res
      .status(400)
      .json({ msg: "OAuth pixelian can't edit profile", ok: false });
  }

  const { old_password, password } = req.body;

  // no password passed in body
  if (!password || password === "" || !old_password || old_password === "") {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  //get user's password
  let userPassword;
  try {
    userPassword = await drizzlePool.query.pixelianTable.findFirst({
      columns: { password: true },
      where: eq(pixelianTable.id, (req.user as any).id),
    });
    // fail-safe
    if (!userPassword) {
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }
  // check if old password is correct
  try {
    const comparePassword = await bcrypt.compare(
      old_password,
      userPassword.password
    );
    // wrong old password
    if (!comparePassword) {
      return res.status(400).json({ msg: "Incorrect password", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  let hashedPassword;
  // hashing password
  try {
    hashedPassword = await bcrypt.hash(password, Number(saltRounds));
    // fail-safe
    if (!hashedPassword) {
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  // updating password
  try {
    await drizzlePool
      .update(pixelianTable)
      .set({ password: hashedPassword })
      .where(eq(pixelianTable.id, (req.user as any).id));
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong.", ok: false });
  }

  res.status(200).json({
    msg: "successfully updated pixelian's password",
    ok: true,
    data: (req.user as any).id,
  });
});

// <Upload-Profile-Image Route>
router
  .route("/upload/profile_image")
  .post(checkAuthenticated, multerUploadProfileImage, async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: "No image was uploaded", ok: false });
    }
    //console.log(req.file.path);

    // file uploaded successfully

    // updating user's profile picture url
    try {
      await drizzlePool
        .update(pixelianTable)
        .set({ profile_picture: req.file.path })
        .where(eq(pixelianTable.id, (req.user as any).id));
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res.status(200).json({
      msg: "Sucessfully upload image",
      ok: true,
      data: { name: req.file.originalname, url: req.file.path },
    });
  });

// <Choose-Fav-Vtuber Route>
router.route("/fav_vtuber").post(checkAuthenticated, async (req, res) => {
  const { vtuber_name } = req.body;

  if (!vtuber_name) {
    return res.status(400).json({ msg: "missing credentials", ok: false });
  }

  // updating user's fav vtuber
  try {
    if ((req.user as any).isOauth) {
      await drizzlePool
        .update(oauthPixelianTable)
        .set({ favorite_vtuber: vtuber_name })
        .where(eq(oauthPixelianTable.id, (req.user as any).id));
    } else {
      await drizzlePool
        .update(pixelianTable)
        .set({ favorite_vtuber: vtuber_name })
        .where(eq(pixelianTable.id, (req.user as any).id));
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  res
    .status(200)
    .json({ msg: "Successfully choose your favorite vtuber", ok: true });
});

// <Get all of user's memberships Route>
router.route("/get/memberships").get(checkAuthenticated, async (req, res) => {
  const curUser = req.user as any;

  let getUserMemberships;
  try {
    // login via oauth
    if (curUser.isOauth) {
      getUserMemberships = await drizzlePool
        .select({
          vtuber: membershipTierTable.vtuber_name,
          tier: membershipTierTable.tier,
          tier_name: membershipTierTable.tierName,
        })
        .from(oauthPixelianTable)
        .innerJoin(
          oauthPixelianMembershipTable,
          eq(
            oauthPixelianTable.id,
            oauthPixelianMembershipTable.oauth_pixelian_id
          )
        )
        .innerJoin(
          membershipTierTable,
          eq(
            membershipTierTable.id,
            oauthPixelianMembershipTable.membership_tier_id
          )
        )
        .where(eq(oauthPixelianTable.id, curUser.id));
    }
    // login via authen
    else {
      getUserMemberships = await drizzlePool
        .select({
          vtuber: membershipTierTable.vtuber_name,
          tier: membershipTierTable.tier,
          tier_name: membershipTierTable.tierName,
        })
        .from(pixelianTable)
        .innerJoin(
          pixelianMemberShipTable,
          eq(pixelianTable.id, pixelianMemberShipTable.pixelian_id)
        )
        .innerJoin(
          membershipTierTable,
          eq(membershipTierTable.id, pixelianMemberShipTable.membership_tier_id)
        )
        .where(eq(pixelianTable.id, curUser.id));
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({ msg: "Something went wrong", ok: false });
  }

  res
    .status(200)
    .json({
      msg: "Successfully retrieve membership tiers",
      ok: true,
      data: getUserMemberships,
    });
});

// <Upload-Membership-Proof Route>
router
  .route("/upload/membership")
  .post(checkAuthenticated, multerUploadMembership, async (req, res) => {
    if (!req.file) {
      return res.json(403).json({ msg: "Something went wrong", ok: false });
    }

    try {
      // oauth user
      if ((req.user as any).isOauth) {
        await drizzlePool.insert(incomingPixelianMemberProofTable).values({
          oauth_pixelian_id: (req.user as any).id,
          membership_proof_image: req.file.path,
        });
      }
      // normal authen user
      else {
        await drizzlePool.insert(incomingPixelianMemberProofTable).values({
          pixelian_id: (req.user as any).id,
          membership_proof_image: req.file.path,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(403).json({ msg: "Something went wrong", ok: false });
    }

    res.status(200).json({ msg: "Successfully upload proof image", ok: true });
  });

// <Logout Route>
router.route("/logout").post(async (req, res) => {
  // is logged-in
  if (req.isAuthenticated()) {
    const curSession = req.user as any;

    let logoutUser;

    // login by oauth
    if (curSession.isOauth) {
      try {
        logoutUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true, name: true },
          where: eq(curSession.id, oauthPixelianTable.id),
        });
      } catch (error) {
        console.log(error);
      }
    }
    // login by authen
    else {
      try {
        logoutUser = await drizzlePool.query.pixelianTable.findFirst({
          columns: { id: true, name: true },
          where: eq(curSession.id, pixelianTable.id),
        });
      } catch (error) {
        console.log(error);
      }
    }

    // fail-safe (impossible to happen)
    if (!logoutUser) {
      return res.status(403).json({ msg: "Something went wrong.", ok: false });
    }

    // close websocket if open
    if (wss) {
      wss.clients.forEach((client) => {
        const c = client as WebSocket;
        if (
          c.readyState === WebSocket.OPEN &&
          c.userInfo.id === (req.user as any).id &&
          c.userInfo.isOauth === (req.user as any).isOauth
        ) {
          c.close();
        }
      });
    }

    // logout successfully
    return req.logOut((err) => {
      try {
        if (err) {
          throw new Error(err);
        }
      } catch (error) {
        console.log(error);
        return res
          .status(403)
          .json({ msg: "Something went wrong.", ok: false });
      }

      //destroy session-cookie
      req.session.destroy((err) => {
        try {
          if (err) {
            throw new Error(err);
          }
          res.clearCookie("connSessID");
          res.status(200).json({
            msg: "Successfully logout!",
            ok: true,
            data: logoutUser,
          });
        } catch (error) {
          console.log(error);
          return res
            .status(403)
            .json({ msg: "Something went wrong.", ok: false });
        }
      });
    });
  }

  // user not logged-in
  res
    .status(400)
    .json({ msg: "Can't logout, Pixelian aren't logged in", ok: false });
});

// <Delete Route>
router.route("/delete").delete(async (req, res) => {
  // is logged-in
  if (req.isAuthenticated()) {
    const curSession = req.user as any;

    let deleteUser;

    // login by oauth
    if (curSession.isOauth) {
      try {
        await drizzlePool
          .delete(oauthPixelianTable)
          .where(eq(oauthPixelianTable.id, curSession.id));
      } catch (error) {
        console.log(error);
      }
    }
    // login by authen
    else {
      try {
        await drizzlePool
          .delete(pixelianTable)
          .where(eq(pixelianTable.id, curSession.id));
      } catch (error) {
        console.log(error);
      }
    }

    // close websocket if open
    if (wss) {
      wss.clients.forEach((client) => {
        const c = client as WebSocket;
        if (
          c.readyState === WebSocket.OPEN &&
          c.userInfo.id === (req.user as any).id &&
          c.userInfo.isOauth === (req.user as any).isOauth
        ) {
          c.close();
        }
      });
    }

    // logout successfully
    return req.logOut((err) => {
      try {
        if (err) {
          throw new Error(err);
        }
      } catch (error) {
        console.log(error);
        return res
          .status(403)
          .json({ msg: "Something went wrong.", ok: false });
      }

      //destroy session-cookie
      req.session.destroy((err) => {
        try {
          if (err) {
            throw new Error(err);
          }
          res.clearCookie("connSessID");
          res.status(200).json({
            msg: "Successfully delete user!",
            ok: true,
            data: curSession,
          });
        } catch (error) {
          console.log(error);
          return res
            .status(403)
            .json({ msg: "Something went wrong.", ok: false });
        }
      });
    });
  }

  // user not logged-in
  res
    .status(400)
    .json({ msg: "Can't logout, Pixelian aren't logged in", ok: false });
});

export { router };
