import { BskyAgent } from "@atproto/api";
import { Profile, Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";

import { updateCacheEntry } from "../../helpers/cache/update-cache-entry.js";
import { makeBlobFromFile } from "../../helpers/medias/__tests__/helpers/make-blob-from-file.js";
import { profileSynchronizerService } from "../profile-synchronizer.service.js";

const constantsMock = jest.requireMock("../../constants.js");
jest.mock("../../constants.js", () => ({}));

jest.mock("../media-downloader.service.js", () => ({
  mediaDownloaderService: jest
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

jest.mock("../../helpers/cache/update-cache-entry.js", () => ({
  updateCacheEntry: jest.fn(),
}));

const updateCacheEntryMock = updateCacheEntry as jest.Mock;

jest.mock("../../helpers/medias/upload-bluesky-media.js", () => {
  return {
    uploadBlueskyMedia: jest.fn().mockResolvedValue({
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
  const getProfileSpy = jest.fn().mockResolvedValue(profileMock);
  twitterClient.getProfile = getProfileSpy;

  // Mastodon client
  const updateMastodonProfileSpy = jest.fn();
  const mastodonClient = {
    v1: {
      accounts: {
        updateCredentials: updateMastodonProfileSpy,
      },
    },
  } as unknown as mastodon.rest.Client;

  // Bluesky client
  const updateBlueskyProfileSpy = jest.fn();
  const blueskyClient = {
    upsertProfile: updateBlueskyProfileSpy,
  } as unknown as BskyAgent;

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
            jest.clearAllMocks();

            constantsMock.SYNC_PROFILE_DESCRIPTION = description;
            constantsMock.SYNC_PROFILE_PICTURE = name;
            constantsMock.SYNC_PROFILE_NAME = picture;
            constantsMock.SYNC_PROFILE_HEADER = header;
            constantsMock.TWITTER_HANDLE = "username";
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
