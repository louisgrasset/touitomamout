import bsky, { BskyAgent } from "@atproto/api";
import { ResponseType, ResponseTypeNames } from "@atproto/xrpc";
import pm2 from "@pm2/io";
import Counter from "@pm2/io/build/main/utils/metrics/counter.js";
import Gauge from "@pm2/io/build/main/utils/metrics/gauge.js";
import { Scraper } from "@the-convocation/twitter-scraper";
import { createRestAPIClient, mastodon } from "masto";

import {
  BLUESKY_IDENTIFIER,
  BLUESKY_INSTANCE,
  BLUESKY_PASSWORD,
  MASTODON_ACCESS_TOKEN,
  MASTODON_INSTANCE,
  SYNC_BLUESKY,
  SYNC_MASTODON,
  TWITTER_HANDLE,
} from "../constants.js";
import { handleTwitterAuth } from "../helpers/auth/auth.js";
import { createCacheFile, getCache } from "../helpers/cache/index.js";
import { runMigrations } from "../helpers/cache/run-migrations.js";
import { TouitomamoutError } from "../helpers/error.js";
import { buildConfigurationRules } from "./build-configuration-rules.js";

export const configuration = async (): Promise<{
  synchronizedPostsCountAllTime: Gauge.default;
  synchronizedPostsCountThisRun: Counter.default;
  twitterClient: Scraper;
  mastodonClient: null | mastodon.rest.Client;
  blueskyClient: null | BskyAgent;
}> => {
  // Error handling
  const rules = buildConfigurationRules();
  rules.forEach(({ name, value, message, details, platformEnabled }) => {
    if (platformEnabled) {
      if (!value || value === "") {
        throw new Error(
          TouitomamoutError(message, [
            ...details,
            `Please check '${name}' in your .env settings.`,
          ]),
        );
      }
    }
  });

  // Init configuration
  await createCacheFile();
  await runMigrations();

  const synchronizedPostsCountThisRun = pm2.counter({
    name: "Synced posts this run",
    id: "app/historic/sync/run",
  });

  const synchronizedPostsCountAllTime = pm2.metric({
    name: "Synced posts total",
    id: "app/historic/sync/all_time",
  });
  synchronizedPostsCountAllTime.set(Object.keys(await getCache()).length);

  const synchronizedHandle = pm2.metric({
    name: "User handle",
    id: "app/schema/username",
  });
  synchronizedHandle.set(`@${TWITTER_HANDLE}`);

  const twitterClient = new Scraper();

  await handleTwitterAuth(twitterClient);

  let mastodonClient = null;
  if (SYNC_MASTODON) {
    mastodonClient = createRestAPIClient({
      url: `https://${MASTODON_INSTANCE}`,
      accessToken: MASTODON_ACCESS_TOKEN,
    });
    console.log("🦣 client: ✔ connected");
  }

  let blueskyClient = null;
  if (SYNC_BLUESKY) {
    blueskyClient = new bsky.BskyAgent({
      service: `https://${BLUESKY_INSTANCE}`,
    });
    await blueskyClient
      .login({ identifier: BLUESKY_IDENTIFIER, password: BLUESKY_PASSWORD })
      .catch(({ error }) => {
        switch (error) {
          case ResponseTypeNames[ResponseType.XRPCNotSupported]:
            throw new Error(
              TouitomamoutError(
                "The bluesky instance you have provided is not a bluesky instance",
                [
                  "Please check your .env settings.",
                  "A common error is to provide a bluesky web-client domain instead of the actual bluesky instance",
                ],
              ),
            );
          case ResponseTypeNames[ResponseType.RateLimitExceeded]:
            throw new Error(
              TouitomamoutError(
                "You are currently rate limited by the bluesky instance you have provided",
                [],
              ),
            );
          default:
            console.log({ error });
        }
      });
    console.log("☁️ client: ✔ connected");
  }

  return {
    mastodonClient,
    twitterClient,
    blueskyClient,
    synchronizedPostsCountAllTime,
    synchronizedPostsCountThisRun,
  };
};
