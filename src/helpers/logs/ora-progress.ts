import { Ora } from "ora";

const SEGMENT_DONE = "█";
const SEGMENT_UNDONE = "░";
export const oraProgress = (
  ora: Ora,
  text: {
    before?: string;
    after?: string;
  },
  index: number,
  maximum: number,
) => {
  const textBefore = text.before ?? " ";
  const textAfter = text.after ?? " ";
  const progress = Math.round((index / maximum) * 100);
  const segments = Math.round(progress / 5);
  const bar = `${SEGMENT_DONE.repeat(segments)}${SEGMENT_UNDONE.repeat(
    20 - segments,
  )}`;
  ora.text = `${textBefore + " "}${bar} ${progress}% ${textAfter}`;
};
