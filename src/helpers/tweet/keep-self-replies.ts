import {Tweet} from '@the-convocation/twitter-scraper';

import {TWITTER_HANDLE} from '../../constants.js';

export const keepSelfReplies = async (tweet: Tweet) => {
    if (tweet.inReplyToStatus) {
        return tweet.inReplyToStatus.username === TWITTER_HANDLE;
    }

    // True by default so chained conditions works
    return true;
};
