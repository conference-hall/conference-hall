import { render } from '@react-email/components';
import { EmailMarkdown } from './email-markdown.tsx';

describe('EmailMarkdown template interpolation', () => {
  describe('Basic interpolation', () => {
    it('interpolates single variable', async () => {
      const template = 'Hello {{name}}';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Hello John');
    });

    it('interpolates multiple variables', async () => {
      const template = '{{greeting}} {{name}}! Welcome to {{event}}';
      const variables = { greeting: 'Hello', name: 'John', event: 'Conference Hall' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Hello John! Welcome to Conference Hall');
    });

    it('interpolates same variable multiple times', async () => {
      const template = '{{name}} said: "My name is {{name}}"';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('John said: &quot;My name is John&quot;');
    });

    it('leaves undefined variables as placeholders', async () => {
      const template = 'Hello {{name}}, welcome to {{event}}';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Hello John, welcome to {{event}}');
    });

    it('handles empty template', async () => {
      const template = '';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('<div data-id="react-email-markdown"');
    });

    it('handles template without placeholders', async () => {
      const template = 'Hello world';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Hello world');
    });

    it('handles empty variables object', async () => {
      const template = 'Hello {{name}}';
      const variables = {};
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Hello {{name}}');
    });
  });

  describe('XSS Protection', () => {
    it('sanitizes script tags', async () => {
      const template = 'Hello {{name}}';
      const variables = { name: '<script>alert("XSS")</script>John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert("XSS")');
      expect(result).toContain('John');
    });

    it('sanitizes HTML injection attempts', async () => {
      const template = 'Title: {{title}}';
      const variables = { title: '</p><script>alert("XSS")</script><p>Malicious Title' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert("XSS")');
      expect(result).toContain('Malicious Title');
    });

    it('sanitizes iframe tags', async () => {
      const template = 'Content: {{content}}';
      const variables = { content: '<iframe src="javascript:alert(\'XSS\')"></iframe>' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('javascript:');
    });

    it('sanitizes onclick attributes', async () => {
      const template = 'Link: {{link}}';
      const variables = { link: '<a href="#" onclick="alert(\'XSS\')">Click me</a>' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('onclick');
      expect(result).not.toContain("alert('XSS')");
    });

    it('sanitizes style attributes with javascript', async () => {
      const template = 'Styled: {{content}}';
      const variables = { content: '<div style="background:url(javascript:alert(\'XSS\'))">content</div>' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('javascript:');
    });

    it('handles multiple XSS attempts in different variables', async () => {
      const template = '{{greeting}} {{name}}! Event: {{event}}';
      const variables = {
        greeting: '<script>alert("hello")</script>Hello',
        name: '<img src=x onerror=alert("name")>John',
        event: '<iframe src="javascript:alert(\'event\')">Conference</iframe>',
      };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<img');
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onerror');
      expect(result).toContain('Hello');
      expect(result).toContain('John');
      expect(result).toContain('Conference');
    });
  });

  describe('Special characters', () => {
    it('preserves safe special characters', async () => {
      const template = 'Message: {{message}}';
      const variables = { message: 'Hello! How are you? 🎉 This costs $10.' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Message: Hello! How are you? 🎉 This costs $10.');
    });

    it('handles unicode characters', async () => {
      const template = '{{name}} says: {{message}}';
      const variables = { name: 'José', message: 'Café ☕ résumé naïve' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('José says: Café ☕ résumé naïve');
    });

    it('sanitizes comparison operators that could be HTML', async () => {
      const template = 'Code: {{code}}';
      const variables = { code: 'if (x < 5 && y > 3) { return "success"; }' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Code: if (x  3) { return &quot;success&quot;; }');
      expect(result).not.toContain('< 5');
      expect(result).not.toContain('> 3');
      expect(result).toContain('success');
    });
  });

  describe('Markdown formatting', () => {
    it('renders markdown with interpolated variables', async () => {
      const template =
        '# Welcome {{name}}!\n\nYour proposal **{{title}}** has been submitted.\n\n- Event: {{event}}\n- Status: Pending';
      const variables = { name: 'John', title: 'My Amazing Talk', event: 'DevConf 2024' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Welcome John!');
      expect(result).toContain('My Amazing Talk');
      expect(result).toContain('DevConf 2024');
      expect(result).toContain('Status: Pending');
    });

    it('sanitizes dangerous URLs in markdown links', async () => {
      const template = '[Click here]({{url}})';
      const variables = { url: 'javascript:alert("XSS")' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert("XSS")');
      expect(result).toContain('Click here');
      expect(result).toContain('href=""');
    });

    it('preserves safe URLs in markdown links', async () => {
      const template = '[Visit our site]({{url}})';
      const variables = { url: 'https://example.com' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Visit our site');
      expect(result).toContain('href="https://example.com"');
    });

    it('handles markdown bold with interpolated variables', async () => {
      const template = 'Hello **{{name}}**, welcome to *{{event}}*!';
      const variables = { name: 'John', event: 'DevConf' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('John');
      expect(result).toContain('DevConf');
    });
  });

  describe('Edge cases', () => {
    it('handles malformed placeholders', async () => {
      const template = '{{name} and {name}} and {{name';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('{{name} and {name}} and {{name');
    });

    it('handles nested curly braces', async () => {
      const template = '{{{name}}}';
      const variables = { name: 'John' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('{John}');
    });

    it('handles numeric variable names', async () => {
      const template = 'Item {{0}} and {{1}}';
      const variables = { '0': 'first', '1': 'second' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('Item first and second');
    });

    it('ignores variables with special characters in names', async () => {
      const template = '{{name-with-dash}} and {{name.with.dot}}';
      const variables = { 'name-with-dash': 'value1', 'name.with.dot': 'value2' };
      const result = await render(<EmailMarkdown variables={variables}>{template}</EmailMarkdown>);

      expect(result).toContain('{{name-with-dash}} and {{name.with.dot}}');
    });
  });
});
