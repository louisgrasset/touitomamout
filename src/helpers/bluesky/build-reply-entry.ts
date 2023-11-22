import { ReplyEntry } from "../../types/reply.js";

export const buildReplyEntry = (
  rootPost: { cid: string; uri: string },
  parentPost?: { cid: string; uri: string },
): ReplyEntry => ({
  root: {
    cid: rootPost.cid,
    uri: rootPost.uri,
  },
  parent: {
    cid: (parentPost ?? rootPost).cid,
    uri: (parentPost ?? rootPost).uri,
  },
});
