import dotenv from "dotenv";
import fs from "fs";
import { join } from "path";

const envPath = process.argv[2] ?? join(process.cwd(), ".env");
const envAvailable = await fs.promises
  .access(envPath, fs.constants.F_OK)
  .then(() => true)
  .catch(() => false);

if (envPath.endsWith("example")) {
  throw new Error("You should not use the example configuration file.");
}

if (!envAvailable) {
  throw new Error("No suitable .env file found.");
}

dotenv.config({ path: envPath });

export const TWITTER_HANDLE = process.env.TWITTER_HANDLE || "";
export const TWITTER_USERNAME = process.env.TWITTER_USERNAME || "";
export const TWITTER_PASSWORD = process.env.TWITTER_PASSWORD || "";
export const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE || "";
export const MASTODON_ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN || "";
export const BLUESKY_INSTANCE = process.env.BLUESKY_INSTANCE || "";
export const BLUESKY_IDENTIFIER = process.env.BLUESKY_IDENTIFIER || "";
export const BLUESKY_PASSWORD = process.env.BLUESKY_PASSWORD || "";
export const INSTANCE_ID = process.env.INSTANCE_ID ?? "instance";
export const STORAGE_DIR = process.env.STORAGE_DIR ?? process.cwd();
export const CACHE_PATH = `${STORAGE_DIR}/cache.${INSTANCE_ID.toLowerCase()
  .trim()
  .replaceAll(" ", "_")}.json`;
export const COOKIES_PATH = `${STORAGE_DIR}/cookies.${INSTANCE_ID.toLowerCase()
  .trim()
  .replaceAll(" ", "_")}.json`;
export const SYNC_MASTODON = (process.env.SYNC_MASTODON || "false") === "true";
export const SYNC_BLUESKY = (process.env.SYNC_BLUESKY || "false") === "true";
export const SYNC_PROFILE_DESCRIPTION =
  (process.env.SYNC_PROFILE_DESCRIPTION || "false") === "true";
export const SYNC_PROFILE_PICTURE =
  (process.env.SYNC_PROFILE_PICTURE || "false") === "true";
export const SYNC_PROFILE_NAME =
  (process.env.SYNC_PROFILE_NAME || "false") === "true";
export const SYNC_PROFILE_HEADER =
  (process.env.SYNC_PROFILE_HEADER || "false") === "true";
export const DEBUG = (process.env.TOUITOMAMOUT_DEBUG || "false") === "true";
export const DAEMON = (process.env.DAEMON || "false") === "true";
export const DAEMON_PERIOD_MIN = parseInt(process.env.DAEMON_PERIOD_MIN ?? "7"); // Default 7 min
export const VOID = "∅";
export const API_RATE_LIMIT = parseInt(process.env.API_RATE_LIMIT ?? "60");
