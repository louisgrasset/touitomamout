import { Scraper } from "@the-convocation/twitter-scraper";

import { getCookies } from "../cookies/get-cookies.js";
import { TouitomamoutError } from "../error.js";

export const restorePreviousSession = async (
  client: Scraper,
): Promise<void> => {
  try {
    const cookies = await getCookies();
    if (cookies) {
      await client.setCookies(cookies);
    } else {
      throw new Error("Unable to restore cookies");
    }
  } catch (err) {
    console.log(
      TouitomamoutError(err as string, [
        "Logging in with credentials instead.",
      ]),
    );
  }
};
