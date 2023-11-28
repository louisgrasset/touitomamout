jest.retryTimes(0);

// Mock @atproto/api with the actual implementation to bypass some type errors such as
// TypeError: api_1.default.RichText is not a constructor.

jest.mock("@atproto/api", () => ({
    ...jest.requireActual("@atproto/api"),
}));
