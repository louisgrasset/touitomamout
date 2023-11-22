import { oraPrefixer } from "../ora-prefixer.js";

describe("ora-prefixer", () => {
  it("should return the given prefix with end pad", () => {
    const result = oraPrefixer("prefix");
    expect(result).toBe("prefix         ");
  });
});
