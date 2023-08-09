import ora from 'ora';
import {Scraper, Tweet} from '@the-convocation/twitter-scraper';
import {getCache} from '../helpers/cache/index.js';
import {isTweetQuotingAnotherUser, isTweetRecent} from '../helpers/tweet/index.js';
import {oraPrefixer} from '../utils/ora-prefixer.js';
import {TWITTER_USERNAME} from '../constants.js';
import {isTweetCached} from '../helpers/tweet/is-tweet-cached.js';

export const contentGetter = async (twitterClient: Scraper): Promise<Tweet[]> => {
    const cache = await getCache();
    const log = ora({color: 'cyan', prefixText: oraPrefixer('content-mapper')}).start();
    log.text = '...';

    // Get tweets from API
    const tweets: Tweet[] = [];
    const tweetsIds = twitterClient.getTweets(TWITTER_USERNAME, 3);

    for await(const tweet of tweetsIds) {
        if (tweet) {
            tweets.unshift({
                ...tweet,
                timestamp: (tweet.timestamp ?? 0) * 1000
            });
        }
    }

    /**
     * Filter tweets based on:
     * - not already synced
     * - not being a retweet
     * - not being a quote of a different user
     * - being recent
     */
    try {
        const content = tweets.filter(t =>
            !isTweetCached(t, cache) &&
            !t.isRetweet &&
            !isTweetQuotingAnotherUser(t) &&
            isTweetRecent(t)
        );
        log.succeed('task finished');

        return content;
    } catch (err) {
        log.fail(typeof err === 'string' ? err : undefined);
        console.error(`Unable to map content\n${err}`);

        return [];
    }
};
