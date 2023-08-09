import {TWITTER_USERNAME} from '../../constants.js';
import {Tweet} from '@the-convocation/twitter-scraper';

export const isTweetQuotingAnotherUser = (tweet: Tweet) => {
    if (!tweet.quotedStatus) {
        return false;
    }
    return tweet?.quotedStatus?.username !== TWITTER_USERNAME;
};
