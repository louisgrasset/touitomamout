import { getCachedProfile } from "../get-cached-profile";

vi.mock("../get-cache", () => ({
  getCache: vi.fn().mockResolvedValue({
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
