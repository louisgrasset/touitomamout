import { BlueskyCache, Cache, MastodonCache,Platform } from '../../types/index.js';
import { updateCacheFile } from './update-cache.js';

export const savePostToCache = async (cache:Cache,tweetId: string = '', data: MastodonCache | BlueskyCache, platform: Platform) => {
    const alreadyExistingCachedPostData = cache[tweetId] || {};
    await updateCacheFile({
        ...cache,
        [tweetId]: {
            ...alreadyExistingCachedPostData,
            [platform]: data
        }
    });
};
