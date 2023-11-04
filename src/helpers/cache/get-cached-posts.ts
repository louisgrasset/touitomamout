import { Cache } from "../../types/index.js";
import { getCache } from "./get-cache.js";

/**
 * A method to get the cached posts.
 */
export const getCachedPosts = async (): Promise<Cache["posts"]> => {
  const { posts } = await getCache();
  return posts;
};
