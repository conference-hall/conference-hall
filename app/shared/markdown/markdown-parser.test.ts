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
