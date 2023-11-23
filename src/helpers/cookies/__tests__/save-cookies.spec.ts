import promises from "fs/promises";
import { Cookie } from "tough-cookie";

import { saveCookies } from "../save-cookies.js";
import { cookiesMock } from "./mocks/cookie.js";

jest.mock("../../../constants.js", () => {
  return {
    COOKIES_PATH: "./cookies.json",
  };
});

const promiseWriteFileMock = jest.spyOn(promises, "writeFile");
describe("saveCookies", () => {
  it("should write to the cookie file", async () => {
    await saveCookies([cookiesMock[0] as unknown as Cookie]);
    expect(promiseWriteFileMock).toHaveBeenCalledTimes(1);
  });
});
