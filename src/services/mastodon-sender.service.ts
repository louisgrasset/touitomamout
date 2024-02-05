import { mastodon } from "masto";
import { Ora } from "ora";

import { DEBUG, VOID } from "../constants.js";
import { savePostToCache } from "../helpers/cache/save-post-to-cache.js";
import { oraProgress } from "../helpers/logs/index.js";
import { getPostExcerpt } from "../helpers/post/get-post-excerpt.js";
import { MastodonCacheChunk, Media, Platform } from "../types/index.js";
import { MastodonPost } from "../types/post.js";
import { mediaDownloaderService } from "./index.js";

const MASTODON_MEDIA_IMAGES_MAX_COUNT = 4;

/**
 * An async method in charge of handling Mastodon posts computation & uploading.
 */
export const mastodonSenderService = async (
  client: mastodon.rest.Client | null,
  post: MastodonPost | null,
  medias: Media[],
  log: Ora,
) => {
  if (!client || !post) {
    return;
  }

  // Medias
  const mediaAttachments: mastodon.v1.MediaAttachment[] = [];
  for (const media of medias) {
    if (!media.url) {
      continue;
    }
    if (
      (media.type === "image" &&
        mediaAttachments.length < MASTODON_MEDIA_IMAGES_MAX_COUNT) ||
      (media.type === "video" && mediaAttachments.length === 0)
    ) {
      // Download
      log.text = `medias: ↓ (${mediaAttachments.length + 1}/${
        medias.length
      }) downloading`;
      const mediaBlob = await mediaDownloaderService(media.url);

      if (mediaBlob) {
        // Upload
        log.text = `medias: ↑ (${mediaAttachments.length + 1}/${
          medias.length
        }) uploading`;

        const mastodonMedia: {
          file: Blob;
          description?: string | null;
        } = {
          file: mediaBlob,
        };

        if (media.type === "image" && media.alt_text) {
          mastodonMedia.description = media.alt_text;
        }
        if (mastodonMedia.file instanceof Blob) {
          await client.v2.media
            .create(mastodonMedia)
            .then(async (mediaSent) => {
              mediaAttachments.push(mediaSent);
            })
            .catch((err) => {
              log.fail(err);
              return null;
            });
        }
      }
    }
  }

  // When no compatible media has been found and no text is present, skip the post.
  if (!mediaAttachments.length && !post.tweet.text) {
    log.warn(
      `🦣️ | post skipped: no compatible media nor text to post (tweet: ${post.tweet.id})`,
    );
    return;
  }

  log.text = `🦣 | toot sending: ${getPostExcerpt(post.tweet.text ?? VOID)}`;

  let chunkIndex = 0;
  const chunkReferences: MastodonCacheChunk[] = [];

  /**
   * For each chunk, create and send a toot.
   * If this is the first chunk, we attach medias to the toot if any.
   * If the tweet is a reply, we reference it.
   * If the tweet is long, each child chunk will reference the previous one as replyId.
   */
  for (const chunk of post.chunks) {
    if (DEBUG) {
      console.log("mastodon post chunk: ", chunk);
    }

    await client.v1.statuses
      .create({
        status: chunk,
        visibility: "public",
        mediaIds: chunkIndex === 0 ? mediaAttachments.map((m) => m.id) : [],
        inReplyToId:
          chunkIndex === 0 ? post.inReplyToId : chunkReferences[chunkIndex - 1],
      })
      .then(async (toot) => {
        oraProgress(
          log,
          { before: "🦣 | toot sending: " },
          chunkIndex,
          post.chunks.length,
        );

        // Save toot ID to be able to reference it while posting the next chunk.
        chunkReferences.push(toot.id);

        // If this is the last chunk, save the all chunks ID to the cache.
        if (chunkIndex === post.chunks.length - 1) {
          log.succeed(
            `🦣 | toot sent: ${getPostExcerpt(post.tweet.text ?? VOID)}${
              chunkReferences.length > 1
                ? ` (${chunkReferences.length} chunks)`
                : ""
            }`,
          );

          await savePostToCache({
            tweetId: post.tweet.id,
            data: chunkReferences,
            platform: Platform.MASTODON,
          });
        }

        chunkIndex++;
      })
      .catch((err) => log.fail(err));
  }
};
