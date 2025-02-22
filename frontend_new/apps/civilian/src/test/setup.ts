import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Mock window.matchMedia
window.matchMedia = function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () {},
  };
} as unknown as (query: string) => MediaQueryList;

// Mock IntersectionObserver
window.IntersectionObserver = class IntersectionObserver {
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
} as unknown as typeof ResizeObserver;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
