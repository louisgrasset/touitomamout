import { INSTANCE_ID } from "../../../constants.js";
import { Platform } from "../../../types/index.js";
import { preventMigrationOnWrongVersion } from "./helpers/prevent-migration-on-wrong-version.js";

export const migration = async (
  outdatedCache: NonNullable<{
    [key: string]:
      | string
      | {
          [key: string]: {
            mastodon: string;
            bluesky: {
              cid: string;
              rkey: string;
            };
          };
        };
  }>,
) => {
  if (preventMigrationOnWrongVersion(outdatedCache, "0.0")) {
    return outdatedCache;
  }

  // Convert old refs to arrays of refs, considering the old ref as both first and last chunk
  const updatedInstanceCache = Object.entries(
    outdatedCache[INSTANCE_ID],
  ).reduce((update, [tweetId, refs]) => {
    return {
      ...update,
      [tweetId]: {
        [Platform.MASTODON]: [refs[Platform.MASTODON]],
        [Platform.BLUESKY]: [refs[Platform.BLUESKY]],
      },
    };
  }, {});

  return {
    ...outdatedCache,
    [INSTANCE_ID]: updatedInstanceCache,
    version: "0.1",
  };
};
