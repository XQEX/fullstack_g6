import "dotenv/config";

export const googleOAuth = {
  clientID: process.env.GOOGLE_OAUTH_CLIENTID as string,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENTSECRET as string,
  callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL as string,
};

export const twitterOAuth = {
  clientID: process.env.TWITTER_OAUTH_CLIENTID as string,
  clientSecret: process.env.TWITTER_OAUTH_CLIENTSECRET as string,
  callbackURL: process.env.TWITTER_OAUTH_CALLBACK_URL as string,
  authorURL: process.env.TWITTER_OAUTH_AUTHOR_URL as string,
  tokenURL: process.env.TWITTER_OAUTH_TOKEN_URL as string,
};

export const discordOAuth = {
  clientID: process.env.DISCORD_OAUTH_CLIENTID as string,
  clientSecret: process.env.DISCORD_OAUTH_CLIENTSECRET as string,
  callbackURL: process.env.DISCORD_OAUTH_CALLBACK_URL as string,
};
