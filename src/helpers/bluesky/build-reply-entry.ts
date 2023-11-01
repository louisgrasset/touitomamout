import { BlueskyCacheChunkWithUri } from "../../types/index.js";

export const buildReplyEntry = (
  parentPost: BlueskyCacheChunkWithUri,
  rootPost: BlueskyCacheChunkWithUri,
) => ({
  root: {
    cid: parentPost.cid,
    uri: parentPost.uri,
  },
  parent: {
    cid: rootPost.cid,
    uri: rootPost.uri,
  },
});
