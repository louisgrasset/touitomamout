import {
  BlueskyCache,
  Cache,
  MastodonCache,
  Platform,
} from "../../types/index.js";
import { updateCacheFile } from "./update-cache.js";

interface PostToCache {
  cache: Cache;
  data: MastodonCache | BlueskyCache;
  tweetId?: string;
  platform: Platform;
}

export const savePostToCache = async ({
  cache,
  tweetId = "",
  data,
  platform,
}: PostToCache) => {
  const alreadyExistingCachedPostData = cache[tweetId] || {};
  await updateCacheFile({
    ...cache,
    [tweetId]: {
      ...alreadyExistingCachedPostData,
      [platform]: data,
    },
  });
};
