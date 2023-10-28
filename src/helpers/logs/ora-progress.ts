import { Ora } from "ora";

const SEGMENT_DONE = "█";
const SEGMENT_UNDONE = "░";
export const oraProgress = (
  ora: Ora,
  text: string,
  index: number,
  maximum: number,
) => {
  const progress = Math.round((index / maximum) * 100);
  const segments = Math.round(progress / 5);
  const bar = `${SEGMENT_DONE.repeat(segments)}${SEGMENT_UNDONE.repeat(
    20 - segments,
  )}`;
  ora.text = `${bar} ${progress}% ${text}`;
};
