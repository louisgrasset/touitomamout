const ERROR_NEW_LINE = "\n               └─ ";
export const TouitomamoutError = (error: string, details: string[]) => {
  const formattedDetails = details.reduce((formatted, detail) => {
    return detail ? formatted + `${ERROR_NEW_LINE}${detail}` : formatted;
  }, "");
  const lastLine = `${ERROR_NEW_LINE}🦣.`;
  return `\n\x1b[36;1m[touitomamout]\x1b[0m ${error}${formattedDetails}${lastLine}`;
};
