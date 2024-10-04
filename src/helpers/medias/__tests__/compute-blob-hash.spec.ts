import { computeBlobHash } from "../compute-blob-hash";

vi.mock("../../../constants", () => {
  return {
    DEBUG: false,
  };
});

describe("computeBlobHash", () => {
  it("should compute the hash of a given blob", async () => {
    const blob = new Blob(["Hello, world!"], { type: "text/plain" });
    const hash = await computeBlobHash(blob);
    expect(hash).toEqual(
      "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3",
    );
  });
});
