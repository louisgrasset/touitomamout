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
import { getBlueskyMediaRef } from '../helpers/medias/get-bluesky-media-ref.js';
import { shortenedUrlsReplacer } from '../helpers/url/shortened-urls-replacer.js';
import { Platform, SynchronizerResponse } from '../types/index.js';
import { oraPrefixer } from '../utils/ora-prefixer.js';

export const profileSync = async (twitterClient: Scraper, mastodonClient: mastodon.rest.Client | null, blueskyClient: BskyAgent | null): Promise<SynchronizerResponse> => {
    const log = ora({ color: 'cyan', prefixText: oraPrefixer('profile-sync') }).start();
    log.text = 'parsing';

    const profile = await twitterClient.getProfile(TWITTER_HANDLE);

    const profilePicture = profile.avatar ? await downloadMedia(profile.avatar.replace('_normal', '')) : null;
    const profileHeader = profile.banner ? await downloadMedia(profile.banner) : null;

    const blueskyProfilePicture = profilePicture ? await getBlueskyMediaRef(profilePicture, blueskyClient) : null;
    const blueskyProfileHeader = profileHeader ? await getBlueskyMediaRef(profileHeader, blueskyClient) : null;

    // Generate the profile update object based on .env
    const params = [
        {
            condition: SYNC_PROFILE_DESCRIPTION,
            [Platform.MASTODON]: {
                property: 'note',
                value: await shortenedUrlsReplacer(profile.biography || ''),
            },
            [Platform.BLUESKY]: {
                property: 'description',
                value: await shortenedUrlsReplacer(profile.biography || ''),
            },
        },
        {
            condition: SYNC_PROFILE_NAME,
            [Platform.MASTODON]: {
                property: 'displayName',
                value: profile.name,
            },
            [Platform.BLUESKY]: {
                property: 'displayName',
                value: profile.name,
            },
        },
        {
            condition: SYNC_PROFILE_PICTURE && profilePicture instanceof Blob,
            [Platform.MASTODON]: {
                property: 'avatar',
                value: profilePicture,
            },
            [Platform.BLUESKY]: {
                property: 'avatar',
                value: blueskyProfilePicture?.data.blob,
            },
        },
        {
            condition: SYNC_PROFILE_HEADER && profileHeader instanceof Blob,
            [Platform.MASTODON]: {
                property: 'header',
                value: profileHeader,
            },
            [Platform.BLUESKY]: {
                property: 'banner',
                value: blueskyProfileHeader?.data.blob,
            },
        }
    ].reduce((acc, itemToSync) => {
        if (!itemToSync.condition) {
            return acc;
        }

        const item = Object.values(Platform).reduce((item, platform) => {
            const { property, value } = itemToSync[platform];
            return {
                ...item,
                [platform]: {
                    ...acc[platform],
                    [property]: value
                },
            };
        }, {});


        return {
            ...acc,
            ...item
        };
    }, { [Platform.MASTODON]: {}, [Platform.BLUESKY]: {} });

    // Post updates if any
    if (Object.keys(params.mastodon).length && mastodonClient) {
        log.text = 'sending';
        await mastodonClient.v1.accounts.updateCredentials(params.mastodon);
    }

    if (Object.keys(params.bluesky).length && blueskyClient) {
        await blueskyClient.upsertProfile((old => {
            return {
                ...old,
                ...params.bluesky
            };
        }
        ));

    }

    log.succeed('task finished');

    return {
        twitterClient, mastodonClient, blueskyClient
    };
}
;
