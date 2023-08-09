import {mastodon} from 'masto';
import {Ora} from 'ora';
import {downloadMedia} from './download-media.js';
import {Photo, Video} from '@the-convocation/twitter-scraper/dist/tweets.js';

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

export const mediaAttachmentsHandler = async (photos: Photo[], videos: Video[], mastodonClient: mastodon.rest.Client, log: Ora): Promise<mastodon.v1.MediaAttachment[]> => {
    const mediaAttachments: mastodon.v1.MediaAttachment[] = [];
    const medias = [
        ...photos.map(i => ({...i, type: 'image'})),
        ...videos.map(i => ({...i, type: 'video'}))
    ];

    for (const media of medias) {
        if(!media.url) {
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
            await mastodonClient.v2.media.create({
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

    return mediaAttachments;
};
