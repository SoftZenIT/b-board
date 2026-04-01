import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => {
  // Global setup before all tests
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
