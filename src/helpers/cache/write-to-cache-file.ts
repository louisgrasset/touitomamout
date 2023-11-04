import { writeFileSync } from "node:fs";

import { CACHE_PATH } from "../../constants.js";
import { Cache } from "../../types/index.js";
import { TouitomamoutError } from "../error.js";

export const writeToCacheFile = (cache: Cache) => {
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache));
  } catch (err) {
    console.error(
      TouitomamoutError("Error while updating the cache file", []),
      err,
    );
  }
};
