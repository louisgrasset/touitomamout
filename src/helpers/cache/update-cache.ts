import fs from "fs";

import { CACHE_PATH } from "../../constants.js";
import { PostsCache } from "../../types/index.js";
import { getCache } from "./get-cache.js";

export const updateCacheFile = async (data: PostsCache | null) => {
  const d = {
    ...(await getCache()),
    posts: data ?? {},
  };
  try {
    await fs.promises.writeFile(CACHE_PATH, JSON.stringify(d));
  } catch (err) {
    console.error("Error updating cache file:", err);
  }
};
