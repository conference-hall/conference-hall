import fs from 'node:fs';

import { marked } from 'marked';
import xss from 'xss';

export function buildTemplate(subject: string, template: string, variables: Record<string, string> = {}) {
  const base = fs.readFileSync(`./app/libs/emails/template/email-base.html`);

  let md = template.toString();
  Object.entries(variables).forEach(([key, value]) => {
    md = md.replaceAll(`%${key}%`, value);
  });

  const markdown = marked.parse(md, { async: false }) as string;

  let html = base.toString().replace('{{subject}}', subject).replace('{{content}}', xss(markdown));

  return html;
}
