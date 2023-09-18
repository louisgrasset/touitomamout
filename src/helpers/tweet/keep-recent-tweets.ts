import { Tweet } from '@the-convocation/twitter-scraper';

/**
 * Filter results to only keep the most recent ones.
 * Helps when the API returns only the most popular tweets.
 */
const RECENT_THRESHOLD_HOURS = 24 * 7 * 3;

export const keepRecentTweets = (tweet: Tweet) => {
    const publicationUTCDate = new Date(tweet.timestamp ?? 0);
    const currentUTCDate = new Date(new Date().toUTCString());
    const threshold = RECENT_THRESHOLD_HOURS * 60 * 60 * 1000;

    return (currentUTCDate.getTime() - publicationUTCDate.getTime()) < threshold;
};
