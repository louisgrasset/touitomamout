export const parseTweetText = (text: string): string => {
    return text.match(/(?<text>.*)(?:https:\/\/t\.co\/\w+)$/s)?.groups?.['text'] || text;
};
