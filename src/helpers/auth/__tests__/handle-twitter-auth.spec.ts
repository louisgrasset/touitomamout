import { Scraper } from "@the-convocation/twitter-scraper";

import { handleTwitterAuth } from "../handle-twitter-auth.js";
import { restorePreviousSession } from "../restore-previous-session.js";

const constantsMock = jest.requireMock("../../../constants.js");
jest.mock("../../../constants.js", () => ({}));
jest.mock("../restore-previous-session.js", () => ({
  restorePreviousSession: jest.fn(),
}));

const restorePreviousSessionSpy = restorePreviousSession as jest.Mock;

const isLoggedInSpy = jest.fn();
const loginSpy = jest.fn();
const getCookiesSpy = jest.fn();

const twitterClient = {
  isLoggedIn: isLoggedInSpy,
  login: loginSpy,
  getCookies: getCookiesSpy,
} as unknown as Scraper;

describe("handleTwitterAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when constants are not set", () => {
    beforeEach(() => {
      constantsMock.TWITTER_USERNAME = undefined;
      constantsMock.TWITTER_PASSWORD = undefined;
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
      constantsMock.TWITTER_USERNAME = "username";
      constantsMock.TWITTER_PASSWORD = "password";
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
