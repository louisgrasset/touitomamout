import { AtpAgent, RichText } from "@atproto/api";

import { getBlueskyChunkLinkMetadata } from "../get-bluesky-chunk-link-metadata";
import { getBlueskyLinkMetadata } from "../get-bluesky-link-metadata";

vi.mock("../../../constants", () => ({}));

vi.mock("../get-bluesky-link-metadata", () => ({
  getBlueskyLinkMetadata: vi.fn(),
}));

const getBlueskyLinkMetadataMock = getBlueskyLinkMetadata as vi.Mock;
const cardMock = {
  title: "Example Domain",
  description:
    "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.",
  image: "https://example.com/assets/example.png",
  url: "https://example.com/potato",
};

describe("getBlueskyChunkLinkMetadata", () => {
  describe("when the richtext contains a link", () => {
    beforeEach(() => {
      getBlueskyLinkMetadataMock.mockResolvedValue(cardMock);
    });

    it("should return the metadata of the link", async () => {
      const richText = new RichText({
        text: "The potato is king. Learn more here: https://example.com/potato",
      });
      const client = new AtpAgent({
        service: `https://bsky.social`,
      });
      await richText.detectFacets(client);

      const result = await getBlueskyChunkLinkMetadata(richText, client);
      expect(result).toEqual(cardMock);
    });
  });

  describe("when the richtext does not contain a link", () => {
    beforeEach(() => {
      getBlueskyLinkMetadataMock.mockResolvedValue(null);
    });

    it("should return the metadata of the link", async () => {
      const richText = new RichText({
        text: "The potato is king. Learn more here.",
      });
      const client = new AtpAgent({
        service: `https://bsky.social`,
      });
      await richText.detectFacets(client);

      const result = await getBlueskyChunkLinkMetadata(richText, client);
      expect(result).toEqual(null);
    });
  });
});
