import bsky from "@atproto/api";

export type LinkMetadata = {
  error: string;
  likely_type: string;
  url: string;
  title: string;
  description: string;
  image: string;
};

export type BlueskyLinkMetadata = Omit<LinkMetadata, "image"> & {
  image: bsky.ComAtprotoRepoUploadBlob.Response | undefined;
};
