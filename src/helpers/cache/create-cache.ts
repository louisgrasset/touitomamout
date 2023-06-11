import fs from 'fs';
import {CACHE_PATH} from '../../constants.js';
import {updateCacheFile} from './update-cache.js';

export const createCacheFile = async () => {
    try {
        // Check if the file exists
        await fs.promises.access(CACHE_PATH, fs.constants.F_OK);
    } catch (err) {
        // File doesn't exist, create a new one
        await updateCacheFile(null);
    }
};
