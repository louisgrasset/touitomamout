import { access } from "fs/promises";

import { INSTANCE_ID } from "../../../constants.js";
import { createCacheFile } from "../create-cache.js";
import { getCache } from "../get-cache.js";
import { writeToCacheFile } from "../write-to-cache-file.js";

jest.mock("fs/promises", () => ({
  access: jest.fn(),
  constants: {
    F_OK: "F_OK",
  },
}));

jest.mock("../../../constants.js", () => {
  return {
    INSTANCE_ID: "username",
    CACHE_PATH: "./cache.json",
  };
});

jest.mock("../get-cache.js", () => ({
  getCache: jest.fn().mockResolvedValue({
    instance: {
      id: INSTANCE_ID,
    },
  }),
}));

jest.mock("../write-to-cache-file.js", () => ({
  writeToCacheFile: jest.fn(),
}));

const promiseAccessMock = access as jest.Mock;

describe("createCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when the file is accessible", () => {
    beforeEach(() => {
      promiseAccessMock.mockResolvedValueOnce(undefined);
    });
    it("should not create a new cache file", async () => {
      await createCacheFile();

      expect(promiseAccessMock).toHaveBeenCalledTimes(1);
      expect(getCache).toHaveBeenCalledTimes(1);
      expect(writeToCacheFile).not.toHaveBeenCalled();
    });
  });

  describe("when the file is not accessible", () => {
    beforeEach(() => {
      promiseAccessMock.mockRejectedValueOnce("error");
    });

    it("should create a new cache file", async () => {
      await createCacheFile();

      expect(promiseAccessMock).toHaveBeenCalledTimes(1);
      expect(getCache).not.toHaveBeenCalled();
      expect(writeToCacheFile).toHaveBeenCalledWith({
        version: "0.2",
        instance: { id: INSTANCE_ID },
        profile: { avatar: "", banner: "" },
        posts: {},
      });
    });
  });
});
