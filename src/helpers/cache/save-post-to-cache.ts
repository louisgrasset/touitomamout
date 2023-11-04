import {
  BlueskyCache,
  MastodonCache,
  Platform,
  PostsCache,
} from "../../types/index.js";
import { updateCacheFile } from "./update-cache.js";

interface PostToCache {
  cache: PostsCache;
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
