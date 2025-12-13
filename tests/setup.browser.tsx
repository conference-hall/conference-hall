import 'vitest-browser-react';

import '../app/styles/fonts.css';
import '../app/styles/tailwind.css';

// Mock the clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
  configurable: true,
});
