import { marked } from 'marked';
import xss from 'xss';

import { type EmailVariables } from '../provider';
import { HTML_TEMPLATE } from './template.html';

export class Template {
  constructor(
    private subject: string,
    private content: string,
  ) {}

  renderSubject<T extends EmailVariables>(variables: T) {
    let subject = this.subject;
    for (const [key, value] of Object.entries(variables)) {
      subject = subject.replaceAll(`%${key}%`, value.toString());
    }
    return subject;
  }

  renderHtmlContent<T extends EmailVariables>(variables: T) {
    let markdown = xss(marked.parse(this.content));
    for (const [key, value] of Object.entries(variables)) {
      markdown = markdown.replaceAll(`%${key}%`, value.toString());
    }
    return HTML_TEMPLATE.replace('{{subject}}', this.renderSubject(variables)).replace('{{content}}', markdown);
  }
}
