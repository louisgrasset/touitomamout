import { Tweet } from "@the-convocation/twitter-scraper";

import { MASTODON_INSTANCE } from "../../../constants";
import {
  splitTextForBluesky,
  splitTextForMastodon,
} from "../split-tweet-text/split-tweet-text";

vi.mock("../../../constants", () => {
  return {
    TWITTER_HANDLE: "username",
    MASTODON_INSTANCE: "mastodon.social",
    MASTODON_MAX_POST_LENGTH: 500,
    BLUESKY_MAX_POST_LENGTH: 300,
  };
});

vi.mock("../../cache/get-cached-posts", () => {
  return {
    getCachedPosts: vi.fn().mockResolvedValue({
      "1234567891234567891": {
        mastodon: ["1234567891234567891"],
      },
    }),
  };
});

const MASTODON_USERNAME = "username";
const MASTODON_QUOTING_SECTION = `\n\nhttps://${MASTODON_INSTANCE}/@${MASTODON_USERNAME}/1234567891234567891`;

const POST_99_CHARS =
  "In the symphony of existence, every note, contributes to the masterpiece. Embrace the cacophony!...";

const POST_299_CHARS =
  "In the symphony of existence, every note, contributes to the masterpiece. Embrace the cacophony, find your rhythm, and dance to the melody of your purpose. Let passion be the compass, kindness the language, and love the eternal guide, for in these harmonies, we discover the essence of our humanity.";

const POST_900_CHARS =
  "Le premier soir je me suis donc endormi sur le sable à mille milles de toute terre habitée. J’étais bien plus isolé qu’un naufragé sur un radeau au milieu de l’Océan. Alors vous imaginez ma surprise, au lever du jour, quand une drôle de petite voix m’a réveillé. Elle disait :\n\n– S’il vous plaît... dessine-moi un mouton !\n\n– Hein !\n\n– Dessine-moi un mouton…\n\nJ’ai sauté sur mes pieds comme si j’avais été frappé par la foudre. J’ai bien frotté mes yeux. J’ai bien regardé. Et j’ai vu un petit bonhomme tout à fait extraordinaire qui me considérait gravement. Voilà le meilleur portrait que, plus tard, j’ai réussi à faire de lui. Mais mon dessin, bien sûr, est beaucoup moins ravissant que le modèle. Ce n’est pas ma faute. J’avais été découragé dans ma carrière de peintre par les grandes personnes, à l’âge de six ans, et je n’avais rien appris à dessiner, sauf les boas fermés et les boas ouverts";

const POST_LONG_LINK =
  "https://petit-prince.story.example.com/blog/the-story-of-the-petit-prince-a-french-book-written-by-antoine-de-saint-exupery-in-1943/?utm_source=pocket_saves";

const checkChunksLengthExpectations = (
  mastodonStatuses: string[],
  blueskyStatuses: string[],
) => {
  mastodonStatuses.forEach((status) => {
    expect(status.length).toBeLessThanOrEqual(500);
  });

  blueskyStatuses.forEach((status) => {
    expect(status.length).toBeLessThanOrEqual(300);
  });
};

