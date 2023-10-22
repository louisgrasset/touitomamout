import { mastodon } from 'masto';
import { Ora } from 'ora';

import { VOID } from '../constants.js';
import { getCache } from '../helpers/cache/index.js';
import { savePostToCache } from '../helpers/cache/save-post-to-cache.js';
import { getPostExcerpt } from '../helpers/post/get-post-excerpt.js';
import { Media, Platform } from '../types/index.js';
import { MastodonPost } from '../types/post.js';
import { mediaDownloaderService } from './index.js';

const BLUESKY_MEDIA_IMAGES_MAX_COUNT = 4;

/**
 * An async method in charge of handling Mastodon posts computation & uploading
 */
export const mastodonSenderService = async (client: mastodon.rest.Client | null, post: MastodonPost | null, medias: Media[], log: Ora) => {
    if (!client || !post) {
        return;
    }

    // Medias
    const mediaAttachments: mastodon.v1.MediaAttachment[] = [];
    for (const media of medias) {
        if (!media.url) {
            continue;
        }
        if (
            (media.type === 'image' && mediaAttachments.length < BLUESKY_MEDIA_IMAGES_MAX_COUNT - 1) ||
            (media.type === 'video' && mediaAttachments.length === 0)
        ) {
            // Download
            log.text = `medias: ↓ (${mediaAttachments.length + 1}/${medias.length}) downloading`;
            const mediaBlob = await mediaDownloaderService(media.url);

            // Upload
            log.text = `medias: ↑ (${mediaAttachments.length + 1}/${medias.length}) uploading`;
            await client.v2.media.create({
                file: mediaBlob,
                description: media.type === 'image' && media.alt_text ? media.alt_text : null
            })
                .then(async mediaSent => {
                    mediaAttachments.push(mediaSent);
                })
                .catch(err => {
                    log.fail(err);
                    return null;
                });
        }
    }

    // When no compatible media has been found and no text is present, skip the post
    if (!mediaAttachments.length && !post.tweet.text) {
        log.warn(`🦣️ | post skipped: no compatible media nor text to post (tweet: ${post.tweet.id})`);
        return;
    }

    log.text = `🦣 | toot sending: ${getPostExcerpt(post.tweet.text ?? VOID)}`;

    // Post
    await client.v1.statuses.create({
        status: post.status,
        visibility: 'public',
        mediaIds: mediaAttachments.map(m => m.id),
        inReplyToId: post.inReplyToId
    })
        .then(async (toot) => {
            log.succeed(`🦣 | toot sent: ${getPostExcerpt(post.tweet.text ?? VOID)}`);
            const cache = await getCache();
            await savePostToCache({ cache, tweetId: post.tweet.id, data: toot.id, platform: Platform.MASTODON });
        });
};
