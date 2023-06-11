import {TweetMetadata} from '../../types/index.js';
import {TWITTER_USERNAME} from '../../constants.js';

export const isTweetReplying = (tweet: TweetMetadata): boolean => {
    const link = tweet?._extra?.links.find(link => link.type === 'reply');
    if (!link) {
        return false;
    }
    return link.url.match(/(\w+)\/status\/\d+/)?.[1] === TWITTER_USERNAME;
};
