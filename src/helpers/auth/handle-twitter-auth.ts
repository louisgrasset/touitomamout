import { Scraper } from "@the-convocation/twitter-scraper";
import ora from "ora";

import { TWITTER_PASSWORD, TWITTER_USERNAME } from "../../constants";
import { saveCookies } from "../cookies/save-cookies";
import { oraPrefixer } from "../logs";
import { restorePreviousSession } from "./restore-previous-session";

export const handleTwitterAuth = async (client: Scraper) => {
  const log = ora({
    color: "gray",
    prefixText: oraPrefixer("🦤 client"),
  }).start("connecting to twitter...");

  if (!TWITTER_USERNAME || !TWITTER_PASSWORD) {
    log.succeed("connected as guest | replies will not be synced");
    return;
  }

  // Try to restore the previous session
  await restorePreviousSession(client);

  if (await client.isLoggedIn()) {
    log.succeed("connected (session restored)");
  } else {
    // Handle restoration failure
    await client.login(TWITTER_USERNAME, TWITTER_PASSWORD);
    log.succeed("connected (using credentials)");
  }
  log.stop();

  // Save session
  if (await client.isLoggedIn()) {
    await client.getCookies().then((cookies) => {
      saveCookies(cookies);
    });
  }
};
