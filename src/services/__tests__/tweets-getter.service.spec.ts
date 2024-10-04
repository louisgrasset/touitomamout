import { Scraper } from "@the-convocation/twitter-scraper";

import { isTweetCached } from "../../helpers/tweet";
import { tweetsGetterService } from "../tweets-getter.service";
import { MockTwitterClient } from "./mocks/twitter-client";

vi.mock("../../constants", () => ({
  TWITTER_HANDLE: "username",
  DEBUG: false,
  API_RATE_LIMIT: 10,
}));
vi.mock("../../helpers/tweet/is-tweet-cached");

const isTweetCachedMock = isTweetCached as vi.Mock;

describe("tweetsGetterService", () => {
  describe("when tweets are not cached", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(false);
    });

    it("should be kept", async () => {
      const client = new MockTwitterClient(3);
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets).toHaveLength(3);
    });
  });

  describe("when tweets are cached", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(true);
    });

    it("should be skipped", async () => {
      const client = new MockTwitterClient(3);
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets).toHaveLength(0);
    });
  });
});
