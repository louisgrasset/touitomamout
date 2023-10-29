import { configuration } from "./configuration/configuration.js";
import {
  DAEMON,
  SYNC_BLUESKY,
  SYNC_FREQUENCY_MIN,
  SYNC_MASTODON,
  TOUITOMAMOUT_VERSION,
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
  console.log(`Touitomamout sync | v${TOUITOMAMOUT_VERSION}`);
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
  console.log(`Run daemon every ${SYNC_FREQUENCY_MIN}min`);
  setInterval(
    async () => {
      await touitomamout();
    },
    SYNC_FREQUENCY_MIN * 60 * 1000,
  );
}
