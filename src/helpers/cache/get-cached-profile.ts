import { Cache } from "../../types/index.js";
import { getCache } from "./get-cache.js";

/**
 * A method to get the cached profile.
 */
export const getCachedProfile = async (): Promise<Cache["profile"]> => {
  const { profile } = await getCache();
  return profile;
};
