import { BskyAgent } from '@atproto/api';
import { Scraper } from '@the-convocation/twitter-scraper';
import { mastodon } from 'masto';
import ora from 'ora';

import {
    SYNC_PROFILE_DESCRIPTION,
    SYNC_PROFILE_HEADER,
    SYNC_PROFILE_NAME,
    SYNC_PROFILE_PICTURE,
    TWITTER_HANDLE
} from '../constants.js';
import { downloadMedia } from '../handlers/index.js';
import { shortenedUrlsReplacer } from '../helpers/url/shortened-urls-replacer.js';
import { SynchronizerResponse } from '../types/index.js';
import { oraPrefixer } from '../utils/ora-prefixer.js';

export const profileSync = async (twitterClient: Scraper, mastodonClient: mastodon.rest.Client | null, blueskyClient: BskyAgent | null): Promise<SynchronizerResponse> => {
    if(!mastodonClient) {
        return {
            twitterClient, mastodonClient, blueskyClient
        };
    }

    const log = ora({ color: 'cyan', prefixText: oraPrefixer('profile-sync') }).start();
    log.text = 'parsing';

    const profile = await twitterClient.getProfile(TWITTER_HANDLE);
    const profilePicture = profile.avatar ? await downloadMedia(profile.avatar.replace('_normal', '')) : null;
    const profileHeader = profile.banner ? await downloadMedia(profile.banner) : null;

    // Generate the profile update object based on .env
    const params = [
        {
            condition: SYNC_PROFILE_DESCRIPTION,
            property: 'note',
            value: await shortenedUrlsReplacer(profile.biography || ''),
        },
        {
            condition: SYNC_PROFILE_NAME,
            property: 'displayName',
            value: profile.name,
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
    ].reduce((acc, { condition, property, value }) => condition ? { ...acc, [property]: value } : acc, {});

    // Post updates if any
    if (Object.keys(params).length) {
        log.text = 'sending';
        await mastodonClient.v1.accounts.updateCredentials(params);
    }
    log.succeed('task finished');

    return {
        twitterClient, mastodonClient, blueskyClient
    };
};
