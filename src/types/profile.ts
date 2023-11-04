export type ProfileType = "avatar" | "banner";

export type ProfileUpdate = Record<
  ProfileType,
  { hash: string; blob: Blob; required: boolean }
>;
