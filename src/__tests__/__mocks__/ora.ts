const methods = {
  fail: jest.fn(),
  info: jest.fn(),
  stop: jest.fn(),
  succeed: jest.fn(),
  warn: jest.fn(),
};

module.exports = {
  name: "ora",
  default: jest.fn(() => ({
    start: jest.fn().mockImplementation(() => ({
      text: "",
      ...methods,
    })),
    ...methods,
  })),
  __esModule: true,
};
