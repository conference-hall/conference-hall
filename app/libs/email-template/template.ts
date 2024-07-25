import { MarkdownParser } from '../markdown/markdown-parser.ts';
import { HTML_TEMPLATE } from './template.html.ts';

export class Template<T extends Record<string, string>> {
  constructor(
    private template: {
      subject: string;
      content: string;
      variables: T;
    },
  ) {}

  renderSubject() {
    let subject = this.template.subject;
    for (const [key, value] of Object.entries(this.template.variables)) {
      subject = subject.replaceAll(`%${key}%`, value.toString());
    }
    return subject;
  }

  renderHtmlContent() {
    let content = this.template.content;
    for (const [key, value] of Object.entries(this.template.variables)) {
      content = content.replaceAll(`%${key}%`, value.toString());
    }

    const html = MarkdownParser.parse(content);

    return HTML_TEMPLATE.replace('{{subject}}', this.renderSubject()).replace('{{content}}', html);
  }
}
