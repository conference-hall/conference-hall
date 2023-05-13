import fs from 'node:fs';

import { marked } from 'marked';
import xss from 'xss';

marked.use({ mangle: false, headerIds: false });

export function buildTemplate(subject: string, template: string, variables: Record<string, string> = {}) {
  const base = fs.readFileSync(`./app/libs/emails/template/email-base.html`);

  let md = template.toString();
  Object.entries(variables).forEach(([key, value]) => {
    md = md.replaceAll(`%${key}%`, value);
  });

  let html = base
    .toString()
    .replace('{{subject}}', subject)
    .replace('{{content}}', xss(marked.parse(md)));

  return html;
}
