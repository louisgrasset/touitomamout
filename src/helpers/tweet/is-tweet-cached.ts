import { Tweet } from "@the-convocation/twitter-scraper";

import { PostsCache } from "../../types";

export const isTweetCached = (tweet: Tweet, cache: PostsCache) =>
  !!cache[tweet.id ?? 0];