describe("splitTweetText", () => {
  describe("when the text is small (99 chars: < mastodon, < bluesky)", () => {
    describe("and when the text has long links", () => {
      it("should return the text", async () => {
        const tweet = {
          text: `${POST_99_CHARS} ${POST_LONG_LINK}\n${POST_LONG_LINK}`,
          urls: [POST_LONG_LINK, POST_LONG_LINK],
        } as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toEqual([
          `${POST_99_CHARS} ${POST_LONG_LINK}\n${POST_LONG_LINK}`,
        ]);
        expect(blueskyStatuses).toEqual([
          `${POST_99_CHARS} ${POST_LONG_LINK}`,
          `${POST_LONG_LINK}`,
        ]);
      });
    });
    describe("and when the text is not quote", () => {
      it("should return the text", async () => {
        const tweet = {
          text: POST_99_CHARS,
          urls: [],
        } as unknown as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toEqual([POST_99_CHARS]);
        expect(blueskyStatuses).toEqual([POST_99_CHARS]);
      });
    });
    describe("and when the text is quote", () => {
      it("should return the text with the quote", async () => {
        const tweet = {
          text: POST_99_CHARS,
          urls: [],
          quotedStatusId: "1234567891234567891",
        } as unknown as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toEqual([
          POST_99_CHARS + MASTODON_QUOTING_SECTION,
        ]);
        expect(blueskyStatuses).toEqual([POST_99_CHARS]);
      });
    });
  });

  describe("when the text is medium (299 characters, < mastodon, < bluesky", () => {
    describe("and when the text is not quote", () => {
      it("should return the text", async () => {
        const tweet = {
          text: POST_299_CHARS,
        } as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toEqual([POST_299_CHARS]);
        expect(blueskyStatuses).toEqual([POST_299_CHARS]);
      });
    });
    describe("and when the text is quote", () => {
      it("should return the text with the quote", async () => {
        const tweet = {
          text: POST_299_CHARS,
          quotedStatusId: "1234567891234567891",
          urls: [],
        } as unknown as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toEqual([
          POST_299_CHARS + MASTODON_QUOTING_SECTION,
        ]);
        expect(blueskyStatuses).toEqual([POST_299_CHARS]);
      });
    });
  });

  describe("when the text is long (900 characters, > mastodon, > bluesky", () => {
    describe("and when the text is not quote", () => {
      it("should return the text", async () => {
        const tweet = {
          text: POST_900_CHARS,
          urls: [],
        } as unknown as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toStrictEqual([
          POST_900_CHARS.slice(0, 493),
          POST_900_CHARS.slice(494, 900),
        ]);
        expect(blueskyStatuses).toStrictEqual([
          POST_900_CHARS.slice(0, 298),
          POST_900_CHARS.slice(299, 596),
          POST_900_CHARS.slice(597, 892),
          POST_900_CHARS.slice(893, 900),
        ]);
      });
    });

    describe("and when the text is quote", () => {
      it("should return the text with the quote", async () => {
        const tweet = {
          text: POST_900_CHARS,
          quotedStatusId: "1234567891234567891",
          urls: [],
        } as unknown as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);

        // Mastodon statuses must include the quote in initial thread chunk
        expect(mastodonStatuses).toEqual([
          POST_900_CHARS.slice(0, 444) + MASTODON_QUOTING_SECTION,
          POST_900_CHARS.slice(445, 900),
        ]);

        // Bluesky should not be impacted by the quote
        expect(blueskyStatuses).toStrictEqual([
          POST_900_CHARS.slice(0, 298),
          POST_900_CHARS.slice(299, 596),
          POST_900_CHARS.slice(597, 892),
          POST_900_CHARS.slice(893, 900),
        ]);
      });
    });
  });

  describe("when the text has links", () => {
    describe("when there is no text before & after", () => {
      it("should return the text", async () => {
        const tweet = {
          text: `${POST_LONG_LINK}\n${POST_LONG_LINK}`,
          urls: [POST_LONG_LINK, POST_LONG_LINK],
        } as Tweet;
        const mastodonStatuses = await splitTextForMastodon(
          tweet,
          MASTODON_USERNAME,
        );
        const blueskyStatuses = await splitTextForBluesky(tweet);

        checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
        expect(mastodonStatuses).toEqual([
          `${POST_LONG_LINK}\n${POST_LONG_LINK}`,
        ]);
        expect(blueskyStatuses).toEqual([POST_LONG_LINK, POST_LONG_LINK]);
      });
    });
  });

  describe("when there is text before & after", () => {
    it("should return the text", async () => {
      const tweet = {
        text: `${POST_99_CHARS}${POST_LONG_LINK}\n${POST_LONG_LINK}${POST_99_CHARS}`,
        urls: [POST_LONG_LINK, POST_LONG_LINK],
      } as Tweet;
      const mastodonStatuses = await splitTextForMastodon(
        tweet,
        MASTODON_USERNAME,
      );
      const blueskyStatuses = await splitTextForBluesky(tweet);

      checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
      expect(mastodonStatuses).toEqual([
        `${POST_99_CHARS}${POST_LONG_LINK}\n${POST_LONG_LINK}${POST_99_CHARS.slice(
          0,
          85,
        )}`,
        `${POST_99_CHARS.slice(86, 99)}`,
      ]);
      expect(blueskyStatuses).toEqual([
        `${POST_99_CHARS}${POST_LONG_LINK}`,
        `${POST_LONG_LINK}${POST_99_CHARS}`,
      ]);
    });
  });

  describe("when there is text only before", () => {
    it("should return the text", async () => {
      const tweet = {
        text: `${POST_99_CHARS}${POST_LONG_LINK}\n${POST_LONG_LINK}`,
        urls: [POST_LONG_LINK, POST_LONG_LINK],
      } as Tweet;
      const mastodonStatuses = await splitTextForMastodon(
        tweet,
        MASTODON_USERNAME,
      );
      const blueskyStatuses = await splitTextForBluesky(tweet);

      checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
      expect(mastodonStatuses).toEqual([
        `${POST_99_CHARS}${POST_LONG_LINK}\n${POST_LONG_LINK}`,
      ]);
      expect(blueskyStatuses).toEqual([
        `${POST_99_CHARS}${POST_LONG_LINK}`,
        `${POST_LONG_LINK}`,
      ]);
    });
  });

  describe("when there is text only after", () => {
    it("should return the text", async () => {
      const tweet = {
        text: `${POST_LONG_LINK}\n${POST_LONG_LINK}${POST_99_CHARS}`,
        urls: [POST_LONG_LINK, POST_LONG_LINK],
      } as Tweet;
      const mastodonStatuses = await splitTextForMastodon(
        tweet,
        MASTODON_USERNAME,
      );
      const blueskyStatuses = await splitTextForBluesky(tweet);

      checkChunksLengthExpectations(mastodonStatuses, blueskyStatuses);
      expect(mastodonStatuses).toEqual([
        `${POST_LONG_LINK}\n${POST_LONG_LINK}${POST_99_CHARS}`,
      ]);
      expect(blueskyStatuses).toEqual([
        `${POST_LONG_LINK}`,
        `${POST_LONG_LINK}${POST_99_CHARS}`,
      ]);
    });
  });
});
