import { readFile } from "node:fs/promises";

import { CACHE_PATH } from "../../constants.js";
import { Cache } from "../../types/index.js";

/**
 * A method to get the cache.
 */
export const getCache = async (): Promise<Cache> => {
  try {
    const fileContent = await readFile(CACHE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch {
    return {
      instance: { id: "" },
      posts: {},
      profile: { avatar: "", banner: "" },
      version: "",
    };
  }
};
