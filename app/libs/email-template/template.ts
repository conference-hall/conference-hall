import { marked } from 'marked';
import xss from 'xss';

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
    let markdown = marked.parse(this.template.content, { async: false }) as string;
    for (const [key, value] of Object.entries(this.template.variables)) {
      markdown = markdown.replaceAll(`%${key}%`, value.toString());
    }
    return HTML_TEMPLATE.replace('{{subject}}', this.renderSubject()).replace('{{content}}', xss(markdown));
  }
}
