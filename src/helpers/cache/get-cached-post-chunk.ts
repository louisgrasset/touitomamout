import {
  BlueskyCacheChunk,
  MastodonCacheChunk,
  Platform,
} from "../../types/index.js";
import { getCachedPosts } from "./get-cached-posts.js";

export const getCachedPostChunk = async <
  T extends BlueskyCacheChunk | MastodonCacheChunk,
>(
  platform: Platform,
  position: "first" | "last",
  tweetId: string = "0",
): Promise<T | undefined> => {
  const cachedPosts = await getCachedPosts();
  const chunksFromCache = cachedPosts[tweetId]?.[platform];
  if (!chunksFromCache) {
    return undefined;
  }
  const chunkPosition = position === "first" ? 0 : chunksFromCache.length - 1;
  return chunksFromCache[chunkPosition] as T;
};
