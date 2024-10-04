import { BlueskyCache, MastodonCache, Platform } from "../../types";
import { getCachedPosts } from "./get-cached-posts";
import { updateCacheEntry } from "./update-cache-entry";

interface PostToCache {
  data: MastodonCache | BlueskyCache;
  tweetId?: string;
  platform: Platform;
}

export const savePostToCache = async ({
  tweetId = "",
  data,
  platform,
}: PostToCache) => {
  const cachedPosts = await getCachedPosts();
  const currentPostData = cachedPosts[tweetId] || {};
  await updateCacheEntry("posts", {
    ...cachedPosts,
    [tweetId]: {
      ...currentPostData,
      [platform]: data,
    },
  });
};
