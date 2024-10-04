import { writeFile } from "node:fs/promises";

import { Cookie } from "tough-cookie";
import { vi } from "vitest";

import { saveCookies } from "../save-cookies";
import { cookiesMock } from "./mocks/cookie";

vi.mock("../../../constants", () => ({
  COOKIES_PATH: "./cookies.json",
}));

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

const promiseWriteFileMock = writeFile as vi.Mock;

describe("saveCookies", () => {
  it("should write to the cookie file", async () => {
    await saveCookies([cookiesMock[0] as unknown as Cookie]);
    expect(promiseWriteFileMock).toHaveBeenCalledTimes(1);
  });
});
