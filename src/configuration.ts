import {createRestAPIClient, mastodon} from 'masto';
import {createRequire} from 'module';
import {createCacheFile, getCache} from './helpers/cache/index.js';
import Gauge from '@pm2/io/build/main/utils/metrics/gauge.js';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import {
    MASTODON_ACCESS_TOKEN,
    MASTODON_INSTANCE,
    TWITTER_HANDLE,
    BLUESKY_INSTANCE,
    BLUESKY_IDENTIFIER,
    BLUESKY_PASSWORD,
    SYNC_MASTODON, SYNC_BLUESKY, TWITTER_PASSWORD, TWITTER_USERNAME
} from './constants.js';
import {TouitomamoutError} from './helpers/error.js';
import {Scraper} from '@the-convocation/twitter-scraper';
import {BskyAgent} from '@atproto/api';

export const configuration = async (): Promise<{
    synchronizedPostsCountAllTime: Gauge.default;
    synchronizedPostsCountThisRun: Counter.default;
    twitterClient: Scraper
    mastodonClient: null | mastodon.rest.Client
    blueskyClient: null | BskyAgent
}> => {
    // Error handling
    [
        {
            name: 'TWITTER_HANDLE',
            value: TWITTER_HANDLE,
            platformEnabled: true,
            message: 'Twitter username is missing.',
            details: []
        },
        {
            name: 'MASTODON_INSTANCE',
            platformEnabled: SYNC_MASTODON,
            value: MASTODON_INSTANCE,
            message: 'Mastodon instance is missing.',
            details: []
        },
        {
            name: 'MASTODON_ACCESS_TOKEN',
            platformEnabled: SYNC_MASTODON,
            value: MASTODON_ACCESS_TOKEN,
            message: 'Mastodon access token is missing.',
            details: [`Please go to https://${MASTODON_INSTANCE}/settings/applications/new to generate one.`]
        },
        {
            name: 'BLUESKY_INSTANCE',
            platformEnabled: SYNC_BLUESKY,
            value: BLUESKY_INSTANCE,
            message: 'Bluesky Protocol instance is missing.',
            details: []
        },
        {
            name: 'BLUESKY_IDENTIFIER',
            platformEnabled: SYNC_BLUESKY,
            value: BLUESKY_IDENTIFIER,
            message: 'Bluesky Protocol identifier is missing.',
            details: []
        },
        {
            name: 'BLUESKY_PASSWORD',
            platformEnabled: SYNC_BLUESKY,
            value: BLUESKY_PASSWORD,
            message: 'Bluesky Protocol password is missing.',
            details: []
        }
    ].forEach(({name, value, message, details, platformEnabled}) => {
        if(platformEnabled) {
            if(!value || value === '') {
                throw new  Error(TouitomamoutError(message, [...details, `Please check '${name}' in your .env settings.`]));
            }
        }
    });

    // Init configuration
    const require = createRequire(import.meta.url);
    const pm2 = require('@pm2/io');
    const bsky = require('@atproto/api');

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

    if(TWITTER_USERNAME && TWITTER_PASSWORD) {
        await twitterClient.login(TWITTER_USERNAME, TWITTER_PASSWORD);
        console.log('🦤 client: ✔ connected');
    } else {
        console.log('🦤 client: ✔ connected as guest | replies will not be synced');
    }

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
        await blueskyClient.login({identifier: BLUESKY_IDENTIFIER, password: BLUESKY_PASSWORD});
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
