import promises from "fs/promises";
import { Cookie } from "tough-cookie";

import { getCookies } from "../get-cookies.js";
import { cookiesMock } from "./mocks/cookie.js";

jest.mock("../../../constants.js", () => ({}));

const promiseReadFileMock = jest.spyOn(promises, "readFile");

describe("getCookies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when the file is accessible", () => {
    beforeEach(() => {
      promiseReadFileMock.mockResolvedValue(JSON.stringify(cookiesMock));
    });

    it("should get the cookies", async () => {
      const result = await getCookies();

      expect(result).toHaveLength(1);
      expect(result![0]).toBeInstanceOf(Cookie);
    });
  });

  describe("when the file is not accessible", () => {
    beforeEach(() => {
      promiseReadFileMock.mockImplementation(() => Promise.reject("error"));
    });

    it("should return null", async () => {
      const result = await getCookies();
      expect(result).toBeNull();
    });
  });
});
