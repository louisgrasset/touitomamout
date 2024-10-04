import { readFile } from "node:fs/promises";

import { Cookie } from "tough-cookie";

import { COOKIES_PATH } from "../../constants";

export const getCookies = async (): Promise<Cookie[] | null> => {
  try {
    const fileContent = await readFile(COOKIES_PATH, "utf-8");

    return Object.values(JSON.parse(fileContent)).reduce((acc: Cookie[], c) => {
      const cookie = Cookie.fromJSON(JSON.stringify(c));
      return cookie ? [...acc, cookie] : acc;
    }, []);
  } catch {
    return null;
  }
};
