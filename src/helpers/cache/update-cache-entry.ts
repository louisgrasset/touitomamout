import { Cache } from "../../types";
import { getCache } from "./get-cache";
import { writeToCacheFile } from "./write-to-cache-file";

export const updateCacheEntry = async <T extends keyof Cache>(
  key: T,
  update: Cache[T],
) => {
  try {
    // Get the current cache
    const cache = await getCache();

    // Update cache data
    const updatedCacheData = Object.entries(cache).reduce(
      (acc, [k, previousValue]) =>
        // Either keep previous value or inject the updated one
        k === key ? { ...acc, [k]: update } : { ...acc, [k]: previousValue },
      {},
    ) as Cache;

    // Update the cache file
    writeToCacheFile(updatedCacheData);
  } catch (err) {
    console.error("Error updating cache file:", err);
  }
};
