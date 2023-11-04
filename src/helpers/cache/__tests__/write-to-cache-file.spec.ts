import { writeFileSync } from "node:fs";

import { Cache } from "../../../types/index.js";
import { writeToCacheFile } from "../write-to-cache-file.js";

jest.mock("../../../constants.js", () => {
  return {
    CACHE_PATH: "./cache.json",
  };
});

jest.mock("node:fs");

describe("writeToCacheFile", () => {
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
  });

  it("should write to the cache file", () => {
    writeToCacheFile({ key: "value" } as unknown as Cache);

    expect(writeFileSync).toHaveBeenCalledTimes(1);
    expect(writeFileSync).toHaveBeenCalledWith(
      "./cache.json",
      '{"key":"value"}',
    );
  });
});
