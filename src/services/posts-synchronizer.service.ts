import { AtpAgent } from "@atproto/api";
import * as Counter from "@pm2/io/build/main/utils/metrics/counter";
import { Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";
import ora from "ora";

import { SYNC_DRY_RUN } from "../constants";
import { getCachedPosts } from "../helpers/cache/get-cached-posts";
import { oraPrefixer } from "../helpers/logs";
import { makePost } from "../helpers/post/make-post";
import { Media, Metrics, SynchronizerResponse } from "../types";
import { MentionMapping } from "../types/mentionMapping";
import { blueskySenderService } from "./bluesky-sender.service";
import { mastodonSenderService } from "./mastodon-sender.service";
import { tweetsGetterService } from "./tweets-getter.service";

/**
 * An async method in charge of dispatching posts synchronization tasks for each received tweets.
 */
export const postsSynchronizerService = async (
  twitterClient: Scraper,
  mastodonClient: mastodon.rest.Client | null,
  blueskyClient: AtpAgent | null,
  synchronizedPostsCountThisRun: Counter.default,
  mentionsMapping: MentionMapping[],
): Promise<SynchronizerResponse & { metrics: Metrics }> => {
  const tweets = await tweetsGetterService(twitterClient);

  try {
    let tweetIndex = 0;
    for (const tweet of tweets) {
      tweetIndex++;
      const log = ora({
        color: "cyan",
        prefixText: oraPrefixer("content-sync"),
      }).start();

      const medias = [
        ...tweet.photos.map((i) => ({ ...i, type: "image" })),
        ...tweet.videos.map((i) => ({ ...i, type: "video" })),
      ] as Media[];

      const { mastodon: mastodonPost, bluesky: blueskyPost } = await makePost(
        tweet,
        mastodonClient,
        blueskyClient,
        log,
        { current: tweetIndex, total: tweets.length },
        mentionsMapping,
      );

      if (!SYNC_DRY_RUN) {
        await mastodonSenderService(mastodonClient, mastodonPost, medias, log);
        await blueskySenderService(blueskyClient, blueskyPost, medias, log);
      }
      if (mastodonClient || blueskyPost) {
        synchronizedPostsCountThisRun.inc();
      }

      log.stop();
    }

    return {
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: Object.keys(await getCachedPosts()).length,
        justSynced: tweets.length,
      },
    };
  } catch (err) {
    console.error(err);

    return {
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: Object.keys(await getCachedPosts()).length,
        justSynced: 0,
      },
    };
  }
};
