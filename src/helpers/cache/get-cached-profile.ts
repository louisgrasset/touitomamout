import { Cache } from "../../types";
import { getCache } from "./get-cache";

/**
 * A method to get the cached profile.
 */
export const getCachedProfile = async (): Promise<Cache["profile"]> => {
  const { profile } = await getCache();
  return profile;
};
