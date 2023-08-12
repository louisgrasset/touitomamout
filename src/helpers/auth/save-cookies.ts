import fs from 'fs';
import {COOKIES_PATH} from '../../constants.js';
import {Cookie} from 'tough-cookie';

export const saveCookies = async (cookies: Cookie[]): Promise<void> => {
    try {
        await fs.promises.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    } catch (err) {
        console.error('Error updating cookies file:', err);
    }
};

