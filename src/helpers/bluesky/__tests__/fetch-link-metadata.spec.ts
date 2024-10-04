import { fetchLinkMetadata } from "../fetch-link-metadata";
import { METADATA_MOCK } from "./mocks/metadata";

vi.mock("../../../constants", () => {
  return {
    TWITTER_HANDLE: "username",
    MASTODON_INSTANCE: "mastodon.social",
    MASTODON_MAX_POST_LENGTH: 500,
    BLUESKY_MAX_POST_LENGTH: 300,
  };
});

describe("fetchLinkMetadata", () => {
  it("should return the metadata if data is found", async () => {
    const result = await fetchLinkMetadata("https://bsky.app");
    expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(METADATA_MOCK));
  });

  it("should return null if no data is found", async () => {
    const result = await fetchLinkMetadata(
      "https://thisturldoesnotexist.example.com",
    );
    expect(result).toBeNull();
  });
});
