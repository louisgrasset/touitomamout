import { getCachedPosts } from "../get-cached-posts.js";

jest.mock("../get-cache.js", () => ({
  getCache: jest.fn().mockResolvedValue({
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
  }),
}));

describe("get-cached-posts", () => {
  it("should return the cached posts", async () => {
    const cachedPosts = await getCachedPosts();

    expect(cachedPosts).toStrictEqual({
      "1": {
        mastodon: ["1"],
        bluesky: [
          {
            cid: "1",
            rkey: "1",
          },
        ],
      },
    });
  });
});
