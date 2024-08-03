import { runMigrations } from "../run-migrations";
import { writeToCacheFile } from "../write-to-cache-file";

vi.mock("../write-to-cache-file", () => ({
  writeToCacheFile: vi.fn(),
}));

vi.mock("../migrations/index", () => ({
  __esModule: true,
  default: [
    vi.fn().mockImplementation(() => Promise.resolve()),
    vi.fn().mockImplementation(() => Promise.resolve()),
  ],
}));

vi.mock("../get-cache", () => ({
  getCache: vi.fn().mockResolvedValue({
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
      (writeToCacheFile as vi.Mock).mockRejectedValueOnce(new Error("test"));
      await expect(runMigrations()).rejects.toThrow();
    });
  });
});
