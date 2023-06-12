import {APIResponse, SynchronizerResponse} from '../types/index.js';
import {mastodon} from 'masto';
import {downloadMedia} from '../handlers/download-media.js';
import {
    SYNC_PROFILE_DESCRIPTION,
    SYNC_PROFILE_NAME,
    SYNC_PROFILE_PICTURE,
    SYNC_PROFILE_HEADER,
    TWITTER_USERNAME
} from '../constants.js';
import {parse} from 'node-html-parser';
import ora from 'ora';
import {oraPrefixer} from '../helpers/ora-prefixer.js';
import {shortenedUrlsReplacer} from '../helpers/url/shortened-urls-replacer.js';

export const profileSync = async (feed: APIResponse, mastodonClient: mastodon.Client): Promise<SynchronizerResponse> => {
    const log = ora({color: 'cyan', prefixText: oraPrefixer('profile-sync')}).start();
    log.text = 'parsing';

    const profileDescription = await shortenedUrlsReplacer(feed.description.match(/(.*)(?: - Made with love by RSSHub\(https:\/\/github\.com\/DIYgod\/RSSHub\))$/)?.[1] ?? '');
    const profileDisplayName = feed.title.match(/^(?:Twitter @)(.*)/)?.[1];
    const profilePicture = await downloadMedia(feed.icon);
    const profileHeader = await fetch(`https://nitter.net/${TWITTER_USERNAME}`)
        .then(response => response.text())
        .then(rawHtml => parse(rawHtml).querySelector('.profile-banner img')?.getAttribute('src')?.match(/(?:\/pic\/)(.*)$/)?.[1])
        .then(url => decodeURIComponent(url ?? ''))
        .then(downloadMedia)
        .catch(err => console.error(err));

    // Generate the profile update object based on .env
    const params = [
        {
            condition: SYNC_PROFILE_DESCRIPTION,
            property: 'note',
            value: profileDescription,
        },
        {
            condition: SYNC_PROFILE_NAME,
            property: 'displayName',
            value: profileDisplayName,
        },
        {
            condition: SYNC_PROFILE_PICTURE && profilePicture instanceof Blob,
            property: 'avatar',
            value: profilePicture,
        },
        {
            condition: SYNC_PROFILE_HEADER && profileHeader instanceof Blob,
            property: 'header',
            value: profileHeader,
        }
    ].reduce((acc, {condition, property, value}) => condition ? {...acc, [property]: value} : acc, {});

    // Post updates if any
    if (Object.keys(params).length) {
        log.text = 'sending';
        await mastodonClient.v1.accounts.updateCredentials(params);
    }
    log.succeed('task finished');

    return {
        feed, mastodonClient
    };
};
