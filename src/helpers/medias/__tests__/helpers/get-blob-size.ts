export const getBlobSize = async (blob: Blob): Promise<number> => {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer.length;
};
