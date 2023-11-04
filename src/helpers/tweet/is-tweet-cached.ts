import { Tweet } from "@the-convocation/twitter-scraper";

import { PostsCache } from "../../types/postsCache.js";

export const isTweetCached = (tweet: Tweet, cache: PostsCache) =>
  !!cache[tweet.id ?? 0];
