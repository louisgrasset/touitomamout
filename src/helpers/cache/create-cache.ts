import fs from 'fs';

import {CACHE_PATH, INSTANCE_ID} from '../../constants.js';
import {getCompleteCache} from './get-cache.js';
import {updateCacheFile} from './update-cache.js';

export const createCacheFile = async () => {
    try {
        // Check if the file exists
        await fs.promises.access(CACHE_PATH, fs.constants.F_OK);
        const completeCache = await getCompleteCache();
        if(!completeCache[INSTANCE_ID]) {
            throw new Error(`Cache for instance ${INSTANCE_ID} not found`);
        }
    } catch (err) {
        // File doesn't exist, create a new one
        await updateCacheFile(null);
    }
};
