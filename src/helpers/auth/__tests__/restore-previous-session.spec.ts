import { Scraper } from "@the-convocation/twitter-scraper";
import { Cookie } from "tough-cookie";

import * as cookies from "../../cookies/get-cookies";
import { restorePreviousSession } from "../restore-previous-session";

const getCookiesMock = vi.spyOn(cookies, "getCookies");
const setCookiesMock = vi.fn();

vi.mock("../../../constants", () => {
  return {};
});

const cookieMock = {
  key: "cookie_id",
  value: "value",
  expires: new Date("2024-09-14T12:39:32.000Z"),
  maxAge: 34214400,
  domain: "twitter.com",
  path: "/",
  secure: true,
  hostOnly: false,
  creation: new Date("2023-11-04T11:15:28.230Z"),
  lastAccessed: new Date("2023-11-04T11:15:29.203Z"),
  sameSite: "none",
} as Cookie;

describe("restorePreviousSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when cookies are available", () => {
    beforeEach(() => {
      getCookiesMock.mockResolvedValueOnce([cookieMock]);
    });

    it("should restore previous session", async () => {
      await restorePreviousSession({
        setCookies: setCookiesMock,
      } as unknown as Scraper);

      expect(setCookiesMock).toHaveBeenCalledTimes(1);
      expect(setCookiesMock).toHaveBeenCalledWith([cookieMock]);
    });
  });

  describe("when cookies are not available", () => {
    const originalConsole = console.log;
    const consoleMock = vi.fn();
    beforeEach(() => {
      getCookiesMock.mockResolvedValueOnce(null);
      console.log = consoleMock;
    });

    afterAll(() => {
      console.log = originalConsole;
    });

    it("should not restore previous session", async () => {
      await restorePreviousSession({
        setCookies: setCookiesMock,
      } as unknown as Scraper);

      expect(setCookiesMock).not.toHaveBeenCalled();
      expect(consoleMock).toHaveBeenCalledTimes(1);
    });
  });
});
