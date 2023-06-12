export const CACHE_PATH = './cache.json';
export const TWITTER_USERNAME = process.env.TWITTER_USERNAME || '';
export const RSSHUB_INSTANCE = process.env.RSSHUB_INSTANCE || '';
export const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE || '';
export const MASTODON_ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN || '';
export const SYNC_PROFILE_DESCRIPTION = (process.env.SYNC_PROFILE_DESCRIPTION || 'false') === 'true';
export const SYNC_PROFILE_PICTURE = (process.env.SYNC_PROFILE_PICTURE || 'false') === 'true';
export const SYNC_PROFILE_NAME = (process.env.SYNC_PROFILE_NAME || 'false') === 'true';
export const SYNC_PROFILE_HEADER = (process.env.SYNC_PROFILE_HEADER  || 'false') === 'true';
