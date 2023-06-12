import {login, mastodon} from 'masto';
import {createRequire} from 'module';
import {createCacheFile, getCache} from './helpers/cache/index.js';
import {MASTODON_ACCESS_TOKEN, MASTODON_INSTANCE} from './constants.js';
import Gauge from '@pm2/io/build/main/utils/metrics/gauge.js';

export const configuration = async (): Promise<{ metric: Gauge.default; mastodonClient: mastodon.Client | void }> => {
    await createCacheFile();

    const require = createRequire(import.meta.url);
    const metric = require('@pm2/io').metric({
        name: 'Synced tweets',
    });
    metric.set(Object.keys(await getCache()).length);

    const mastodonClient = await login({
        url: `https://${MASTODON_INSTANCE}`,
        accessToken: MASTODON_ACCESS_TOKEN,
    }).catch(err => console.error(`Failed while connecting to Mastodon instance [${MASTODON_INSTANCE}]\n${err}`));

    return {
        mastodonClient,
        metric
    };
};
