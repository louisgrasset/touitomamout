export const areBlobsEqual = async (
  blob1: Blob,
  blob2: Blob,
): Promise<boolean> => {
  return !Buffer.from(await blob1.arrayBuffer()).compare(
    Buffer.from(await blob2.arrayBuffer()),
  );
};
