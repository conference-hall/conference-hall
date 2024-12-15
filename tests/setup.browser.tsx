import { cleanup } from '@testing-library/react';
import '../app/styles/fonts.css';
import '../app/styles/tailwind.css';

afterEach(async () => {
  cleanup();
});
