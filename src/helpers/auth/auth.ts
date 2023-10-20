import { Scraper } from '@the-convocation/twitter-scraper';

import { TWITTER_PASSWORD, TWITTER_USERNAME } from '../../constants.js';
import { getCookies } from '../cookies/get-cookies.js';
import { saveCookies } from '../cookies/save-cookies.js';
import { TouitomamoutError } from '../error.js';

const restorePreviousSession = async (client: Scraper): Promise<void> => {
    try {
        const cookies = await getCookies();
        if (cookies) {
            await client.setCookies(cookies);
        } else {
            throw new Error('Unable to restore cookies');
        }
    } catch (err) {
        console.log(TouitomamoutError(err as string, ['Logging in with credentials instead.']));
    }
};

export const handleTwitterAuth = async (client: Scraper) => {
    if (!TWITTER_USERNAME || !TWITTER_PASSWORD) {
        console.log('🦤 client: ✔ connected as guest | replies will not be synced');
        return;
    }

    // Try to restore the previous session
    await restorePreviousSession(client);

    if (await client.isLoggedIn()) {
        console.log('🦤 client: ✔ connected (session restored)');
    } else {
        // Handle restoration failure
        await client.login(TWITTER_USERNAME, TWITTER_PASSWORD);
        console.log('🦤 client: ✔ connected (using credentials)');
    }

    // Save session
    if (await client.isLoggedIn()) {
        await client.getCookies()
            .then(cookies => {
                saveCookies(cookies);
            });
    }
};
