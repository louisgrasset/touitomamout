import promises from "fs/promises";

import { getCache } from "../get-cache.js";

const promiseReadFileMock = jest.spyOn(promises, "readFile");

jest.mock("../../../constants.js", () => {
  return {
    INSTANCE_ID: "id",
  };
});

const defaultCacheMock = {
  instance: { id: "" },
  posts: {},
  profile: { avatar: "", banner: "" },
  version: "",
};

const cacheMock = {
  ...defaultCacheMock,
  posts: {
    "post-id": {},
  },
};

describe("getCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when the file is accessible", () => {
    beforeEach(() => {
      promiseReadFileMock.mockResolvedValue(JSON.stringify(cacheMock));
    });

    it("should get the cache", async () => {
      const result = await getCache();

      expect(result).toStrictEqual(cacheMock);
    });
  });

  describe("when the file is not accessible", () => {
    beforeEach(() => {
      promiseReadFileMock.mockImplementation(() => Promise.reject("error"));
    });

    it("should return new cache data", async () => {
      const result = await getCache();

      expect(result).toStrictEqual(defaultCacheMock);
    });
  });
});
