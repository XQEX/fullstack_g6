import passport, { Profile } from "passport";
import { Strategy as localStrategy } from "passport-local";
import { Strategy as googleStrategy } from "passport-google-oauth20";
import { Strategy as twitterStrategy } from "@superfaceai/passport-twitter-oauth2";
import { Strategy as discordStrategy } from "passport-discord";
import { drizzlePool } from "../../db/conn.js";
import { and, eq, or } from "drizzle-orm";
import { oauthPixelianTable, pixelianTable } from "../../db/schema.js";
import bcrypt from "bcrypt";
import { googleOAuth, twitterOAuth, discordOAuth } from "../utils/oauth.js";
import { VerifyCallback } from "passport-oauth2";

interface userObj {
  id: string;
  isOauth: boolean;
}

// Serializer
passport.serializeUser((user, done) => {
  //   console.log(`at serializer: ${user}`);
  done(null, user);
});

// Deserializer
passport.deserializeUser(async (sessionUser: userObj, done) => {
  let user;

  // login by oauth
  if (sessionUser.isOauth) {
    try {
      user = await drizzlePool.query.oauthPixelianTable.findFirst({
        where: eq(oauthPixelianTable.id, sessionUser.id),
      });
    } catch (error) {
      console.log(error);
      done(error, null);
    }
    user = { isOauth: sessionUser.isOauth, ...user };
  }
  // login by authen
  else {
    try {
      user = await drizzlePool.query.pixelianTable.findFirst({
        where: eq(pixelianTable.id, sessionUser.id),
      });
    } catch (error) {
      console.log(error);
      done(error, null);
    }
    user = { isOauth: sessionUser.isOauth, ...user };
  }

  // deserialized successfully!
  done(null, user);
});

// Normal authentication
passport.use(
  "local",
  new localStrategy(
    { usernameField: "name_email" },
    async (username, password, done) => {
      // check if user exist with name or email
      let findUsers;
      try {
        findUsers = await drizzlePool.query.pixelianTable.findMany({
          columns: { id: true, name: true, email: true, password: true },
          where: or(
            eq(pixelianTable.name, username),
            eq(pixelianTable.email, username)
          ),
        });
        // not exist
        if (findUsers.length === 0) {
          return done(null, false, { message: "Pixelian not found" });
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error occured at at findUsers" });
      }

      // check exact user with password
      let findUser;
      try {
        for (const user of findUsers) {
          const isMatch = await bcrypt.compare(password, user.password);

          // found!
          if (isMatch) {
            findUser = user;
            break;
          }
        }

        if (!findUser) {
          return done(null, false, { message: "Incorrect password" });
        }

        const formattedUser = {
          id: findUser.id,
          isOauth: false,
        };
        // login successfully
        return done(null, formattedUser, { message: "login successfully" });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error occured at at checking user's password",
        });
      }
    }
  )
);

// Google OAuth 2.0
passport.use(
  "google",
  new googleStrategy(
    {
      clientID: googleOAuth.clientID,
      clientSecret: googleOAuth.clientSecret,
      callbackURL: googleOAuth.callbackURL,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);

      let findUser;
      // check user exist
      try {
        findUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true, name: true, email: true, profile_picture: true },
          where: and(
            eq(oauthPixelianTable.provider_id, profile.id),
            eq(oauthPixelianTable.provider, profile.provider)
          ),
        });
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at finding user" });
      }

      // check if infos in user are updated
      try {
        if (findUser) {
          if (
            findUser.name !== profile._json.given_name ||
            findUser.email !== profile._json.email ||
            findUser.profile_picture !== profile._json.picture
          ) {
            await drizzlePool
              .update(oauthPixelianTable)
              .set({
                name: profile._json.given_name,
                email: profile._json.email,
                profile_picture: profile._json.picture,
              })
              .where(eq(oauthPixelianTable.id, findUser.id));
          }
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at updating user" });
      }

      //user don't existed, insert user to database
      try {
        if (!findUser) {
          await drizzlePool.insert(oauthPixelianTable).values({
            name: profile._json.given_name as string,
            email: profile._json.email as string,
            profile_picture: profile._json.picture as string,
            provider: profile.provider as string,
            provider_id: profile.id as string,
          });
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at inserting user" });
      }

      // get newly inserted user or editted user
      try {
        findUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true },
          where: and(
            eq(oauthPixelianTable.provider_id, profile.id),
            eq(oauthPixelianTable.provider, profile.provider)
          ),
        });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error at finding inserted user",
        });
      }

      // check again if query failed
      try {
        if (!findUser) {
          throw new Error("Error at returning function in inserting user");
        }

        findUser = { isOauth: true, ...findUser };
        done(null, findUser, { message: "login successfully" });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error at returning function in inserting user",
        });
      }
    }
  )
);

