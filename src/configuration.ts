import {createRestAPIClient, mastodon} from 'masto';
import {createRequire} from 'module';
import {createCacheFile, getCache} from './helpers/cache/index.js';
import Gauge from '@pm2/io/build/main/utils/metrics/gauge.js';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import {MASTODON_ACCESS_TOKEN, MASTODON_INSTANCE, TWITTER_USERNAME} from './constants.js';
import {TouitomamoutError} from './helpers/error.js';
import {Scraper} from '@the-convocation/twitter-scraper';

export const configuration = async (): Promise<{
    synchronizedPostsCountAllTime: Gauge.default;
    synchronizedPostsCountThisRun: Counter.default;
    mastodonClient: mastodon.rest.Client | void
    twitterClient: Scraper
}> => {
    // Error handling
    [
        {
            name: 'TWITTER_USERNAME',
            value: TWITTER_USERNAME,
            message: 'Twitter username is missing.',
            details: []
        },
        {
            name: 'MASTODON_INSTANCE',
            value: MASTODON_INSTANCE,
            message: 'Mastodon instance is missing.',
            details: []
        },
        {
            name: 'MASTODON_ACCESS_TOKEN',
            value: MASTODON_ACCESS_TOKEN,
            message: 'Mastodon access token is missing.',
            details: [`Please go to https://${MASTODON_INSTANCE}/settings/applications/new to generate one.`]
        },
    ].forEach(({name, value, message, details}) => {
        if(!value || value === '') {
            throw new  Error(TouitomamoutError(message, [...details, `Please check '${name}' in your .env settings.`]));
        }
    });

    // Init configuration
    const require = createRequire(import.meta.url);
    const pm2 = require('@pm2/io');

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
    synchronizedHandle.set(`@${TWITTER_USERNAME}`);

    const mastodonClient = createRestAPIClient({
        url: `https://${MASTODON_INSTANCE}`,
        accessToken: MASTODON_ACCESS_TOKEN,
    });

    const twitterClient = new Scraper({
        transform: {
            request(input: RequestInfo | URL, init?: RequestInit) {
                // The arguments here are the same as the parameters to fetch(), and
                // are kept as-is for flexibility of both the library and applications.
                if (input instanceof URL) {
                    const proxy =
                        'https://corsproxy.io/?' +
                        encodeURIComponent(input.toString());
                    return [proxy, init];
                } else if (typeof input === 'string') {
                    const proxy =
                        'https://corsproxy.io/?' + encodeURIComponent(input);
                    return [proxy, init];
                } else {
                    // Omitting handling for example
                    throw new Error('Unexpected request input type');
                }
            },
        },
    });

    return {
        mastodonClient,
        twitterClient,
        synchronizedPostsCountAllTime,
        synchronizedPostsCountThisRun
    };
};
