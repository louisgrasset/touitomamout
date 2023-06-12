import {mastodon} from 'masto';
import ora, {Ora} from 'ora';
import {TweetMedia} from '../types/index.js';
import {downloadMedia} from './download-media.js';

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

export const mediaAttachmentsHandler = async (medias: TweetMedia[], mastodonClient: mastodon.Client, log: Ora): Promise<mastodon.v1.MediaAttachment[]> => {
    const mediaAttachments: mastodon.v1.MediaAttachment[] = [];
    for (const media of medias) {
        if (
            (media.type === 'image' && mediaAttachments.length < MASTODON_MEDIA_IMAGES_MAX_COUNT - 1) ||
            (media.type === 'video' && mediaAttachments.length === 0)
        ) {

            // Download
            log.text=`medias: ↓ (${mediaAttachments.length + 1}/${medias.length}) downloading`;
            const mediaBlob = await downloadMedia(media.url);

            // Upload
            log.text=`medias: ↑ (${mediaAttachments.length +1 }/${medias.length}) uploading`;
            await mastodonClient.v2.mediaAttachments.create({
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
