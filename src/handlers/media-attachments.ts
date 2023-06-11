import {mastodon} from 'masto';
import ora from 'ora';
import {downloadMedia} from '../download-media.js';
import {TweetMedia} from '../types/index.js';

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

export const mediaAttachmentsHandler = async (medias: TweetMedia[], mastodonClient: mastodon.Client): Promise<mastodon.v1.MediaAttachment[]> => {
    const log = ora({color: 'green', prefixText: 'Medias'}).start();
    const mediaAttachments: mastodon.v1.MediaAttachment[] = [];
    for (const media of medias) {
        if (
            (media.type === 'image' && mediaAttachments.length < MASTODON_MEDIA_IMAGES_MAX_COUNT - 1) ||
            (media.type === 'video' && mediaAttachments.length === 0)
        ) {
            // Download
            log.text = `[${mediaAttachments.length} / ${medias.length}] downloading`;
            const mediaBlob = await downloadMedia(media.url);
            log.succeed(`[${mediaAttachments.length + 1} / ${medias.length}] downloaded`);

            // Upload
            log.text = `[${mediaAttachments.length} / ${medias.length}] uploading`;
            await mastodonClient.v2.mediaAttachments.create({
                file: mediaBlob
            })
                .then(mediaSent => {
                    mediaAttachments.push(mediaSent);
                    log.succeed(`[${mediaAttachments.length} / ${medias.length}] uploaded`);
                })
                .catch(err => {
                    log.fail(`upload failure:\n${err}`);
                    return null;
                });
        }
    }
    return mediaAttachments;
};
