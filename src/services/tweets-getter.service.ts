import { Scraper, SearchMode, Tweet } from '@the-convocation/twitter-scraper';
import ora from 'ora';

import { TWITTER_HANDLE } from '../constants.js';
import { getCache } from '../helpers/cache/index.js';
import { oraPrefixer } from '../helpers/logs/ora-prefixer.js';
import { getEligibleTweet } from '../helpers/tweet/get-eligible-tweet.js';
import { formatTweetText,getTweetIdFromPermalink } from '../helpers/tweet/index.js';

const pullContentStats = (tweets: Tweet[], title: string) => {
    const stats = {
        total: tweets.length,
        retweets: tweets.filter(t => t.isRetweet).length,
        replies: tweets.filter(t => t.isReply).length,
        quotes: tweets.filter(t => t.isQuoted).length,
    };

    return `${title}:` + Object.entries(stats).reduce((s, [name, value]) => `${s} ${name}: ${value}`, '');
};

export const tweetsGetterService = async (twitterClient: Scraper): Promise<Tweet[]> => {
    const cache = await getCache();
    const log = ora({ color: 'cyan', prefixText: oraPrefixer('content-mapper') }).start();
    log.text = '...';

    // Get tweets from API
    const tweets: Tweet[] = [];
    const tweetsIds = twitterClient.searchTweets(`from:@${TWITTER_HANDLE}`, 50, SearchMode.Latest);

    for await(const tweet of tweetsIds) {
        if (tweet) {
            const t: Tweet = {
                ...tweet,
                id: getTweetIdFromPermalink(tweet.id || ''),
                timestamp: (tweet.timestamp ?? 0) * 1000,
                text: formatTweetText(tweet)
            };

            // Inject quoted tweet
            if (tweet.quotedStatusId) {
                const quotedStatus = await twitterClient.getTweet(tweet.quotedStatusId);
                if (quotedStatus) {
                    t.quotedStatus = quotedStatus;
                }
            }

            // Inject in reply tweet
            if (tweet.inReplyToStatusId) {
                const inReplyStatus = await twitterClient.getTweet(tweet.inReplyToStatusId);
                if (inReplyStatus) {
                    t.inReplyToStatus = inReplyStatus;
                }
            }

            const eligibleTweet = await getEligibleTweet(t, cache);
            if (eligibleTweet) {
                tweets.unshift(eligibleTweet);
            }
        }
    }

    log.succeed(pullContentStats(tweets, 'tweets'));
    log.succeed('task finished');

    return tweets;
};
