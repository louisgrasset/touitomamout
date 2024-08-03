import { migration } from "../cache-migration-0.0";

describe("cache-migration-0.0", () => {
  it("should migration initial cache", async () => {
    const cache = {};
    const migrationResult = await migration(cache);
    expect(migrationResult).toStrictEqual({
      version: "0.0",
    });
  });

  describe("when the cache has a version", () => {
    it("should not run the migration", async () => {
      const cache = {
        version: "x.x",
      };
      const migrationResult = await migration(cache);
      expect(migrationResult).toStrictEqual(cache);
    });
  });
});
