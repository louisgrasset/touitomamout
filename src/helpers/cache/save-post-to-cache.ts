import {updateCacheFile} from './update-cache.js';
import {BlueskyCache, Cache, MastodonCache} from '../../types/index.js';
import {Platform} from '../../types/index.js';

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
