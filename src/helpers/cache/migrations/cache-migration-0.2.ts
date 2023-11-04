import { preventMigrationOnWrongVersion } from "./helpers/prevent-migration-on-wrong-version.js";

export const migration = async (outdatedCache: {
  [key: string]:
    | string
    | {
        [key: string]: {
          mastodon: string[];
          bluesky: {
            cid: string;
            rkey: string;
          }[];
        };
      };
}) => {
  if (preventMigrationOnWrongVersion(outdatedCache, "0.1")) {
    return outdatedCache;
  }

  const instanceKey = Object.keys(outdatedCache).find(
    (key) => key !== "version",
  );

  return {
    version: "0.2",
    instance: { id: instanceKey },
    profile: {
      avatar: "",
      banner: "",
    },
    posts: outdatedCache[instanceKey!],
  };
};
