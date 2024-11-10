import { AtpAgent } from "@atproto/api";
import { ResponseType, ResponseTypeNames } from "@atproto/xrpc";
import pm2 from "@pm2/io";
import type Counter from "@pm2/io/build/main/utils/metrics/counter";
import type Gauge from "@pm2/io/build/main/utils/metrics/gauge";
import { Scraper } from "@the-convocation/twitter-scraper";
import { readFile } from "fs/promises";
import { createRestAPIClient, mastodon } from "masto";
import ora from "ora";

import {
  BLUESKY_IDENTIFIER,
  BLUESKY_INSTANCE,
  BLUESKY_PASSWORD,
  MASTODON_ACCESS_TOKEN,
  MASTODON_INSTANCE,
  MENTION_MAPPING_PATH,
  SYNC_BLUESKY,
  SYNC_DRY_RUN,
  SYNC_MASTODON,
  TOUITOMAMOUT_VERSION,
  TWITTER_HANDLE,
} from "../constants";
import { handleTwitterAuth } from "../helpers/auth/handle-twitter-auth";
import { createCacheFile } from "../helpers/cache/create-cache";
import { getCachedPosts } from "../helpers/cache/get-cached-posts";
import { runMigrations } from "../helpers/cache/run-migrations";
import { TouitomamoutError } from "../helpers/error";
import { oraPrefixer } from "../helpers/logs";
import { MentionMapping } from "../types/mentionMapping";
import { buildConfigurationRules } from "./build-configuration-rules";

export const configuration = async (): Promise<{
  synchronizedPostsCountAllTime: Gauge;
  synchronizedPostsCountThisRun: Counter;
  twitterClient: Scraper;
  mastodonClient: null | mastodon.rest.Client;
  blueskyClient: null | AtpAgent;
  mentionsMapping: MentionMapping[];
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

  console.log(`\nTouitomamout@v${TOUITOMAMOUT_VERSION}\n`);

  if (SYNC_DRY_RUN) {
    ora({
      color: "gray",
      prefixText: oraPrefixer("✌️ dry run"),
    }).info("mode enabled (no post will be posted)");
  }

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
  synchronizedPostsCountAllTime.set(Object.keys(await getCachedPosts()).length);

  const synchronizedHandle = pm2.metric({
    name: "User handle",
    id: "app/schema/username",
  });
  synchronizedHandle.set(`@${TWITTER_HANDLE}`);

  const twitterClient = new Scraper();

  await handleTwitterAuth(twitterClient);

  let mastodonClient = null;
  if (SYNC_MASTODON) {
    const log = ora({
      color: "gray",
      prefixText: oraPrefixer("🦣 client"),
    }).start("connecting to mastodon...");

    mastodonClient = createRestAPIClient({
      url: `https://${MASTODON_INSTANCE}`,
      accessToken: MASTODON_ACCESS_TOKEN,
    });

    await mastodonClient.v1.accounts
      .verifyCredentials()
      .then(() => log.succeed("connected"))
      .catch(() => {
        log.fail("authentication failure");
        throw new Error(
          TouitomamoutError(
            "Touitomamout was unable to connect to mastodon with the given credentials",
            ["Please check your .env settings."],
          ),
        );
      });
  }

  let blueskyClient = null;
  if (SYNC_BLUESKY) {
    const log = ora({
      color: "gray",
      prefixText: oraPrefixer("☁️ client"),
    }).start("connecting to bluesky...");

    blueskyClient = new AtpAgent({
      service: `https://${BLUESKY_INSTANCE}`,
    });
    await blueskyClient
      .login({
        identifier: BLUESKY_IDENTIFIER,
        password: BLUESKY_PASSWORD,
      })
      .then(() => {
        log.succeed("connected");
      })
      .catch(({ error }) => {
        log.fail("authentication failure");
        switch (error) {
          case ResponseTypeNames[ResponseType.AuthRequired]:
            throw new Error(
              TouitomamoutError(
                "Touitomamout was unable to connect to bluesky with the given credentials",
                ["Please check your .env settings."],
              ),
            );
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
            console.log(error);
        }
      });
  }

  let mentionsMapping: MentionMapping[] = [];

  try {
    const content = (await readFile(MENTION_MAPPING_PATH)).toString();
    mentionsMapping = JSON.parse(content) as MentionMapping[];
  } catch (e) {
    const log = ora({
      color: "gray",
      prefixText: oraPrefixer("mention-mapping"),
    });
    if (e instanceof Error && "code" in e && e.code == "ENOENT") {
      log.warn(`No mention mapping file found (${MENTION_MAPPING_PATH})`);
    } else {
      log.fail(`Error when read ${MENTION_MAPPING_PATH}`);
      console.error(e);
    }
  }

  return {
    mastodonClient,
    twitterClient,
    blueskyClient,
    synchronizedPostsCountAllTime,
    synchronizedPostsCountThisRun,
    mentionsMapping,
  };
};
