import bsky, { BskyAgent } from '@atproto/api';
import pm2 from'@pm2/io';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import Gauge from '@pm2/io/build/main/utils/metrics/gauge.js';
import { Scraper } from '@the-convocation/twitter-scraper';
import { createRestAPIClient, mastodon } from 'masto';

import {
    BLUESKY_IDENTIFIER,
    BLUESKY_INSTANCE,
    BLUESKY_PASSWORD,
    MASTODON_ACCESS_TOKEN,
    MASTODON_INSTANCE,
    SYNC_BLUESKY,
    SYNC_MASTODON, TWITTER_HANDLE } from '../constants.js';
import { handleTwitterAuth } from '../helpers/auth/auth.js';
import { createCacheFile, getCache } from '../helpers/cache/index.js';
import { TouitomamoutError } from '../helpers/error.js';
import { buildConfigurationRules } from './build-configuration-rules.js';

export const configuration = async (): Promise<{
    synchronizedPostsCountAllTime: Gauge.default;
    synchronizedPostsCountThisRun: Counter.default;
    twitterClient: Scraper
    mastodonClient: null | mastodon.rest.Client
    blueskyClient: null | BskyAgent
}> => {
    // Error handling
    const rules = buildConfigurationRules();
    rules.forEach(({ name, value, message, details, platformEnabled }) => {
        if(platformEnabled) {
            if(!value || value === '') {
                throw new Error(TouitomamoutError(message, [...details, `Please check '${name}' in your .env settings.`]));
            }
        }
    });

    // Init configuration
    await createCacheFile();

    const synchronizedPostsCountThisRun = pm2.counter({
        name: 'Synced posts this run',
        id: 'app/historic/sync/run'
    });

    const synchronizedPostsCountAllTime = pm2.metric({
        name: 'Synced posts total',
        id: 'app/historic/sync/all_time'
    });
    synchronizedPostsCountAllTime.set(Object.keys(await getCache()).length);

    const synchronizedHandle = pm2.metric({
        name: 'User handle',
        id: 'app/schema/username'
    });
    synchronizedHandle.set(`@${TWITTER_HANDLE}`);

    const twitterClient = new Scraper({
        transform: {
            request(input: RequestInfo | URL, init?: RequestInit) {
                // The arguments here are the same as the parameters to fetch(), and
                // are kept as-is for flexibility of both the library and applications.
                if (input instanceof URL) {
                    const proxy =
                        'https://corsproxy.org/?' +
                        encodeURIComponent(input.toString());
                    return [proxy, init];
                } else if (typeof input === 'string') {
                    const proxy =
                        'https://corsproxy.org/?' + encodeURIComponent(input);
                    return [proxy, init];
                } else {
                    // Omitting handling for example
                    throw new Error('Unexpected request input type');
                }
            },
        },
    });

    await handleTwitterAuth(twitterClient);

    let mastodonClient = null;
    if(SYNC_MASTODON) {
        mastodonClient = createRestAPIClient({
            url: `https://${MASTODON_INSTANCE}`,
            accessToken: MASTODON_ACCESS_TOKEN,
        });
        console.log('🦣 client: ✔ connected');
    }

    let blueskyClient = null;
    if(SYNC_BLUESKY) {
        blueskyClient = new bsky.BskyAgent({ service: `https://${BLUESKY_INSTANCE}` });
        await blueskyClient.login({ identifier: BLUESKY_IDENTIFIER, password: BLUESKY_PASSWORD });
        console.log('☁️ client: ✔ connected');
    }

    return {
        mastodonClient,
        twitterClient,
        blueskyClient,
        synchronizedPostsCountAllTime,
        synchronizedPostsCountThisRun
    };
};
