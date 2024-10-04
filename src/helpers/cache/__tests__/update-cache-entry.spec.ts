import { Platform } from "../../../types";
import { updateCacheEntry } from "../update-cache-entry";
import { writeToCacheFile } from "../write-to-cache-file";

vi.mock("../write-to-cache-file", () => {
  return {
    writeToCacheFile: vi.fn(),
  };
});

vi.mock("../get-cache", () => {
  return {
    getCache: vi.fn().mockResolvedValue({
      version: "0.2",
      instance: {
        id: "",
      },
      profile: {
        avatar: "",
        banner: "",
      },
      posts: {},
    }),
  };
});

describe("updateCacheEntry", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it("should update the cache entry: profile", async () => {
    await updateCacheEntry("profile", {
      avatar: "avatar_hash",
      banner: "banner_hash",
    });
    expect(writeToCacheFile).toHaveBeenCalledTimes(1);
    expect(writeToCacheFile).toHaveBeenCalledWith({
      version: "0.2",
      instance: { id: "" },
      profile: { avatar: "avatar_hash", banner: "banner_hash" },
      posts: {},
    });
  });

  it("should update the cache entry: posts", async () => {
    await updateCacheEntry("posts", {
      "1": {
        [Platform.MASTODON]: ["1"],
        [Platform.BLUESKY]: [
          {
            cid: "1",
            rkey: "1",
          },
        ],
      },
    });
    expect(writeToCacheFile).toHaveBeenCalledTimes(1);
    expect(writeToCacheFile).toHaveBeenCalledWith({
      version: "0.2",
      instance: { id: "" },
      profile: { avatar: "", banner: "" },
      posts: {
        "1": {
          mastodon: ["1"],
          bluesky: [
            {
              cid: "1",
              rkey: "1",
            },
          ],
        },
      },
    });
  });
});
