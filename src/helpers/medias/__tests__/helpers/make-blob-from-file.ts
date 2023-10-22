import { readFileSync } from "fs";
import { resolve } from "path";

export const makeBlobFromFile = async (
  fileName: string,
  mimeType: string,
): Promise<Blob> => {
  const file = readFileSync(resolve(__dirname, `../files/${fileName}`));
  return new Blob([file], { type: mimeType });
};

const makeUint8ArrayFromBlob = async (blob: Blob): Promise<Uint8Array> => {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return new Uint8Array(buffer);
};

export const makeUint8ArrayFromFile = async (
  fileName: string,
  mimeType: string,
): Promise<Uint8Array> => {
  const blob = await makeBlobFromFile(fileName, mimeType);
  return await makeUint8ArrayFromBlob(blob);
};
