import { Scraper } from "@the-convocation/twitter-scraper";

import { handleTwitterAuth } from "../handle-twitter-auth";
import { restorePreviousSession } from "../restore-previous-session";

const constantsMock = vi.requireMock("../../../constants");
vi.mock("../../../constants", () => ({}));
vi.mock("../restore-previous-session", () => ({
  restorePreviousSession: vi.fn(),
}));

const restorePreviousSessionSpy = restorePreviousSession as vi.Mock;

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
