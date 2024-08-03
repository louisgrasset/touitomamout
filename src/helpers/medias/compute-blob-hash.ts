import { subtle } from "node:crypto";

import { DEBUG } from "../../constants.js";

export const computeBlobHash = async (blob: Blob): Promise<string> => {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  if (DEBUG) {
    console.log(`Computed hash: ${hash}`);
  }

  return hash;
};
