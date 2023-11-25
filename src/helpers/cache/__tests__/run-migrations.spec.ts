import { runMigrations } from "../run-migrations.js";
import { writeToCacheFile } from "../write-to-cache-file.js";

jest.mock("../write-to-cache-file.js", () => ({
  writeToCacheFile: jest.fn(),
}));

jest.mock("../migrations/index.js", () => ({
  __esModule: true,
  default: [
    jest.fn().mockImplementation(() => Promise.resolve()),
    jest.fn().mockImplementation(() => Promise.resolve()),
  ],
}));

jest.mock("../get-cache.js", () => ({
  getCache: jest.fn().mockResolvedValue({
    posts: {},
    profile: {},
    instance: {},
  }),
}));

describe("runMigrations", () => {
  it("should run all migrations", async () => {
    await runMigrations();
    expect(writeToCacheFile).toHaveBeenCalledTimes(2);
  });

  describe("when a migration fails", () => {
    it("should throw an error", async () => {
      (writeToCacheFile as jest.Mock).mockRejectedValueOnce(new Error("test"));
      await expect(runMigrations()).rejects.toThrow();
    });
  });
});
