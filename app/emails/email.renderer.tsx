import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@react-email/components';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templateCache: Record<string, any> = {};

export function getEmailTemplateComponent(templateName: string) {
  try {
    if (templateCache[templateName]) {
      return Promise.resolve(templateCache[templateName]);
    }

    const templatePath = join(__dirname, `templates/${templateName}.tsx`);
    return import(/* @vite-ignore */ templatePath).then((module) => {
      const template = module.default;
      templateCache[templateName] = template;
      return template;
    });
  } catch (error) {
    console.error(`Failed to load email template "${templateName}":`, error);
    return null;
  }
}

export async function renderEmail(
  name: string,
  data: Record<string, any>,
  locale: string,
  customization: Record<string, any> | null,
): Promise<{ html: string; text: string } | null> {
  try {
    const EmailTemplate = await getEmailTemplateComponent(name);
    if (!EmailTemplate) {
      throw new Error(`Email template "${name}" cannot be loaded.`);
    }

    const html = await render(<EmailTemplate locale={locale} {...data} customization={customization} />);
    const text = await render(<EmailTemplate locale={locale} {...data} customization={customization} />, {
      plainText: true,
    });

    return { html: html.replaceAll('http://www.w3.org', 'https://www.w3.org'), text };
  } catch (err) {
    console.error(`Error rendering email template "${name}"`, err);
    return null;
  }
}
