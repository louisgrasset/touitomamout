import { Tweet } from "@the-convocation/twitter-scraper";

import { TWITTER_HANDLE } from "../../constants.js";

export const keepSelfQuotes = async (tweet: Tweet) => {
  if (tweet.quotedStatus) {
    return tweet.quotedStatus.username === TWITTER_HANDLE;
  }

  // True by default so chained conditions works
  return true;
};
