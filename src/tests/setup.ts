import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => {
  // Global setup before all tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  // Global teardown after each test
});

afterAll(() => {
  // Global teardown after all tests
});

export const mockEvent = (type: string, payload?: unknown) => {
  return new CustomEvent(type, { detail: payload });
};
