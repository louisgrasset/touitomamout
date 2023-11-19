import { Tweet } from "@the-convocation/twitter-scraper";

import { TWITTER_HANDLE } from "../../constants.js";

export const keepSelfQuotes = async (tweet: Tweet) => {
  if (tweet.isQuoted) {
    return tweet.quotedStatus
      ? tweet.quotedStatus.username === TWITTER_HANDLE // If the quoted tweet is from the same user, keep it.
      : false; // If the quoted tweet is not available, skip the tweet.
  }

  // True by default so chained conditions works
  return true;
};
