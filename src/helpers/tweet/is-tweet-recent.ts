import {TweetMetadata} from '../../types/index.js';

/**
 * Because RSSHub can sometimes provide very old tweets without any reason,
 * we set a threshold so filter these one
 */
const RECENT_THRESHOLD_HOURS = 6;

export const isTweetRecent = (tweet: TweetMetadata) => {
    const publicationUTCDate = new Date(tweet.date_published);
    const currentUTCDate = new Date(); // UTC with process.env
    const threshold = RECENT_THRESHOLD_HOURS * 60 * 60 * 1000;

    return (currentUTCDate.getTime() - publicationUTCDate.getTime()) < threshold;
};
