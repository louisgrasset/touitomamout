import { getCachedProfile } from "../get-cached-profile.js";

jest.mock("../get-cache.js", () => ({
  getCache: jest.fn().mockResolvedValue({
    profile: {
      avatar: "avatar",
      banner: "banner",
    },
  }),
}));

describe("get-cached-profile", () => {
  it("should return the cached profile", async () => {
    const cachedProfile = await getCachedProfile();

    expect(cachedProfile).toStrictEqual({
      avatar: "avatar",
      banner: "banner",
    });
  });
});
