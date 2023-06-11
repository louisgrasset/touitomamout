import {TweetMetadata} from '../../types/index.js';
import {TWITTER_USERNAME} from '../../constants.js';

export const isTweetQuotingAnotherUser = (tweet: TweetMetadata) => {
    const link = tweet?._extra?.links.find(link => link.type === 'quote');
    if (!link) {
        return false;
    }
    return link.url.match(/(\w+)\/status\/\d+/)?.[1] !== TWITTER_USERNAME;
};
