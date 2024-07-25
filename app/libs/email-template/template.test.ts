import { Template } from './template.ts';

type TemplateVars = { foo: string; bar: string };

describe('#Template', () => {
  describe('#renderSubject', () => {
    it('renders the subject with variables', () => {
      const template = new Template<TemplateVars>({
        subject: 'Hello World %foo%',
        content: 'Content',
        variables: { foo: 'foofoo', bar: 'barbar' },
      });

      expect(template.renderSubject()).toBe('Hello World foofoo');
    });
  });

  describe('#renderHtmlContent', () => {
    it('renders the html with parsed markdown content and set variables', () => {
      const template = new Template<TemplateVars>({
        subject: 'Hello World %foo%',
        content: '# Hi %foo%,\n**Are you ok %bar%?**',
        variables: { foo: 'foofoo', bar: 'barbar' },
      });

      const html = template.renderHtmlContent();
      expect(html).toContain('<title>Hello World foofoo</title>');
      expect(html).toContain('<h1>Hi foofoo,</h1>');
      expect(html).toContain('<p><strong>Are you ok barbar?</strong></p>');
    });
  });
});
