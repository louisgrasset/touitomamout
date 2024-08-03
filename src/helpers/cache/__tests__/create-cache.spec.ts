import { access } from "node:fs/promises";

import { INSTANCE_ID } from "../../../constants.js";
import { createCacheFile } from "../create-cache.js";
import { writeToCacheFile } from "../write-to-cache-file.js";

jest.mock("node:fs/promises", () => ({
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
      expect(writeToCacheFile).toHaveBeenCalledWith({
        version: "0.2",
        instance: { id: INSTANCE_ID },
        profile: { avatar: "", banner: "" },
        posts: {},
      });
    });
  });
});
