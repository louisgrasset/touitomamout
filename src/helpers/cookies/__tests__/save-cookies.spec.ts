import promises from "node:fs/promises";

import { Cookie } from "tough-cookie";

import { saveCookies } from "../save-cookies";
import { cookiesMock } from "./mocks/cookie";

vi.mock("../../../constants", () => {
  return {
    COOKIES_PATH: "./cookies.json",
  };
});

const promiseWriteFileMock = vi.spyOn(promises, "writeFile");
describe("saveCookies", () => {
  it("should write to the cookie file", async () => {
    await saveCookies([cookiesMock[0] as unknown as Cookie]);
    expect(promiseWriteFileMock).toHaveBeenCalledTimes(1);
  });
});
