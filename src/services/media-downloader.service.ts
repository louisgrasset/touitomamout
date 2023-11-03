/**
 * A method to download the media.
 */
export const mediaDownloaderService = async (url: string): Promise<Blob> => {
  try {
    return await fetch(url).then((res) => res.blob());
  } catch (err) {
    throw new Error(`Unable to download media:\n${err}`);
  }
};
