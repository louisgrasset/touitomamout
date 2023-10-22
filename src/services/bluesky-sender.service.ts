import { AppBskyEmbedRecord, BskyAgent } from '@atproto/api';
import { Ora } from 'ora';

import { VOID } from '../constants.js';
import { getCache } from '../helpers/cache/index.js';
import { savePostToCache } from '../helpers/cache/save-post-to-cache.js';
import { parseBlobForBluesky } from '../helpers/medias/parse-blob-for-bluesky.js';
import { getPostExcerpt } from '../helpers/post/get-post-excerpt.js';
import { BlueskyMediaAttachment, Media, Platform } from '../types/index.js';
import { BlueskyPost } from '../types/post.js';
import { mediaDownloaderService } from './index.js';

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

/**
 * An async method in charge of handling Bluesky posts computation & uploading
 */
export const blueskySenderService = async (client: BskyAgent | null, post: BlueskyPost | null, medias: Media[], log: Ora) => {
    if(!client || !post) {
        return;
    }

    // Medias
    const mediaAttachments: BlueskyMediaAttachment[] = [];
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
            const mediaBlob = await mediaDownloaderService(media.url);
            if (!mediaBlob) {
                continue;
            }

            // Upload
            log.text = `medias: ↑ (${mediaAttachments.length + 1}/${medias.length}) uploading`;
            const { mimeType, blobData } = await parseBlobForBluesky(mediaBlob);

            await client.uploadBlob(blobData, { encoding: mimeType })
                .then(async mediaSent => {
                    const m : BlueskyMediaAttachment = { ...mediaSent };
                    if(media.type === 'image' && media.alt_text) {
                        m.alt_text = media.alt_text;
                    }
                    mediaAttachments.push(m);
                })
                .catch(err => {
                    log.fail(err);
                    return null;
                });
        }
    }

    // When no compatible media has been found and no text is present, skip the post
    if(!mediaAttachments.length && !post.tweet.text) {
        log.warn(`☁️ | post skipped: no compatible media nor text to post (tweet: ${post.tweet.id})`);
        return;
    }

    // Data creation
    const data: {
        [x: string]: unknown
    } = {
        $type: 'app.bsky.feed.post',
        text: post.status,
        facets: post.facets,
        createdAt: new Date(post.tweet.timestamp || Date.now()).toISOString(),
    };

    if (post.quotePost) {
        if (mediaAttachments.length) {
            data.embed = {
                $type: 'app.bsky.embed.recordWithMedia',
                media: {
                    $type: 'app.bsky.embed.images',
                    images: mediaAttachments.length ? mediaAttachments.map(i => ({
                        alt: i.alt_text ?? '',
                        image: i.data.blob.original
                    })) : undefined
                },
                record: {
                    $type: 'app.bsky.embed.record',
                    cid: post.quotePost?.cid,
                    uri: post.quotePost?.uri
                }
            } as AppBskyEmbedRecord.View;
        } else {
            data.embed = {
                $type: 'app.bsky.embed.record',
                record: {
                    $type: 'app.bsky.embed.record',
                    cid: post.quotePost?.cid,
                    uri: post.quotePost?.uri
                }
            } as AppBskyEmbedRecord.View;
        }
    } else {
        if (post.replyPost) {
            data.reply = {
                root: {
                    cid: post.replyPost?.cid,
                    uri: post.replyPost?.uri
                },
                parent: {
                    cid: post.replyPost?.cid,
                    uri: post.replyPost?.uri
                }
            };
        }

        if (mediaAttachments.length) {
            data.embed = {
                $type: 'app.bsky.embed.images',
                images: mediaAttachments.length ? mediaAttachments.map(i => ({
                    alt: i.alt_text ?? '',
                    image: i.data.blob.original
                })) : undefined
            };
        }
    }

    log.text = `☁️ | post sending: ${getPostExcerpt(post.tweet.text ?? VOID)}`;

    // Post
    await client.post({ ...data }).then(async (createdPost) => {
        log.succeed(`☁️ | post sent: ${getPostExcerpt(post.tweet.text ?? VOID)}`);
        const cache = await getCache();
        await savePostToCache({
            cache,
            tweetId: post.tweet.id,
            data: {
                cid: createdPost.cid,
                rkey: createdPost.uri.match(/\/(?<rkey>\w+)$/)?.groups?.['rkey'] || ''
            },
            platform: Platform.BLUESKY
        });
    });
};
