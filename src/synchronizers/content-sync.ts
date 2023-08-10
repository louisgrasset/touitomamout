import {Media, Metrics, SynchronizerResponse} from '../types/index.js';
import ora from 'ora';
import {contentGetter} from '../handlers/content-getter.js';
import {getCache} from '../helpers/cache/index.js';
import {mastodon} from 'masto';
import {oraPrefixer} from '../utils/ora-prefixer.js';
import Counter from '@pm2/io/build/main/utils/metrics/counter.js';
import {Scraper} from '@the-convocation/twitter-scraper';
import {BskyAgent} from '@atproto/api';
import {mastodonSender} from './senders/mastodon.sender.js';
import {blueskySender} from './senders/bluesky.sender.js';
import {makePost} from '../helpers/post/make-post.js';

export const contentSync = async (twitterClient: Scraper, mastodonClient: mastodon.rest.Client, blueskyClient: BskyAgent, synchronizedPostsCountThisRun: Counter.default): Promise<SynchronizerResponse & {metrics: Metrics}> => {
    const tweets = await contentGetter(twitterClient);

    try {
        for (const tweet of tweets) {
            const log = ora({color: 'cyan', prefixText: oraPrefixer('content-sync')}).start();
            log.text = 'filtering';

            const medias = [
                ...tweet.photos.map(i => ({...i, type: 'image'})),
                ...tweet.videos.map(i => ({...i, type: 'video'}))
            ] as Media[];

            const {
                mastodon: mastodonPost,
                bluesky: blueskyPost
            }= await makePost(tweet, mastodonClient, blueskyClient, log);

            await mastodonSender(mastodonClient, mastodonPost, medias, log);
            await blueskySender(blueskyClient, blueskyPost, medias, log);

            synchronizedPostsCountThisRun.inc();
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

