import type { RendererObject } from 'marked';
import { Marked } from 'marked';
import xss from 'xss';

// @ts-expect-error
const { getDefaultWhiteList } = xss;

const xssOptions = {
  whiteList: {
    ...getDefaultWhiteList(),
    h1: ['class'],
    h2: ['class'],
    h3: ['class'],
  },
};

const defaultRenderer: RendererObject = {
  html: () => '',
};

const appRenderer: RendererObject = {
  ...defaultRenderer,
  heading: (token) => {
    if (token.depth === 1) return `<h1 class="text-base font-semibold">${token.text}</h1>`;
    if (token.depth === 2) return `<h2 class="text-sm font-semibold">${token.text}</h2>`;
    if (token.depth === 3) return `<h3 class="text-sm font-medium">${token.text}</h3>`;
    return token.raw;
  },
  link: (token) => {
    return `<a href="${token.href}" target="_blank">${token.text || token.href}</a>`;
  },
};

type ParserOptions = { withAppRenderer?: boolean } | undefined;

function getMarked(options: ParserOptions = {}) {
  return new Marked({
    gfm: true,
    breaks: true,
    renderer: options.withAppRenderer ? appRenderer : defaultRenderer,
  });
}

function parse(source: string | null, options: ParserOptions = {}) {
  if (!source) return '';

  const marked = getMarked(options);
  const html = marked.parse(source, { async: false }) as string;

  return xss(html, xssOptions);
}

function stats(source: string | null) {
  if (!source) return { chars: 0, words: 0 };

  const marked = getMarked();
  let text = '';
  marked.use({
    walkTokens(token) {
      if ((token.type === 'text' && !token.tokens) || token.type === 'codespan' || token.type === 'code') {
        text += token.text?.trim() + ' ';
      }
    },
  });
  marked.parse(source);

  const rawText = text.trim();
  return {
    chars: [...rawText].length,
    words: rawText.split(/\s+/).filter(Boolean).length,
  };
}

export const MarkdownParser = { parse, stats };
