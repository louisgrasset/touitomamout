import {mastodon} from 'masto';
import {Ora} from 'ora';
import {getCache, updateCacheFile} from '../helpers/cache/index.js';
import {getTweetIdFromPermalink} from '../helpers/tweet/index.js';
import {MASTODON_INSTANCE} from '../constants.js';
import {getTootExcerpt} from '../helpers/toot/get-toot-excerpt.js';
import {Tweet} from '@the-convocation/twitter-scraper';
import {parseTweetText} from '../helpers/tweet/parse-tweet-text.js';

const VOID = '∅';
export const tootSendingHandler = async (mastodonClient: mastodon.rest.Client, tweet: Tweet, mediaAttachments: mastodon.v1.MediaAttachment[], log: Ora) => {
    log.color = 'magenta';
    log.text = `toot: → sending ${getTootExcerpt(tweet.text ?? VOID)}`;

    const cache = await getCache();

    // Define toot
    const username = await mastodonClient.v1.accounts.verifyCredentials().then(account => account.username);
    const visibility = 'public';

    const text = parseTweetText(tweet.text || '');
    const status = tweet.quotedStatusId ? `${text}\n\nhttps://${MASTODON_INSTANCE}/@${username}/${cache[tweet.quotedStatusId]}` : text;
    const mediaIds = mediaAttachments.map(m => m?.id);
    const inReplyToId = (tweet.isSelfThread && tweet.inReplyToStatusId) ? cache[tweet.inReplyToStatusId] : undefined;

    // Send toot
    await mastodonClient.v1.statuses.create({status, visibility, mediaIds, inReplyToId})
        .then(async (toot) => {
            log.succeed(`🦣 | toot sent: ${getTootExcerpt(tweet.text ?? VOID)}`);

            await updateCacheFile({
                ...cache, [getTweetIdFromPermalink(tweet.id ?? '')]: toot.id
            });
        });
};
