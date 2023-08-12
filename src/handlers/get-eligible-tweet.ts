import { Tweet} from '@the-convocation/twitter-scraper';
import {Cache} from '../types/index.js';
import {keepRecentTweets, isTweetCached, keepSelfQuotes, keepSelfReplies} from '../helpers/tweet/index.js';
import {getPostExcerpt} from '../helpers/post/get-post-excerpt.js';
import {DEBUG} from '../constants.js';

export const getEligibleTweet = async (tweet: Tweet, cache: Cache): Promise<Tweet | undefined> => {
    const notCached = !isTweetCached(tweet, cache);
    const notRetweet = !tweet.isRetweet;

    const isSelfReply = await keepSelfReplies(tweet);
    const isSelfQuote = await keepSelfQuotes(tweet);

    const isRecentTweet = keepRecentTweets(tweet);

    const keep = notCached && notRetweet && isSelfReply && isSelfQuote && isRecentTweet;

    // Remove quote & reply tweets data if not self-made
    const eligibleTweet = {
        ...tweet,
        inReplyToStatus: isSelfReply ? tweet.inReplyToStatus : undefined,
        inReplyToStatusId: isSelfReply ? tweet.inReplyToStatusId : undefined,
        quotedStatus: isSelfQuote ? tweet.quotedStatus : undefined,
        quotedStatusId: isSelfQuote ? tweet.quotedStatusId : undefined
    };

    if (DEBUG && keep) {
        console.log(`✅ : ${tweet.id}: from:@${tweet.username}: ${getPostExcerpt(tweet.text || '')}`);
    }

    return keep ? eligibleTweet : undefined;
};
