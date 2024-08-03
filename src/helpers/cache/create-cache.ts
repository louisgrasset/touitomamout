import { access, constants } from "node:fs/promises";

import { CACHE_PATH, INSTANCE_ID } from "../../constants";
import { writeToCacheFile } from "./write-to-cache-file";

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
