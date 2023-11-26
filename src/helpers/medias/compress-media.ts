import sharp from "sharp";

import { DEBUG } from "../../constants.js";

const findSmallerBuffer = (
  compressedBuffers: CompressedBuffer[],
): CompressedBuffer | undefined => {
  return compressedBuffers.reduce((smaller, current) =>
    current.buffer.length < smaller.buffer.length ? current : smaller,
  );
};

type CompressedBuffer = {
  buffer: Buffer;
  format: string;
};

export const compressMedia = async (
  inputBlob: Blob,
  targetSizeInBytes: number,
): Promise<Blob> => {
  // Get buffer from input blob
  const inputBuffer = await inputBlob
    .arrayBuffer()
    .then((buffer) => Buffer.from(buffer));

  let compressedBuffer: CompressedBuffer = {
    buffer: inputBuffer,
    format: inputBlob.type,
  };

  // Early return if the image is already smaller than the target size
  if (compressedBuffer.buffer.length <= targetSizeInBytes) {
    return inputBlob;
  }

  // Initial image dimensions
  const metadata = await sharp(inputBuffer).metadata();
  let width = metadata.width ?? 1;
  let height = metadata.height ?? 1;

  // Initial quality (compression level) and size decrease step
  let quality = 100;
  const sizeDecreaseStep = 5;
  const resizeRatio = 0.95; // You can adjust this ratio as needed

  // Loop until the image size is below the target size
  while (compressedBuffer.buffer.length > targetSizeInBytes && quality > 60) {
    // Test quality for each format
    const formats = [sharp.format.jpeg, sharp.format.png]; // Use sharp.format instead of format

    const compressWithFormat = async (
      acc: Promise<CompressedBuffer[]>,
      currentFormat: sharp.AvailableFormatInfo,
    ) => {
      try {
        const buffer = await sharp(inputBuffer)
          .resize({ width, height })
          .toFormat(currentFormat, { quality })
          .toBuffer();

        return [...(await acc), { buffer, format: currentFormat.id }];
      } catch (error) {
        console.error(`Error processing format:${currentFormat}: ${error}`);
        return await acc;
      }
    };

    // Compress the image with each format
    await formats
      .reduce(compressWithFormat, Promise.resolve([]))
      .then(findSmallerBuffer)
      .then((buffer) => {
        if (buffer) {
          compressedBuffer = {
            ...buffer,
            format: `image/${buffer.format}`,
          };
        }
      });

    // If quality is too low, resize the image and restart
    if (quality <= 65) {
      quality = 100;
      width = Math.ceil(width * resizeRatio);
      height = Math.ceil(height * resizeRatio);
    } else {
      quality -= sizeDecreaseStep;
    }
  }

  if (DEBUG) {
    console.log(
      `Compression results : ${inputBuffer.length / 1000}kB -> ${
        compressedBuffer.buffer.length / 1000
      }kB`,
    );
  }
  return new Blob([compressedBuffer.buffer], {
    type: compressedBuffer.format,
  });
};
