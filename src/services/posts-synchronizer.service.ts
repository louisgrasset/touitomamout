import { BskyAgent } from '@atproto/api';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import { Scraper } from '@the-convocation/twitter-scraper';
import { mastodon } from 'masto';
import ora from 'ora';

import { getCache } from '../helpers/cache/index.js';
import { oraPrefixer } from '../helpers/logs/ora-prefixer.js';
import { makePost } from '../helpers/post/make-post.js';
import { Media, Metrics, SynchronizerResponse } from '../types/index.js';
import { blueskySenderService } from './bluesky-sender.service.js';
import { tweetsGetterService } from './index.js';
import { mastodonSenderService } from './mastodon-sender.service.js';

/**
 * An async method in charge of dispatching posts synchronization tasks for each received tweets
 */
export const postsSynchronizerService = async (twitterClient: Scraper, mastodonClient: mastodon.rest.Client | null, blueskyClient: BskyAgent | null, synchronizedPostsCountThisRun: Counter.default): Promise<SynchronizerResponse & { metrics: Metrics }> => {
    const tweets = await tweetsGetterService(twitterClient);

    try {
        for (const tweet of tweets) {
            const log = ora({ color: 'cyan', prefixText: oraPrefixer('content-sync') }).start();

            const medias = [
                ...tweet.photos.map(i => ({ ...i, type: 'image' })),
                ...tweet.videos.map(i => ({ ...i, type: 'video' }))
            ] as Media[];

            const {
                mastodon: mastodonPost,
                bluesky: blueskyPost
            } = await makePost(tweet, mastodonClient, blueskyClient, log);

            await mastodonSenderService(mastodonClient, mastodonPost, medias, log);
            await blueskySenderService(blueskyClient, blueskyPost, medias, log);

            if (mastodonClient || blueskyPost) {
                synchronizedPostsCountThisRun.inc();
            }

            log.stop();
        }

        return {
            twitterClient,
            mastodonClient,
            blueskyClient,
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
            blueskyClient,
            metrics: {
                totalSynced: Object.keys(await getCache()).length,
                justSynced: 0
            }
        };
    }
};

