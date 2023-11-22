import { AppBskyFeedPost } from "@atproto/api";

import { buildReplyEntry } from "../build-reply-entry.js";

const rootPost = {
  cid: "rootPost-cid",
  uri: "rootPost-uri",
  value: {} as AppBskyFeedPost.Record,
};

const parentPost = {
  cid: "parentPost-cid",
  uri: "parentPost-uri",
  value: {} as AppBskyFeedPost.Record,
};

describe("buildReplyEntry", () => {
  it("should work", () => {
    const result = buildReplyEntry(rootPost, parentPost);

    expect(result).toEqual({
      root: {
        cid: rootPost.cid,
        uri: rootPost.uri,
      },
      parent: {
        cid: parentPost.cid,
        uri: parentPost.uri,
      },
    });
  });

  describe("when parentPost is not provided", () => {
    it("should rely on the root post to declare the parent references", () => {
      const result = buildReplyEntry(rootPost);

      expect(result).toEqual({
        root: {
          cid: rootPost.cid,
          uri: rootPost.uri,
        },
        parent: {
          cid: rootPost.cid,
          uri: rootPost.uri,
        },
      });
    });
  });
});
