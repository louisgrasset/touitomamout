import { Ora } from "ora";

import { ProfileType, ProfileUpdate } from "../../types/profile.js";
import { getCachedProfile } from "../cache/get-cached-profile.js";
import { computeBlobHash } from "../medias/compute-blob-hash.js";

const getBlobHashOrNull = async (blob: Blob | null): Promise<string | null> => {
  return blob ? computeBlobHash(blob) : null;
};

export const buildProfileUpdate = async (
  blobs: Record<ProfileType, Blob | null>,
  log: Ora,
): Promise<ProfileUpdate> => {
  log.text = "checking images hashes...";
  const cachedProfile = await getCachedProfile();
  const liveProfile = {
    avatar: await getBlobHashOrNull(blobs.avatar),
    banner: await getBlobHashOrNull(blobs.banner),
  };

  let isSyncRequired = false;
  const update = (["avatar", "banner"] as ProfileType[]).reduce(
    (items, type) => {
      const isImageUpToDate = liveProfile[type] === cachedProfile[type];
      if (!isImageUpToDate) {
        isSyncRequired = true;
      }
      return {
        ...items,
        [type]: {
          hash: liveProfile[type],
          blob: blobs[type],
          required: isImageUpToDate,
        },
      };
    },
    {} as ProfileUpdate,
  );

  if (!isSyncRequired) {
    log.text = "no profile image update required";
  }
  return update;
};
