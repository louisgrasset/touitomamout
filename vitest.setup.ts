import { vi } from "vitest";

const methods = {
  fail: vi.fn(),
  info: vi.fn(),
  stop: vi.fn(),
  succeed: vi.fn(),
  warn: vi.fn(),
};

vi.mock("ora", () => ({
  name: "ora",
  default: vi.fn(() => ({
    start: vi.fn().mockImplementation(() => ({
      text: "",
      ...methods,
    })),
    ...methods,
  })),
  __esModule: true,
}));
