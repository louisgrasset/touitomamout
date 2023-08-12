import {mastodon} from 'masto';
import {Ora} from 'ora';

import {VOID} from '../../constants.js';
import {downloadMedia} from '../../handlers/index.js';
import {getCache} from '../../helpers/cache/index.js';
import {savePostToCache} from '../../helpers/cache/save-post-to-cache.js';
import {getPostExcerpt} from '../../helpers/post/get-post-excerpt.js';
import {Media, Platform} from '../../types/index.js';
import {MastodonPost} from '../../types/post.js';

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

export const mastodonSender = async (client: mastodon.rest.Client | null, post: MastodonPost | null, medias: Media[], log: Ora) => {
    if(!client || !post) {
        return;
    }

    // Medias
    const mediaAttachments: mastodon.v1.MediaAttachment[] = [];
    for (const media of medias) {
        if (!media.url) {
            continue;
        }
        if (
            (media.type === 'image' && mediaAttachments.length < MASTODON_MEDIA_IMAGES_MAX_COUNT - 1) ||
            (media.type === 'video' && mediaAttachments.length === 0)
        ) {

            // Download
            log.text = `medias: ↓ (${mediaAttachments.length + 1}/${medias.length}) downloading`;
            const mediaBlob = await downloadMedia(media.url);

            // Upload
            log.text = `medias: ↑ (${mediaAttachments.length + 1}/${medias.length}) uploading`;
            await client.v2.media.create({
                file: mediaBlob
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
            await savePostToCache(cache, post.tweet.id, toot.id, Platform.MASTODON);
        });
};
