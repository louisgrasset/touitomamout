import { access, constants } from "fs/promises";

import { CACHE_PATH, INSTANCE_ID } from "../../constants.js";
import { writeToCacheFile } from "./write-to-cache-file.js";

export const createCacheFile = async () => {
  try {
    // Check if the file exists
    await access(CACHE_PATH, constants.F_OK);
  } catch {
    writeToCacheFile({
      version: "0.2",
      instance: { id: INSTANCE_ID },
      profile: { avatar: "", banner: "" },
      posts: {},
    });
  }
};
