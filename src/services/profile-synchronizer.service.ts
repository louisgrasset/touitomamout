import { BskyAgent } from "@atproto/api";
import { Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";
import ora from "ora";

import {
  SYNC_PROFILE_DESCRIPTION,
  SYNC_PROFILE_HEADER,
  SYNC_PROFILE_NAME,
  SYNC_PROFILE_PICTURE,
  TWITTER_HANDLE,
} from "../constants";
import { updateCacheEntry } from "../helpers/cache/update-cache-entry";
import { oraPrefixer } from "../helpers/logs";
import { uploadBlueskyMedia } from "../helpers/medias/upload-bluesky-media";
import { buildProfileUpdate } from "../helpers/profile/build-profile-update";
import { shortenedUrlsReplacer } from "../helpers/url/shortened-urls-replacer";
import { Platform, ProfileCache, SynchronizerResponse } from "../types";
import { mediaDownloaderService } from "./media-downloader.service";

/**
 * An async method in charge of dispatching profile synchronization tasks.
 */
export const profileSynchronizerService = async (
  twitterClient: Scraper,
  mastodonClient: mastodon.rest.Client | null,
  blueskyClient: BskyAgent | null,
): Promise<SynchronizerResponse> => {
  const log = ora({
    color: "cyan",
    prefixText: oraPrefixer("profile-sync"),
  }).start();
  log.text = "parsing";

  const profile = await twitterClient.getProfile(TWITTER_HANDLE);

  // Get profile images
  log.text = `avatar: ↓ downloading`;
  const avatarBlob = profile.avatar
    ? await mediaDownloaderService(profile.avatar.replace("_normal", ""))
    : null;
  log.text = `banner: ↓ downloading`;
  const bannerBlob = profile.banner
    ? await mediaDownloaderService(profile.banner)
    : null;

  // Build profile update
  const profileUpdate = await buildProfileUpdate(
    {
      avatar: avatarBlob,
      banner: bannerBlob,
    },
    log,
  );

  // Upload images to Bluesky if needed
  const blueskyAvatar =
    avatarBlob && profileUpdate.avatar.required
      ? await uploadBlueskyMedia(avatarBlob, blueskyClient)
      : null;

  const blueskyBanner =
    bannerBlob && profileUpdate.banner.required
      ? await uploadBlueskyMedia(bannerBlob, blueskyClient)
      : null;

  log.text = "updating profiles...";

  // Generate the profile update object based on .env
  const params = [
    {
      condition: SYNC_PROFILE_DESCRIPTION,
      [Platform.MASTODON]: {
        property: "note",
        value: await shortenedUrlsReplacer(profile.biography || ""),
      },
      [Platform.BLUESKY]: {
        property: "description",
        value: await shortenedUrlsReplacer(profile.biography || ""),
      },
    },
    {
      condition: SYNC_PROFILE_NAME,
      [Platform.MASTODON]: {
        property: "displayName",
        value: profile.name,
      },
      [Platform.BLUESKY]: {
        property: "displayName",
        value: profile.name,
      },
    },
    {
      condition:
        SYNC_PROFILE_PICTURE &&
        avatarBlob instanceof Blob &&
        profileUpdate.avatar.required,
      [Platform.MASTODON]: {
        property: "avatar",
        value: avatarBlob,
      },
      [Platform.BLUESKY]: {
        property: "avatar",
        value: blueskyAvatar?.data.blob,
      },
    },
    {
      condition:
        SYNC_PROFILE_HEADER &&
        bannerBlob instanceof Blob &&
        profileUpdate.banner.required,
      [Platform.MASTODON]: {
        property: "header",
        value: bannerBlob,
      },
      [Platform.BLUESKY]: {
        property: "banner",
        value: blueskyBanner?.data.blob,
      },
    },
  ].reduce(
    (acc, itemToSync) => {
      if (!itemToSync.condition) {
        return acc;
      }

      const item = Object.values(Platform).reduce((item, platform) => {
        const { property, value } = itemToSync[platform];
        return {
          ...item,
          [platform]: {
            ...acc[platform],
            [property]: value,
          },
        };
      }, {});

      return {
        ...acc,
        ...item,
      };
    },
    { [Platform.MASTODON]: {}, [Platform.BLUESKY]: {} },
  );

  // Post mastodon updates if any
  if (Object.keys(params.mastodon).length && mastodonClient) {
    log.text = "sending";
    await mastodonClient.v1.accounts.updateCredentials(params.mastodon);
  }

  // Post bluesky updates if any
  if (Object.keys(params.bluesky).length && blueskyClient) {
    await blueskyClient.upsertProfile((old) => ({
      ...old,
      ...params.bluesky,
    }));
  }

  // Update profile images hash
  await updateCacheEntry(
    "profile",
    Object.entries(profileUpdate).reduce(
      (updated, [type, { hash, ..._rest }]) => {
        return {
          ...updated,
          [type]: hash,
        };
      },
      {} as ProfileCache,
    ),
  );

  log.succeed("task finished");

  return {
    twitterClient,
    mastodonClient,
    blueskyClient,
  };
};
