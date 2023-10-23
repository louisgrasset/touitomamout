import { getPostExcerpt } from "../get-post-excerpt.js";

describe("getPostExcerpt", () => {
  it("should return the 25 first characters and remove break lines", () => {
    const result = getPostExcerpt(
      "This is a test from\n the Potato Inc. tech lead",
    );
    expect(result).toBe("« This is a test from the P... »");
  });
});
