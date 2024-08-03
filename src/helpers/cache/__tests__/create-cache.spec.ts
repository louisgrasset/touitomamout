import { access } from "node:fs/promises";

import { INSTANCE_ID } from "../../../constants";
import { createCacheFile } from "../create-cache";
import { writeToCacheFile } from "../write-to-cache-file";

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
  constants: {
    F_OK: "F_OK",
  },
}));

vi.mock("../../../constants", () => {
  return {
    INSTANCE_ID: "username",
    CACHE_PATH: "./cache.json",
  };
});

vi.mock("../write-to-cache-file", () => ({
  writeToCacheFile: vi.fn(),
}));

const promiseAccessMock = access as vi.Mock;

describe("createCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
