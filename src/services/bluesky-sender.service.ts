import { AtpAgent, RichText } from "@atproto/api";
import { Ora } from "ora";

import { BACKDATE_BLUESKY_POSTS, DEBUG, VOID } from "../constants";
import {
  buildReplyEntry,
  getBlueskyChunkLinkMetadata,
} from "../helpers/bluesky";
import { savePostToCache } from "../helpers/cache/save-post-to-cache";
import { oraProgress } from "../helpers/logs";
import { parseBlobForBluesky } from "../helpers/medias/parse-blob-for-bluesky";
import { getPostExcerpt } from "../helpers/post/get-post-excerpt";
import {
  BlueskyCacheChunk,
  BlueskyMediaAttachment,
  Media,
  Platform,
} from "../types";
import { BlueskyPost } from "../types/post";
import { mediaDownloaderService } from "./";

const BLUESKY_MEDIA_IMAGES_MAX_COUNT = 4;

/**
 * An async method in charge of handling Bluesky posts computation & uploading.
 */
export const blueskySenderService = async (
  client: AtpAgent | null,
  post: BlueskyPost | null,
  medias: Media[],
  log: Ora,
) => {
  if (!client || !post) {
    return;
  }

  // Medias
  const mediaAttachments: BlueskyMediaAttachment[] = [];
  for (const media of medias) {
    if (!media.url) {
      continue;
    }

    if (
      (media.type === "image" &&
        mediaAttachments.length < BLUESKY_MEDIA_IMAGES_MAX_COUNT) ||
      (media.type === "video" && mediaAttachments.length === 0)
    ) {
      // Download
      log.text = `medias: ↓ (${mediaAttachments.length + 1}/${
        medias.length
      }) downloading`;
      const mediaBlob = await mediaDownloaderService(media.url);
      if (!mediaBlob) {
        continue;
      }

      const blueskyBlob = await parseBlobForBluesky(mediaBlob).catch((err) => {
        if (DEBUG) {
          console.log(err);
        }
        log.warn(
          `medias: ↯ (${mediaAttachments.length + 1}/${
            medias.length
          }) skipped for ☁️ bluesky : ${err}`,
        );
        return null;
      });

      if (!blueskyBlob) {
        continue;
      }

      // Upload
      log.text = `medias: ↑ (${mediaAttachments.length + 1}/${
        medias.length
      }) uploading`;

      await client
        .uploadBlob(blueskyBlob.blobData, { encoding: blueskyBlob.mimeType })
        .then(async (mediaSent) => {
          const m: BlueskyMediaAttachment = { ...mediaSent };
          if (media.type === "image" && media.alt_text) {
            m.alt_text = media.alt_text;
          }
          mediaAttachments.push(m);
        })
        .catch((err) => {
          log.fail(err);
          return null;
        });
    }
  }

  // When no compatible media has been found and no text is present, skip the post.
  if (!mediaAttachments.length && !post.tweet.text) {
    log.warn(
      `☁️ | post skipped: no compatible media nor text to post (tweet: ${post.tweet.id})`,
    );
    return;
  }

  let chunkIndex = 0;
  const chunkReferences: Array<BlueskyCacheChunk & { uri: string }> = [];

  /**
   * For each chunk, create and send a toot.
   * If this is the first chunk, we attach medias to the toot if any.
   * If the tweet is a reply, we reference it.
   * If the tweet is long, each child chunk will reference the previous one as replyId.
   */
  for (const chunk of post.chunks) {
    if (DEBUG) {
      console.log("bluesky post chunk: ", chunk);
    }

    const richText = new RichText({ text: chunk });
    await richText.detectFacets(client);

    let createdAt;
    if (BACKDATE_BLUESKY_POSTS) {
      createdAt = new Date(post.tweet.timestamp || Date.now()).toISOString();
    } else {
      createdAt = new Date(Date.now()).toISOString();
    }

    const data: {
      [x: string]: unknown;
    } = {
      $type: "app.bsky.feed.post",
      text: richText.text,
      facets: richText.facets,
      createdAt,
    };

    /**
     * First, compute the embed data.
     * It can be: quote, media, quote + media, or link card.
     */
    const quoteRecord = post.quotePost
      ? {
          record: {
            $type: "app.bsky.embed.record",
            cid: post.quotePost.cid,
            uri: post.quotePost.uri,
          },
        }
      : {};

    const mediaRecord = mediaAttachments.length
      ? {
          media: {
            $type: "app.bsky.embed.images",
            images: mediaAttachments.map((i) => ({
              alt: i.alt_text ?? "",
              image: i.data.blob.original,
            })),
          },
        }
      : {};

    const card = await getBlueskyChunkLinkMetadata(richText, client);
    const externalRecord = card
      ? {
          external: {
            uri: card.url,
            title: card.title,
            description: card.description,
            thumb: card.image?.data.blob.original,
            $type: "app.bsky.embed.external",
          },
        }
      : {};

    /**
     * Then, build the embed object.
     */
    let embed = {};

    // Inject media and/or quote data only for the first chunk.
    if (chunkIndex === 0) {
      // Handle quote
      if (Object.keys(quoteRecord).length) {
        embed = {
          ...quoteRecord,
          $type: "app.bsky.embed.record",
        };
        // ...with media(s)
        if (Object.keys(mediaRecord).length) {
          embed = {
            ...embed,
            ...mediaRecord,
            $type: "app.bsky.embed.recordWithMedia",
          };
        }
      } else if (Object.keys(mediaRecord).length) {
        // Handle media(s) only
        embed = {
          ...mediaRecord.media,
        };
      }
    }

    // Handle link card if no quote nor media
    if (!Object.keys(quoteRecord).length && !Object.keys(mediaRecord).length) {
      if (Object.keys(externalRecord).length) {
        embed = {
          ...embed,
          ...externalRecord,
          $type: "app.bsky.embed.external",
        };
      }
    }

    // Inject embed data.
    if (Object.keys(embed).length) {
      data.embed = embed;
    }

    if (chunkIndex === 0) {
      if (post.replyPost) {
        if (post.replyPost.value.reply) {
          data.reply = buildReplyEntry(
            post.replyPost.value.reply.root,
            post.replyPost,
          );
        } else {
          data.reply = buildReplyEntry(post.replyPost);
        }
      }
    } else {
      data.reply = buildReplyEntry(
        chunkReferences[0],
        chunkReferences[chunkIndex - 1],
      );
    }

    log.text = `☁️ | post sending: ${getPostExcerpt(post.tweet.text ?? VOID)}`;

    // Post
    await client
      .post({ ...data })
      .then(async (createdPost) => {
        oraProgress(
          log,
          { before: "☁️ | post sending: " },
          chunkIndex,
          post.chunks.length,
        );

        // Save post ID to be able to reference it while posting the next chunk.
        const RKEY_REGEX = /\/(?<rkey>\w+)$/;
        chunkReferences.push({
          cid: createdPost.cid,
          uri: createdPost.uri,
          rkey: RKEY_REGEX.exec(createdPost.uri)?.groups?.["rkey"] ?? "",
        });

        // If this is the last chunk, save the all chunks ID to the cache.
        if (chunkIndex === post.chunks.length - 1) {
          log.succeed(
            `☁️ | post sent: ${getPostExcerpt(post.tweet.text ?? VOID)}${
              chunkReferences.length > 1
                ? ` (${chunkReferences.length} chunks)`
                : ""
            }`,
          );

          await savePostToCache({
            tweetId: post.tweet.id,
            data: chunkReferences.map((ref) => ({
              rkey: ref.rkey,
              cid: ref.cid,
            })),
            platform: Platform.BLUESKY,
          });
        }

        chunkIndex++;
      })
      .catch((err) => log.fail(err));
  }
};
