import { writeFile } from "fs/promises";
import { Cookie } from "tough-cookie";

import { COOKIES_PATH } from "../../constants.js";

export const saveCookies = async (cookies: Cookie[]): Promise<void> => {
  try {
    await writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  } catch (err) {
    console.error("Error updating cookies file:", err);
  }
};
