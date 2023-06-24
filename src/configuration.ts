import {login, mastodon} from 'masto';
import {createRequire} from 'module';
import {createCacheFile, getCache} from './helpers/cache/index.js';
import Gauge from '@pm2/io/build/main/utils/metrics/gauge.js';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import {MASTODON_ACCESS_TOKEN, MASTODON_INSTANCE, TWITTER_USERNAME} from './constants.js';

export const configuration = async (): Promise<{
    synchronizedPostsCountAllTime: Gauge.default;
    synchronizedPostsCountThisRun: Counter.default;
    mastodonClient: mastodon.Client | void
}> => {
    await createCacheFile();

    const require = createRequire(import.meta.url);
    const pm2 = require('@pm2/io');

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

    const mastodonClient = await login({
        url: `https://${MASTODON_INSTANCE}`,
        accessToken: MASTODON_ACCESS_TOKEN,
    }).catch(err => console.error(`Failed while connecting to Mastodon instance [${MASTODON_INSTANCE}]\n${err}`));

    return {
        mastodonClient,
        synchronizedPostsCountAllTime,
        synchronizedPostsCountThisRun
    };
};
