import { Ora } from "ora";

import { ProfileType, ProfileUpdate } from "../../types/profile";
import { getCachedProfile } from "../cache/get-cached-profile";
import { computeBlobHash } from "../medias/compute-blob-hash";

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
      const isOutDated = liveProfile[type] !== cachedProfile[type];
      if (isOutDated) {
        isSyncRequired = true;
      }
      return {
        ...items,
        [type]: {
          hash: liveProfile[type],
          blob: blobs[type],
          required: isOutDated,
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
