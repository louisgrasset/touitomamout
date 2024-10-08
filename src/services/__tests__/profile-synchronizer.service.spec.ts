import { AtpAgent } from "@atproto/api";
import { Profile, Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";
import { vi } from "vitest";

import { updateCacheEntry } from "../../helpers/cache/update-cache-entry";
import { makeBlobFromFile } from "../../helpers/medias/__tests__/helpers/make-blob-from-file";
import { profileSynchronizerService } from "../profile-synchronizer.service";

const { mockedConstants } = vi.hoisted(() => ({
  mockedConstants: {
    SYNC_PROFILE_DESCRIPTION: "",
    SYNC_PROFILE_PICTURE: "",
    SYNC_PROFILE_NAME: "",
    SYNC_PROFILE_HEADER: "",
    TWITTER_HANDLE: "",
    DEBUG: false,
  },
}));

vi.mock("../../constants", () => mockedConstants);
vi.doMock("../../constants", () => ({
  DEBUG: mockedConstants.DEBUG,
  SYNC_PROFILE_DESCRIPTION: mockedConstants.SYNC_PROFILE_DESCRIPTION,
  SYNC_PROFILE_PICTURE: mockedConstants.SYNC_PROFILE_PICTURE,
  SYNC_PROFILE_NAME: mockedConstants.SYNC_PROFILE_NAME,
  SYNC_PROFILE_HEADER: mockedConstants.SYNC_PROFILE_HEADER,
  TWITTER_HANDLE: mockedConstants.TWITTER_HANDLE,
}));

vi.mock("../media-downloader.service", () => ({
  mediaDownloaderService: vi
    .fn()
    .mockResolvedValue(makeBlobFromFile("image-png.png", "image/png")),
}));

const profileMock = {
  avatar:
    "https://pbs.twimg.com/profile_images/1234567890/1234567890_400x400.jpg",
  banner: "https://pbs.twimg.com/profile_banners/1234567890/1234567890",
  biography: "description",
  birthday: undefined,
  name: "name",
} as Profile;

vi.mock("../../helpers/cache/update-cache-entry", () => ({
  updateCacheEntry: vi.fn(),
}));

const updateCacheEntryMock = updateCacheEntry as vi.Mock;

vi.mock("../../helpers/medias/upload-bluesky-media", () => {
  return {
    uploadBlueskyMedia: vi.fn().mockResolvedValue({
      success: true,
      data: {
        blob: {
          original: "123456789",
        },
      },
    }),
  };
});

describe("profileSynchronizerService", () => {
  // Twitter client
  const twitterClient = new Scraper();
  const getProfileSpy = vi.fn().mockResolvedValue(profileMock);
  twitterClient.getProfile = getProfileSpy;

  // Mastodon client
  const updateMastodonProfileSpy = vi.fn();
  const mastodonClient = {
    v1: {
      accounts: {
        updateCredentials: updateMastodonProfileSpy,
      },
    },
  } as unknown as mastodon.rest.Client;

  // Bluesky client
  const updateBlueskyProfileSpy = vi.fn();
  const blueskyClient = {
    upsertProfile: updateBlueskyProfileSpy,
  } as unknown as AtpAgent;

  // Actual tests
  describe.each`
    mastodonClient    | blueskyClient    | label
    ${mastodonClient} | ${null}          | ${"mastodon"}
    ${null}           | ${blueskyClient} | ${"bluesky"}
    ${mastodonClient} | ${blueskyClient} | ${"mastodon & bluesky"}
  `(
    "when the following clients are available ($label)",
    ({ mastodonClient, blueskyClient }) => {
      describe.each`
        label                | description | name     | picture  | header
        ${"everything"}      | ${true}     | ${true}  | ${true}  | ${true}
        ${"the description"} | ${true}     | ${false} | ${false} | ${false}
        ${"the name"}        | ${false}    | ${true}  | ${false} | ${false}
        ${"the picture"}     | ${false}    | ${false} | ${true}  | ${false}
        ${"the banner"}      | ${false}    | ${false} | ${false} | ${true}
        ${"nothing"}         | ${false}    | ${false} | ${false} | ${false}
      `(
        "when the profile sync will update $label",
        ({ description, name, picture, header }) => {
          beforeEach(async () => {
            vi.clearAllMocks();

            mockedConstants.SYNC_PROFILE_DESCRIPTION = description;
            mockedConstants.SYNC_PROFILE_PICTURE = name;
            mockedConstants.SYNC_PROFILE_NAME = picture;
            mockedConstants.SYNC_PROFILE_HEADER = header;
            mockedConstants.TWITTER_HANDLE = "username";
          });

          it("should properly sync the profile", async () => {
            await profileSynchronizerService(
              twitterClient,
              mastodonClient,
              blueskyClient,
            );

            expect(getProfileSpy).toHaveBeenCalledTimes(1);

            const noClientAvailable = !mastodonClient && !blueskyClient;
            const profileUpdateDisabled =
              !description && !name && !picture && !header;

            if (profileUpdateDisabled || noClientAvailable) {
              // No update
              expect(updateMastodonProfileSpy).not.toHaveBeenCalled();
              expect(updateBlueskyProfileSpy).not.toHaveBeenCalled();
            } else {
              if (mastodonClient && !blueskyClient) {
                // Mastodon update
                expect(updateMastodonProfileSpy).toHaveBeenCalledTimes(1);

                // No Bluesky update
                expect(updateBlueskyProfileSpy).not.toHaveBeenCalled();
              }

              if (!mastodonClient && blueskyClient) {
                // Bluesky update
                expect(updateBlueskyProfileSpy).toHaveBeenCalledTimes(1);

                // No Mastodon update
                expect(updateMastodonProfileSpy).not.toHaveBeenCalled();
              }

              if (mastodonClient && blueskyClient) {
                // Both are updated
                expect(updateMastodonProfileSpy).toHaveBeenCalledTimes(1);
                expect(updateBlueskyProfileSpy).toHaveBeenCalledTimes(1);
              }
            }

            // Always update the profile images hashes cache
            expect(updateCacheEntryMock).toHaveBeenCalledTimes(1);
          });
        },
      );
    },
  );
});
