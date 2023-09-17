import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme.js';

module.exports = {
  mode: 'jit',
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        heading: ['Ubuntu'],
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config;
