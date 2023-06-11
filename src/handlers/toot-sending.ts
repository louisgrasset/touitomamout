import {mastodon} from 'masto';
import ora from 'ora';
import {Tweet, Cache} from '../types/index.js';
import {updateCacheFile} from '../helpers/cache/index.js';
import {getTweetIdFromPermalink} from '../helpers/tweet/index.js';
import {MASTODON_DOMAIN, MASTODON_USERNAME} from '../constants.js';

export const tootSendingHandler = async (cache: Cache, mastodonClient: mastodon.Client, tweet: Tweet, mediaAttachments: mastodon.v1.MediaAttachment[]) => {
    const log = ora({color: 'magenta', prefixText: 'Toot'}).start();
    log.text = `Sending toot\n[${tweet.content}]`;

    // Define toot
    const visibility = 'public';
    const status = tweet.quoteId ? `${tweet.content}\n\n https://${MASTODON_DOMAIN}/@${MASTODON_USERNAME}/${cache[tweet.quoteId]}` : tweet.content;
    const mediaIds = mediaAttachments.map(m => m?.id);
    const inReplyToId = tweet.replyId ? cache[tweet.replyId] : undefined;

    // Send toot
    await mastodonClient.v1.statuses.create({status, visibility, mediaIds, inReplyToId})
        .then(async (toot) => {
            log.succeed(`Toot created!\n  | ${tweet.content}`);

            await updateCacheFile({
                ...cache, [getTweetIdFromPermalink(tweet.id)]: toot.id
            });
        });
};
