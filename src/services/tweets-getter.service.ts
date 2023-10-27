import { Scraper, Tweet } from "@the-convocation/twitter-scraper";
import ora from "ora";

import { API_RATE_LIMIT, TWITTER_HANDLE } from "../constants.js";
import { getCache } from "../helpers/cache/index.js";
import { oraPrefixer } from "../helpers/logs/ora-prefixer.js";
import { getEligibleTweet } from "../helpers/tweet/get-eligible-tweet.js";
import { formatTweetText, isTweetCached } from "../helpers/tweet/index.js";

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
  const cache = await getCache();
  const log = ora({
    color: "cyan",
    prefixText: oraPrefixer("content-mapper"),
  }).start();
  log.text = "filtering";

  // Get tweets from API
  const tweets: Tweet[] = [];
  const tweetsIds = twitterClient.getTweets(TWITTER_HANDLE, 200);

  let hasRateLimitReached = false;
  let latestTweetAlreadySynced = false;
  let tweetsCount = 0;
  for await (const tweet of tweetsIds) {
    const rateLimitTimeout = setTimeout(
      () => (hasRateLimitReached = true),
      1000 * API_RATE_LIMIT,
    );

    if (
      latestTweetAlreadySynced ||
      hasRateLimitReached ||
      isTweetCached(tweet, cache)
    ) {
      continue;
    }

    // Skip posts sync if the latest one has already synced
    if (tweetsCount === 0 && isTweetCached(tweet, cache)) {
      latestTweetAlreadySynced = true;
    }

    const t: Tweet = {
      ...tweet,
      timestamp: (tweet.timestamp ?? 0) * 1000,
      text: formatTweetText(tweet),
    };

    const eligibleTweet = await getEligibleTweet(t);
    if (eligibleTweet) {
      tweets.unshift(eligibleTweet);
    }
    clearTimeout(rateLimitTimeout);
    tweetsCount++;
  }

  if (hasRateLimitReached) {
    log.warn(
      `rate limit reached, more than ${API_RATE_LIMIT}s to fetch a single tweet`,
    );
  }
  log.succeed(pullContentStats(tweets, "tweets"));
  log.succeed("task finished");

  return tweets;
};
