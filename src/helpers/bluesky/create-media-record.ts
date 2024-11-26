import { BlueskyMediaAttachment } from "../../types";

/**
 * Creates a media record based on the given media type and attachments.
 *
 * @param {'image' | 'video' | undefined} mediaType - The type of the media (image or video).
 * @param {BlueskyMediaAttachment[]} mediaAttachments - The media attachments to include in the record.
 * @returns {Object} The media record object tailored to the media type.
 */
export const createMediaRecord = (
  mediaType: "image" | "video" | undefined,
  mediaAttachments: BlueskyMediaAttachment[],
) => {
  switch (mediaType) {
    case "image":
      return {
        media: {
          $type: "app.bsky.embed.images",
          images: mediaAttachments.map((i) => ({
            alt: i.alt_text ?? "",
            image: i.data.blob.original,
          })),
        },
      };

    case "video":
      return {
        media: {
          $type: "app.bsky.embed.video",
          video: mediaAttachments[0].data.blob.original,
        },
      };

    default:
      return {};
  }
};
