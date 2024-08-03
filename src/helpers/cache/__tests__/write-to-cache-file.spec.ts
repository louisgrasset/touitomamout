import { writeFileSync } from "node:fs";

import { Cache } from "../../../types";
import { writeToCacheFile } from "../write-to-cache-file";

vi.mock("../../../constants", () => {
  return {
    CACHE_PATH: "./cache.json",
  };
});

vi.mock("node:fs");

describe("writeToCacheFile", () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
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
