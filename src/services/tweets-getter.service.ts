import { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import ora from "ora";

import { API_RATE_LIMIT, TWITTER_HANDLE } from "../constants";
import { getCachedPosts } from "../helpers/cache/get-cached-posts";
import { oraPrefixer, oraProgress } from "../helpers/logs";
import { isTweetCached, tweetFormatter } from "../helpers/tweet";
import { getEligibleTweet } from "../helpers/tweet/get-eligible-tweet";

const pullContentStats = (tweets: Tweet[], title: string) => {
  const stats = {
    total: tweets.length,
    retweets: tweets.filter((t) => t.isRetweet).length,
    replies: tweets.filter((t) => t.isReply).length,
    quotes: tweets.filter((t) => t.isQuoted).length,
  };

  return (
    `${title}:` +
    Object.entries(stats).reduce(
      (s, [name, value]) => `${s} ${name}: ${value}`,
      "",
    )
  );
};

export const tweetsGetterService = async (
  twitterClient: Scraper,
): Promise<Tweet[]> => {
  const cachedPosts = await getCachedPosts();
  const log = ora({
    color: "cyan",
    prefixText: oraPrefixer("content-mapper"),
  }).start();
  log.text = "filtering";

  let preventPostsSynchronization = true;
  const LATEST_TWEETS_COUNT = 5;

  /**
   * Synchronization optimization: prevent excessive API calls & potential rate-limiting
   *
   * Pull the ${LATEST_TWEETS_COUNT}, filter eligible ones.
   * This optimization prevents the post sync if all latest eligible tweets are cached.
   * The order in which the tweets are retrieved in unpredictable, we therefore cannot
   * check only the first one and assume it's also the latest one.
   */
  const latestTweets = twitterClient.getTweets(
    TWITTER_HANDLE,
    LATEST_TWEETS_COUNT,
  );

  for await (const latestTweet of latestTweets) {
    log.text = "post: → checking for synchronization needs";
    if (preventPostsSynchronization) {
      // Only consider eligible tweets.
      const tweet = await getEligibleTweet(tweetFormatter(latestTweet));

      if (tweet) {
        // If this tweet is not cached, mark sync as needed
        if (!isTweetCached(tweet, cachedPosts)) {
          preventPostsSynchronization = false;
          break;
        }
      }
    }
  }

  // Get tweets from API
  const tweets: Tweet[] = [];

  if (preventPostsSynchronization) {
    log.succeed("task finished (unneeded sync)");
  } else {
    const tweetsIds = twitterClient.getTweets(TWITTER_HANDLE, 200);

    let hasRateLimitReached = false;
    let tweetIndex = 0;
    for await (const tweet of tweetsIds) {
      tweetIndex++;
      oraProgress(log, { before: "post: → filtering" }, tweetIndex, 200);

      const rateLimitTimeout = setTimeout(
        () => (hasRateLimitReached = true),
        1000 * API_RATE_LIMIT,
      );

      if (hasRateLimitReached || isTweetCached(tweet, cachedPosts)) {
        continue;
      }

      const t: Tweet = tweetFormatter(tweet);

      const eligibleTweet = await getEligibleTweet(t);
      if (eligibleTweet) {
        tweets.unshift(eligibleTweet);
      }
      clearTimeout(rateLimitTimeout);
    }

    if (hasRateLimitReached) {
      log.warn(
        `rate limit reached, more than ${API_RATE_LIMIT}s to fetch a single tweet`,
      );
    }

    log.succeed(pullContentStats(tweets, "tweets"));
    log.succeed("task finished");
  }

  return tweets;
};
