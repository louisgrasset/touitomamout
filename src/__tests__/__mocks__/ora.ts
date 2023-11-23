module.exports = {
  name: "ora",
  default: jest.fn(() => ({
    start: jest
      .fn()
      .mockImplementation(() => ({ text: "", succeed: jest.fn() })),
    succeed: jest.fn(),
    fail: jest.fn(),
    warn: jest.fn(),
  })),
  __esModule: true,
};
