import {Metrics, SynchronizerResponse} from '../types/index.js';
import ora from 'ora';
import {contentGetter} from '../handlers/content-getter.js';
import {mediaAttachmentsHandler, tootSendingHandler} from '../handlers/index.js';
import {getCache} from '../helpers/cache/index.js';
import {mastodon} from 'masto';
import {oraPrefixer} from '../utils/ora-prefixer.js';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import {Scraper} from '@the-convocation/twitter-scraper';

export const contentSync = async (twitterClient: Scraper, mastodonClient: mastodon.rest.Client, synchronizedPostsCountThisRun: Counter.default): Promise<SynchronizerResponse & {metrics: Metrics}> => {
    const tweets = await contentGetter(twitterClient);

    try {
        for (const tweet of tweets) {
            const log = ora({color: 'cyan', prefixText: oraPrefixer('content-sync')}).start();
            log.text = 'filtering';

            const mediaAttachments = await mediaAttachmentsHandler(tweet.photos, tweet.videos, mastodonClient, log);
            await tootSendingHandler(mastodonClient, tweet, mediaAttachments, log);
            synchronizedPostsCountThisRun.inc();
        }

        return {
            twitterClient,
            mastodonClient,
            metrics: {
                totalSynced: Object.keys(await getCache()).length,
                justSynced: tweets.length
            }
        };
    } catch (err) {
        console.error(err);

        return {
            twitterClient,
            mastodonClient,
            metrics: {
                totalSynced: Object.keys(await getCache()).length,
                justSynced: 0
            }
        };
    }
};

