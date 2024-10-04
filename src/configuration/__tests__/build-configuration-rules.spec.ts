import { buildConfigurationRules } from "../build-configuration-rules";

vi.mock("../../constants", () => ({
  BLUESKY_IDENTIFIER: "username",
  BLUESKY_INSTANCE: "bsky.social",
  BLUESKY_PASSWORD: "app-password",
  MASTODON_ACCESS_TOKEN: "access-token",
  MASTODON_INSTANCE: "mastodon.social",
  SYNC_BLUESKY: true,
  SYNC_MASTODON: true,
  TWITTER_HANDLE: "username",
}));

describe("buildConfigurationRules", () => {
  it("should return an array of configuration rules", () => {
    const result = buildConfigurationRules();
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(6);
  });
});
