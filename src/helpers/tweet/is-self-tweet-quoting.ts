import {TweetMetadata} from '../../types/index.js';
import {TWITTER_USERNAME} from '../../constants.js';

/**
 * A utility method to know if the given tweet is
 * quoting the synchronized user
 * @param tweet
 */
export const isTweetSelfQuoting = (tweet: TweetMetadata) => {
    const link = tweet?._extra?.links.find(link => link.type === 'quote');
    if (!link) {
        return false;
    }
    return link.url.match(/(\w+)\/status\/\d+/)?.[1] === TWITTER_USERNAME;
};
