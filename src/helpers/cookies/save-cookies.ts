import fs from "fs";
import { Cookie } from "tough-cookie";

import { COOKIES_PATH } from "../../constants.js";

export const saveCookies = async (cookies: Cookie[]): Promise<void> => {
  try {
    await fs.promises.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  } catch (err) {
    console.error("Error updating cookies file:", err);
  }
};
