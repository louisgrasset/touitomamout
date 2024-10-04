import { getRedirectedUrl } from "../get-redirection";

describe("getRedirectedUrl", () => {
  describe("when the url is redirected", () => {
    it("should return the final url", async () => {
      const result = await getRedirectedUrl("https://t.co/bbJgfyzcJR");
      expect(result).toStrictEqual("https://github.com/");
    });
  });
  describe("when the url is not redirected", () => {
    it("should return null", async () => {
      const result = await getRedirectedUrl("https://t.co/_____null_____");
      expect(result).toStrictEqual(null);
    });
  });
});