// Twitter OAuth 2.0
passport.use(
  "twitter",
  new twitterStrategy(
    {
      clientType: "confidential",
      clientID: twitterOAuth.clientID,
      clientSecret: twitterOAuth.clientSecret,
      callbackURL: twitterOAuth.callbackURL,
      scope: ["users.read", "tweet.read", "offline.access"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: VerifyCallback
    ) => {
      console.log(profile);
      // done(null, profile);

      let findUser;
      // check user exist
      try {
        findUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true, name: true, email: true, profile_picture: true },
          where: and(
            eq(oauthPixelianTable.provider_id, profile.id),
            eq(oauthPixelianTable.provider, profile.provider)
          ),
        });
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at finding user" });
      }

      // check if infos in user are updated
      try {
        if (findUser) {
          if (
            findUser.name !== profile._json.given_name ||
            findUser.profile_picture !== profile._json.picture
          ) {
            await drizzlePool
              .update(oauthPixelianTable)
              .set({
                name: profile._json.name,
                profile_picture: profile._json.profile_image_url,
              })
              .where(eq(oauthPixelianTable.id, findUser.id));
          }
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at updating user" });
      }

      //user don't existed, insert user to database
      try {
        if (!findUser) {
          await drizzlePool.insert(oauthPixelianTable).values({
            name: profile._json.name as string,
            profile_picture: profile._json.profile_image_url as string,
            provider: profile.provider as string,
            provider_id: profile.id as string,
          });
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at inserting user" });
      }

      // get newly inserted user
      try {
        findUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true },
          where: and(
            eq(oauthPixelianTable.provider_id, profile.id),
            eq(oauthPixelianTable.provider, profile.provider)
          ),
        });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error at finding inserted user",
        });
      }

      // check again if query failed
      try {
        if (!findUser) {
          throw new Error("Error at returning function in inserting user");
        }

        findUser = { isOauth: true, ...findUser };
        done(null, findUser, { message: "login successfully" });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error at returning function in inserting user",
        });
      }
    }
  )
);

// Discord OAuth 2.0
passport.use(
  "discord",
  new discordStrategy(
    {
      clientID: discordOAuth.clientID,
      clientSecret: discordOAuth.clientSecret,
      callbackURL: discordOAuth.callbackURL,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);

      const profileLink = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`;

      let findUser;
      // check if user already exist
      try {
        findUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true, name: true, email: true, profile_picture: true },
          where: and(
            eq(oauthPixelianTable.provider_id, profile.id),
            eq(oauthPixelianTable.provider, profile.provider)
          ),
        });
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at finding user" });
      }

      // check if infos in user are updated
      try {
        if (findUser) {
          if (
            findUser.name !== profile.username ||
            findUser.email !== profile.email ||
            findUser.profile_picture !== profileLink
          ) {
            await drizzlePool
              .update(oauthPixelianTable)
              .set({
                name: profile.username,
                email: profile.email,
                profile_picture: profileLink,
              })
              .where(eq(oauthPixelianTable.id, findUser.id));
          }
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at updating user" });
      }

      // insert new user
      try {
        if (!findUser) {
          await drizzlePool.insert(oauthPixelianTable).values({
            name: profile.username,
            email: profile.email,
            profile_picture: profileLink,
            provider_id: profile.id,
            provider: profile.provider,
          });
        }
      } catch (error) {
        console.log(error);
        return done(error, false, { message: "Error at inserting user" });
      }

      // get new user
      try {
        findUser = await drizzlePool.query.oauthPixelianTable.findFirst({
          columns: { id: true },
          where: and(
            eq(oauthPixelianTable.provider_id, profile.id),
            eq(oauthPixelianTable.provider, profile.provider)
          ),
        });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error at finding inserted user",
        });
      }

      // check again if query failed
      try {
        if (!findUser) {
          throw new Error("Error at returning function in inserting user");
        }

        findUser = { isOauth: true, ...findUser };
        done(null, findUser, { message: "login successfully" });
      } catch (error) {
        console.log(error);
        return done(error, false, {
          message: "Error at returning function in inserting user",
        });
      }
    }
  )
);

export default passport;
