import {Cache} from '../../types/index.js';
import fs from 'fs';
import {CACHE_PATH} from '../../constants.js';

export const updateCacheFile = async (data: Cache | null) => {
    const d = data ?? {};
    try {
        await fs.promises.writeFile(CACHE_PATH, JSON.stringify(d));
    } catch (err) {
        console.error('Error updating cache file:', err);
    }
};
