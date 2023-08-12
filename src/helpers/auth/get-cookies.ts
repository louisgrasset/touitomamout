import fs from 'fs';
import {COOKIES_PATH} from '../../constants.js';
import {Cookie} from 'tough-cookie';

export const getCookies = async (): Promise<Cookie[] | null> => {
    try {
        const fileContent = await fs.promises.readFile(COOKIES_PATH, 'utf-8');

        return Object.values(JSON.parse(fileContent))
            .reduce((acc: Cookie[], c) => {
                const cookie = Cookie.fromJSON(JSON.stringify(c));
                return cookie ? [...acc, cookie] : acc;
            }, []);
    } catch {
        return null;
    }
};

