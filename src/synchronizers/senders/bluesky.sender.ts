import {downloadMedia} from '../../handlers/index.js';
import {Media, Platform} from '../../types/index.js';
import {Ora} from 'ora';
import {AppBskyEmbedRecord, BskyAgent} from '@atproto/api';
import {BlueskyPost} from '../../types/post.js';
import {getPostExcerpt} from '../../helpers/post/get-post-excerpt.js';
import {VOID} from '../../constants.js';
import {savePostToCache} from '../../helpers/cache/save-post-to-cache.js';
import {mediaBlobParser} from '../../helpers/medias/media-blob-parser.js';
import {ComAtprotoRepoUploadBlob} from '@atproto/api';
import {getCache} from '../../helpers/cache/index.js';
import {Cache} from '../../types/index.js';

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

export const blueskySender = async (client: BskyAgent, post: BlueskyPost, medias: Media[], log: Ora) => {
    async function waitTwoSeconds(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000); // 2000 milliseconds = 2 seconds
        });
    }

    // Medias
    const mediaAttachments: ComAtprotoRepoUploadBlob.Response[] = [];
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
            if (!mediaBlob) {
                continue;
            }

            // Upload
            log.text = `medias: ↑ (${mediaAttachments.length + 1}/${medias.length}) uploading`;
            const {mimeType, blobData} = await mediaBlobParser(mediaBlob);

            await client.uploadBlob(blobData, {encoding: mimeType})
                .then(async mediaSent => {
                    mediaAttachments.push(mediaSent);

                })
                .catch(err => {
                    log.fail(err);
                    return null;
                });
        }
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
                    images: mediaAttachments.length ? mediaAttachments.map(i => ({alt: '', image: i.data.blob.original})) : undefined
                },
                record: {
                    $type: 'app.bsky.embed.record',
                    record: {
                        cid: post.quotePost?.cid,
                        uri: post.quotePost?.uri
                    }
                }
            } as AppBskyEmbedRecord.View;
        } else {
            data.embed = {
                $type: 'app.bsky.embed.record',
                record: {
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
                images: mediaAttachments.length ? mediaAttachments.map(i => ({alt: '', image: i.data.blob.original})) : undefined
            };
        }
    }

    log.text = `☁️ | post sending: ${getPostExcerpt(post.tweet.text ?? VOID)}`;

    // Post
    await client.post({...data}).then(async (createdPost) => {
        log.succeed(`☁️ | post sent: ${getPostExcerpt(post.tweet.text ?? VOID)}`);
        const cache = await getCache();
        await savePostToCache(cache, post.tweet.id, {
            cid: createdPost.cid,
            rkey: createdPost.uri.match(/\/(?<rkey>\w+)$/)?.groups?.['rkey'] || ''
        }, Platform.BLUESKY);
        await waitTwoSeconds();
    });
};
