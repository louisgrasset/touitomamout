import { accessSync, constants } from "node:fs";
import { join } from "node:path";

import dotenv from "dotenv";

import buildInfo from "./buildInfo.json" assert { type: "json" };

if (process.env.NODE_ENV !== "test") {
  const envPath = process.argv[2] ?? join(process.cwd(), ".env");
  if (envPath.endsWith("example")) {
    throw new Error("You should not use the example configuration file.");
  }

  try {
    accessSync(envPath, constants.F_OK);
  } catch (err) {
    throw new Error("No suitable .env file found.");
  }
  dotenv.config({ path: envPath });
}

const trimTwitterHandle = (handle: string) => {
  return handle.toLowerCase().trim().replaceAll("@", "");
};

export const TWITTER_HANDLE = trimTwitterHandle(
  process.env.TWITTER_HANDLE ?? "",
);
export const TWITTER_USERNAME = trimTwitterHandle(
  process.env.TWITTER_USERNAME ?? "",
);
export const TWITTER_PASSWORD = (process.env.TWITTER_PASSWORD ?? "").trim();
export const MASTODON_INSTANCE = (process.env.MASTODON_INSTANCE ?? "").trim();
export const MASTODON_ACCESS_TOKEN = (
  process.env.MASTODON_ACCESS_TOKEN ?? ""
).trim();
export const BLUESKY_INSTANCE = (process.env.BLUESKY_INSTANCE ?? "").trim();
export const BLUESKY_IDENTIFIER = (process.env.BLUESKY_IDENTIFIER ?? "").trim();
export const BLUESKY_PASSWORD = (process.env.BLUESKY_PASSWORD ?? "").trim();
export const INSTANCE_ID = (TWITTER_HANDLE ?? "instance")
  .toLowerCase()
  .trim()
  .replaceAll(" ", "_");
export const STORAGE_DIR = process.env.STORAGE_DIR ?? process.cwd();
export const CACHE_PATH = `${STORAGE_DIR}/cache.${INSTANCE_ID}.json`;
export const COOKIES_PATH = `${STORAGE_DIR}/cookies.${INSTANCE_ID}.json`;
export const SYNC_MASTODON = (process.env.SYNC_MASTODON ?? "false") === "true";
export const SYNC_BLUESKY = (process.env.SYNC_BLUESKY ?? "false") === "true";
export const SYNC_FREQUENCY_MIN = parseInt(
  process.env.SYNC_FREQUENCY_MIN ?? "30",
);
export const SYNC_PROFILE_DESCRIPTION =
  (process.env.SYNC_PROFILE_DESCRIPTION ?? "false") === "true";
export const SYNC_PROFILE_PICTURE =
  (process.env.SYNC_PROFILE_PICTURE ?? "false") === "true";
export const SYNC_PROFILE_NAME =
  (process.env.SYNC_PROFILE_NAME ?? "false") === "true";
export const SYNC_PROFILE_HEADER =
  (process.env.SYNC_PROFILE_HEADER ?? "false") === "true";
export const SYNC_DRY_RUN = (process.env.SYNC_DRY_RUN ?? "false") === "true";
export const DEBUG = (process.env.TOUITOMAMOUT_DEBUG ?? "false") === "true";
export const DAEMON = (process.env.DAEMON ?? "false") === "true";
export const VOID = "∅";
export const API_RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT ?? "30");
export const TOUITOMAMOUT_VERSION = buildInfo.version ?? "0.0.0";
export const MASTODON_MAX_POST_LENGTH = 500;
export const BLUESKY_MAX_POST_LENGTH = 300;
export const BLUESKY_MEDIA_MAX_SIZE_BYTES = 976560;
