import { oraPrefixer } from "../ora-prefixer";

describe("ora-prefixer", () => {
  it("should return the given prefix with end pad", () => {
    const result = oraPrefixer("prefix");
    expect(result).toBe("prefix         ");
  });
});
