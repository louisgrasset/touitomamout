import promises from "node:fs/promises";

import { Cookie } from "tough-cookie";

import { getCookies } from "../get-cookies";
import { cookiesMock } from "./mocks/cookie";

vi.mock("../../../constants", () => ({}));

const promiseReadFileMock = vi.spyOn(promises, "readFile");

describe("getCookies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
