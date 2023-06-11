import {Cache} from '../../types/index.js';
import {getCache} from './get-cache.js';
import {createCacheFile} from './create-cache.js';

/**
 * A method to get the cache.
 * The cache is created if it doesn't exist
 */
export const getOrCreateCache = async (): Promise<Cache> => {
    console.log('Cache initialization');
    await createCacheFile();
    return await getCache();
};
