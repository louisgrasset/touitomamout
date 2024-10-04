import { ComAtprotoRepoUploadBlob } from "@atproto/api";
import { Photo, Video } from "@the-convocation/twitter-scraper";

export type Media = (Photo & { type: "image" }) | (Video & { type: "video" });
export type BlueskyMediaAttachment = ComAtprotoRepoUploadBlob.Response & {
  alt_text?: string;
};
