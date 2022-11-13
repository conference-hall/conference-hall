import fs from 'node:fs';
import xss from 'xss';
import { marked } from 'marked';

export function buildTemplate(subject: string, template: string, variables: Record<string, string> = {}) {
  const base = fs.readFileSync(`./app/services/emails/template/email-base.html`);

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