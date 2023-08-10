import {Cache, CompleteCache} from '../../types/index.js';
import fs from 'fs';
import {CACHE_PATH, INSTANCE_ID} from '../../constants.js';

/**
 * A method to get the cache for the current instanceId.
 */
export const getCache = async (): Promise<Cache> => {
    try {
        const fileContent = await fs.promises.readFile(CACHE_PATH, 'utf-8');
        return JSON.parse(fileContent)[INSTANCE_ID];
    } catch (err) {
        console.error('Error reading cache.json file:', err);

        return {};
    }
};

/**
 * A method to get the cache.
 */
export const getCompleteCache = async (): Promise<  CompleteCache> => {
    try {
        const fileContent = await fs.promises.readFile(CACHE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch {
        return {};
    }
};
