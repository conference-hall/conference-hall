import 'vitest-browser-react';
import '../app/styles/fonts.css';
import '../app/styles/tailwind.css';
import { page } from 'vitest/browser';

// Mock the clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
  configurable: true,
});

afterEach(async () => {
  await page.viewport(1920, 1080);
});
