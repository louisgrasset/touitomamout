import fs from "fs";

import { CACHE_PATH, INSTANCE_ID } from "../../constants.js";
import { Cache } from "../../types/index.js";
import { getCompleteCache } from "./get-cache.js";

export const updateCacheFile = async (data: Cache | null) => {
  const d = {
    ...(await getCompleteCache()),
    [INSTANCE_ID]: data ?? {},
  };
  try {
    await fs.promises.writeFile(CACHE_PATH, JSON.stringify(d));
  } catch (err) {
    console.error("Error updating cache file:", err);
  }
};
