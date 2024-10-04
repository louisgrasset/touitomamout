import { Scraper } from "@the-convocation/twitter-scraper";
import { beforeEach, Mock, vi } from "vitest";

import { handleTwitterAuth } from "../handle-twitter-auth";
import { restorePreviousSession } from "../restore-previous-session";

vi.mock("../restore-previous-session", () => ({
  restorePreviousSession: vi.fn(),
}));

const { mockedConstants } = vi.hoisted(() => ({
  mockedConstants: {
    TWITTER_USERNAME: "",
    TWITTER_PASSWORD: "",
  },
}));

vi.mock("../../../constants", () => mockedConstants);

vi.doMock("../../../constants", () => ({
  TWITTER_USERNAME: mockedConstants.TWITTER_USERNAME,
  TWITTER_PASSWORD: mockedConstants.TWITTER_PASSWORD,
}));

const restorePreviousSessionSpy = restorePreviousSession as Mock;

const isLoggedInSpy = vi.fn();
const loginSpy = vi.fn();
const getCookiesSpy = vi.fn();

const twitterClient = {
  isLoggedIn: isLoggedInSpy,
  login: loginSpy,
  getCookies: getCookiesSpy,
} as unknown as Scraper;

describe("handleTwitterAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when constants are not set", () => {
    beforeEach(() => {
      mockedConstants.TWITTER_USERNAME = "";
      mockedConstants.TWITTER_PASSWORD = "";
    });

    it("should not log in", async () => {
      const result = await handleTwitterAuth(twitterClient);

      expect(restorePreviousSessionSpy).not.toHaveBeenCalled();
      expect(loginSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("when constants are set", () => {
    beforeEach(() => {
      mockedConstants.TWITTER_USERNAME = "username";
      mockedConstants.TWITTER_PASSWORD = "password";
    });

    describe("when cookies are set", () => {
      beforeEach(() => {
        getCookiesSpy.mockResolvedValue(["cookies"]);
      });

      it("should restore the previous session", async () => {
        await handleTwitterAuth(twitterClient);

        expect(restorePreviousSessionSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("when cookies are not set", () => {
      beforeEach(() => {
        getCookiesSpy.mockResolvedValue(undefined);
      });

      it("should login", async () => {
        await handleTwitterAuth(twitterClient);

        expect(restorePreviousSessionSpy).toHaveBeenCalledTimes(1);
        expect(isLoggedInSpy).toHaveBeenCalledTimes(2);
        expect(loginSpy).toHaveBeenCalledTimes(1);
        expect(loginSpy).toHaveBeenCalledWith("username", "password");
      });
    });
  });
});
