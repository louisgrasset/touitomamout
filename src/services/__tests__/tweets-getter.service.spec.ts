import { Scraper } from "@the-convocation/twitter-scraper";

import { isTweetCached } from "../../helpers/tweet/index.js";
import { tweetsGetterService } from "../tweets-getter.service.js";
import { MockTwitterClient } from "./mocks/twitter-client.js";

jest.mock("ora");
jest.mock("../../constants.js", () => ({}));
jest.mock("../../helpers/tweet/is-tweet-cached.js");

const isTweetCachedMock = isTweetCached as jest.Mock;

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
