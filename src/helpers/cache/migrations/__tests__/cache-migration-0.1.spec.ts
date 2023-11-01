import { migration } from "../cache-migration-0.1.js";

jest.mock("../../../../constants.js", () => {
  return {
    INSTANCE_ID: "username",
  };
});
describe("cache-migration-0.1", () => {
  describe("when the cache has the previous version", () => {
    it("should run the migration", async () => {
      const cache = {
        version: "0.0",
        username: {
          "1234567891234567891": {
            mastodon: "1234567891234567891",
            bluesky: {
              cid: "post-cid",
              rkey: "post-rkey",
            },
          },
        },
      };
      const migrationResult = await migration(cache);
      expect(migrationResult).toStrictEqual({
        version: "0.1",
        username: {
          "1234567891234567891": {
            mastodon: ["1234567891234567891"],
            bluesky: [
              {
                cid: "post-cid",
                rkey: "post-rkey",
              },
            ],
          },
        },
      });
    });
  });

  describe("when the cache has another version", () => {
    it("should not run the migration", async () => {
      const cache = {
        version: "x.x",
        username: {
          "1234567891234567891": {
            mastodon: "1234567891234567891",
            bluesky: {
              cid: "post-cid",
              rkey: "post-rkey",
            },
          },
        },
      };
      const migrationResult = await migration(cache);
      expect(migrationResult).toStrictEqual(cache);
    });
  });
});
