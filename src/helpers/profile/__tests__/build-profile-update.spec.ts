import { Ora } from "ora";

import { getCachedProfile } from "../../cache/get-cached-profile.js";
import { buildProfileUpdate } from "../build-profile-update.js";

jest.mock("../../../constants.js", () => {
  return {
    DEBUG: false,
  };
});

const getCachedProfileMock = getCachedProfile as jest.Mock;

const mockBlobs = {
  upToDate: "up-to-date",
  outdated: "outdated",
};

jest.mock("../../medias/compute-blob-hash.js", () => ({
  computeBlobHash: jest.fn().mockImplementation(() => mockBlobs.upToDate),
}));

jest.mock("../../cache/get-cached-profile.js", () => ({
  getCachedProfile: jest.fn(),
}));

describe("buildProfileUpdate", () => {
  describe("when the profile requires an update", () => {
    beforeEach(() => {
      getCachedProfileMock.mockImplementation(() => ({
        avatar: mockBlobs.outdated,
        banner: mockBlobs.outdated,
      }));
    });

    it("should return an object with avatar and banner with required true", async () => {
      const result = await buildProfileUpdate(
        {
          avatar: mockBlobs.upToDate as unknown as Blob,
          banner: mockBlobs.upToDate as unknown as Blob,
        },
        {
          text: "",
        } as Ora,
      );

      expect(result).toStrictEqual({
        avatar: {
          hash: mockBlobs.upToDate,
          blob: mockBlobs.upToDate,
          required: true,
        },
        banner: {
          hash: mockBlobs.upToDate,
          blob: mockBlobs.upToDate,
          required: true,
        },
      });
    });
  });

  describe("when the profile is up to date", () => {
    beforeEach(() => {
      getCachedProfileMock.mockImplementation(() => ({
        avatar: mockBlobs.upToDate,
        banner: mockBlobs.upToDate,
      }));
    });

    it("should return an object with avatar and banner with required false", async () => {
      const result = await buildProfileUpdate(
        {
          avatar: mockBlobs.upToDate as unknown as Blob,
          banner: mockBlobs.upToDate as unknown as Blob,
        },
        {
          text: "",
        } as Ora,
      );

      expect(result).toStrictEqual({
        avatar: {
          hash: mockBlobs.upToDate,
          blob: mockBlobs.upToDate,
          required: false,
        },
        banner: {
          hash: mockBlobs.upToDate,
          blob: mockBlobs.upToDate,
          required: false,
        },
      });
    });
  });
});
