import { configuration } from "./configuration/configuration.js";
import {
  DAEMON,
  DAEMON_PERIOD_MIN,
  SYNC_BLUESKY,
  SYNC_MASTODON,
  TWITTER_HANDLE,
} from "./constants.js";
import {
  postsSynchronizerService,
  profileSynchronizerService,
} from "./services/index.js";

const {
  twitterClient,
  mastodonClient,
  synchronizedPostsCountAllTime,
  synchronizedPostsCountThisRun,
  blueskyClient,
} = await configuration();

/**
 * Let the magic happens 💫.
 */
const touitomamout = async () => {
  if (SYNC_MASTODON && !mastodonClient) {
    throw new Error("Can't connect to Mastodon 🦣");
  }
  if (SYNC_BLUESKY && !blueskyClient) {
    throw new Error("Can't connect to Bluesky ☁️");
  }
  if (!twitterClient) {
    throw new Error("Can't connect to Twitter 🦤");
  }

  await profileSynchronizerService(
    twitterClient,
    mastodonClient,
    blueskyClient,
  );
  const response = await postsSynchronizerService(
    twitterClient,
    mastodonClient,
    blueskyClient,
    synchronizedPostsCountThisRun,
  );
  synchronizedPostsCountAllTime.set(response.metrics.totalSynced);

  console.log("\n🦤 → 🦣+☁️");
  console.log("Touitomamout sync");
  console.log(`| Twitter handle: @${TWITTER_HANDLE}`);
  console.log(
    `| ${response.metrics.justSynced
      .toString()
      .padStart(5, "0")}  ʲᵘˢᵗ ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ`,
  );
  console.log(
    `| ${response.metrics.totalSynced
      .toString()
      .padStart(5, "0")}  ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ ˢᵒ ᶠᵃʳ`,
  );
};

await touitomamout();

if (DAEMON) {
  console.log(`Run daemon every ${DAEMON_PERIOD_MIN}min`);
  setInterval(
    async () => {
      await touitomamout();
    },
    DAEMON_PERIOD_MIN * 60 * 1000,
  );
}
