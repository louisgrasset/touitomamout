import {APIResponse, Metrics, SynchronizerResponse} from '../types/index.js';
import ora from 'ora';
import {contentMapper} from '../mappers/content-mapper.js';
import {mediaAttachmentsHandler, tootSendingHandler} from '../handlers/index.js';
import {getCache} from '../helpers/cache/index.js';
import {mastodon} from 'masto';
import {oraPrefixer} from '../helpers/ora-prefixer.js';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';

export const contentSync = async (feed: APIResponse, mastodonClient: mastodon.Client, synchronizedPostsCountThisRun: Counter.default): Promise<SynchronizerResponse & {metrics: Metrics}> => {
    const tweets = await contentMapper(feed);

    try {
        for (const tweet of tweets) {
            const log = ora({color: 'cyan', prefixText: oraPrefixer('content-sync')}).start();
            log.text = 'filtering';

            const mediaAttachments = await mediaAttachmentsHandler(tweet.medias, mastodonClient, log);
            await tootSendingHandler(mastodonClient, tweet, mediaAttachments, log).then(() => synchronizedPostsCountThisRun.inc());
        }

        return {
            feed,
            mastodonClient,
            metrics: {
                totalSynced: Object.keys(await getCache()).length,
                justSynced: tweets.length
            }
        };
    } catch (err) {
        console.error(err);

        return {
            feed,
            mastodonClient,
            metrics: {
                totalSynced: Object.keys(await getCache()).length,
                justSynced: 0
            }
        };
    }
};

