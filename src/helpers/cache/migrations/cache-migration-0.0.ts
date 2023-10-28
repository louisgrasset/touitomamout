export const migration = async (outdatedCache: NonNullable<unknown>) => {
  if (Object.hasOwn(outdatedCache, "version")) {
    return outdatedCache;
  }
  return {
    ...outdatedCache,
    version: "0.0",
  };
};
