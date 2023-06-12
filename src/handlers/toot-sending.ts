import {mastodon} from 'masto';
import {Ora} from 'ora';
import {Tweet} from '../types/index.js';
import {getCache, updateCacheFile} from '../helpers/cache/index.js';
import {getTweetIdFromPermalink} from '../helpers/tweet/index.js';
import {MASTODON_INSTANCE} from '../constants.js';
import {getTootExcerpt} from '../helpers/toot/get-toot-excerpt.js';

export const tootSendingHandler = async (mastodonClient: mastodon.Client, tweet: Tweet, mediaAttachments: mastodon.v1.MediaAttachment[], log: Ora) => {
    log.color= 'magenta';
    log.text=`toot: → sending ${getTootExcerpt(tweet.content)}`;

    const cache = await getCache();

    // Define toot
    const username = await mastodonClient.v1.accounts.verifyCredentials().then(account => account.username);
    const visibility = 'public';
    const status = tweet.quoteId ? `${tweet.content}\n\nhttps://${MASTODON_INSTANCE}/@${username}/${cache[tweet.quoteId]}` : tweet.content;
    const mediaIds = mediaAttachments.map(m => m?.id);
    const inReplyToId = tweet.replyId ? cache[tweet.replyId] : undefined;

    // Send toot
    await mastodonClient.v1.statuses.create({status, visibility, mediaIds, inReplyToId})
        .then(async (toot) => {
            log.succeed(`🦣 | toot sent: ${getTootExcerpt(tweet.content)}`);

            await updateCacheFile({
                ...cache, [getTweetIdFromPermalink(tweet.id)]: toot.id
            });
        });
};
