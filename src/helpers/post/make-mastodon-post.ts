import {mastodon} from 'masto';
import {Tweet} from '@the-convocation/twitter-scraper';
import {Platform} from '../../types/index.js';
import {MastodonPost} from '../../types/post.js';
import {MASTODON_INSTANCE} from '../../constants.js';
import {getCache} from '../cache/index.js';

export const makeMastodonPost= async (client: mastodon.rest.Client, tweet: Tweet) : Promise<MastodonPost> => {
    const cache = await getCache();

    const username = await client.v1.accounts.verifyCredentials().then(account => account.username);

    // Get quoted post references
    let status = tweet.text!;
    if(tweet.quotedStatusId) {
        status = `${tweet.text}\n\nhttps://${MASTODON_INSTANCE}/@${username}/${cache[tweet.quotedStatusId]?.[Platform.MASTODON]}`;
    }

    // Get in reply post references
    let inReplyToId = undefined;
    if(tweet.inReplyToStatus) {
        inReplyToId =  cache[tweet.inReplyToStatus.id!]?.[Platform.MASTODON];
    }

    return {
        username,
        status,
        inReplyToId,
        tweet
    };
};
