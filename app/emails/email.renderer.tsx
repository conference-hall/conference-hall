import { render } from '@react-email/components';

type EmailRendered = { html: string; text: string };

export async function renderEmail(
  name: string,
  data: Record<string, any>,
  locale: string,
): Promise<EmailRendered | null> {
  try {
    const EmailTemplate = await import(`./templates/${name}.tsx`).then((module) => module.default);

    const html = await render(<EmailTemplate locale={locale} {...data} />, { pretty: true });
    const text = await render(<EmailTemplate locale={locale} {...data} />, { plainText: true });

    return { html: html.replaceAll('http://www.w3.org', 'https://www.w3.org'), text };
  } catch (err) {
    console.error(`Error rendering email template "${name}"`, err);
    return null;
  }
}
