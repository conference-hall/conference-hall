import { MarkdownParser } from './markdown-parser.ts';

describe('#MarkdownParser.parse', () => {
  it('parses markdown to html', () => {
    const markdown = '**Hello**';
    const html = MarkdownParser.parse(markdown);
    expect(html).toBe('<p><strong>Hello</strong></p>\n');
  });

  it('disables html tags in markdown', () => {
    const markdown = '<a href="https://example.com">Hello</a>';
    const html = MarkdownParser.parse(markdown);
    expect(html).toBe('<p>Hello</p>\n');
  });

  it('returns empty string when markdown source is null', () => {
    const html = MarkdownParser.parse(null);
    expect(html).toBe('');
  });

  describe('with in app renderer', () => {
    it('rewrites heading style and allow only 3 levels', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4';
      const html = MarkdownParser.parse(markdown, { withAppRenderer: true });
      expect(html).toBe(
        '<h1 class="text-base font-semibold">Heading 1</h1><h2 class="text-sm font-semibold">Heading 2</h2><h3 class="text-sm font-medium">Heading 3</h3>#### Heading 4',
      );
    });

    it('opens links in new tab', () => {
      const markdown = '[Hello](https://example.com)';
      const html = MarkdownParser.parse(markdown, { withAppRenderer: true });
      expect(html).toBe('<p><a href="https://example.com" target="_blank">Hello</a></p>\n');
    });

    it('displays link url when no text given', () => {
      const markdown = '[](https://example.com)';
      const html = MarkdownParser.parse(markdown, { withAppRenderer: true });
      expect(html).toBe('<p><a href="https://example.com" target="_blank">https://example.com</a></p>\n');
    });

    it('linkify urls', () => {
      const markdown = 'https://example.com';
      const html = MarkdownParser.parse(markdown, { withAppRenderer: true });
      expect(html).toBe('<p><a href="https://example.com" target="_blank">https://example.com</a></p>\n');
    });

    it('add <br> on a single line break', () => {
      const markdown = 'Hello\nWorld';
      const html = MarkdownParser.parse(markdown, { withAppRenderer: true });
      expect(html).toBe('<p>Hello<br>World</p>\n');
    });
  });
});

describe('#MarkdownParser.stats', () => {
  it('returns zero counts for null or empty source', () => {
    expect(MarkdownParser.stats(null)).toEqual({ chars: 0, words: 0 });
    expect(MarkdownParser.stats('')).toEqual({ chars: 0, words: 0 });
  });

  it('counts characters and words from plain text', () => {
    expect(MarkdownParser.stats('Hello world')).toEqual({ chars: 11, words: 2 });
  });

  it('strips markdown formatting from counts', () => {
    expect(MarkdownParser.stats('**bold** and _italic_')).toEqual({ chars: 15, words: 3 });
  });

  it('counts inline code content', () => {
    expect(MarkdownParser.stats('Use `console.log` here')).toEqual({ chars: 20, words: 3 });
  });

  it('counts text inside headings', () => {
    expect(MarkdownParser.stats('# My Title')).toEqual({ chars: 8, words: 2 });
  });

  it('counts text inside links', () => {
    expect(MarkdownParser.stats('[click here](https://example.com)')).toEqual({ chars: 10, words: 2 });
  });

  it('handles multi-byte unicode characters correctly', () => {
    expect(MarkdownParser.stats('Hello 🌍')).toEqual({ chars: 7, words: 2 });
  });

  it('counts across multiple paragraphs', () => {
    const markdown = 'First paragraph\n\nSecond paragraph';
    expect(MarkdownParser.stats(markdown)).toEqual({ chars: 32, words: 4 });
  });
});
