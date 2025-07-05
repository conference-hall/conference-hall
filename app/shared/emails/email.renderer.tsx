import { render } from '@react-email/components';
import { type EmailTemplateName, getEmailTemplate } from './templates/templates.ts';

export async function renderEmail(
  name: EmailTemplateName,
  data: Record<string, any>,
  locale: string,
  customization: Record<string, any> | null,
): Promise<{ html: string; text: string } | null> {
  try {
    const EmailTemplate = await getEmailTemplate(name);
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
