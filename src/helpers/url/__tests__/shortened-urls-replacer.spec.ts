import { shortenedUrlsReplacer } from "../shortened-urls-replacer.js";

jest.mock("../get-redirection.js", () => {
  return {
    getRedirectedUrl: jest.fn((url: string) => {
      const number = url.match(/\/(\d+)/)?.[1];
      return Promise.resolve(number ? `https://example.com/${number}` : null);
    }),
  };
});

describe("shortenedUrlsReplacer", () => {
  it("should replace all urls from a given text with urls", async () => {
    const result = await shortenedUrlsReplacer(
      "Some text then url1 https://t.co/1 and url2 https://t.co/2.",
    );

    expect(result).toStrictEqual(
      "Some text then url1 https://example.com/1 and url2 https://example.com/2.",
    );
  });

  it("should not change the text if there is no url", async () => {
    const result = await shortenedUrlsReplacer("Some text then the end.");

    expect(result).toStrictEqual("Some text then the end.");
  });

  describe("when some urls are not resolved properly", () => {
    it("should only replace the resolved ones", async () => {
      const result = await shortenedUrlsReplacer(
        "Some text then url1 https://t.co/1 and url2 https://t.co/broken.",
      );

      expect(result).toStrictEqual(
        "Some text then url1 https://example.com/1 and url2 https://t.co/broken.",
      );
    });
  });
});
