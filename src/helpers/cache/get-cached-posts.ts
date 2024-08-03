import { Cache } from "../../types";
import { getCache } from "./get-cache";

/**
 * A method to get the cached posts.
 */
export const getCachedPosts = async (): Promise<Cache["posts"]> => {
  const { posts } = await getCache();
  return posts;
};
