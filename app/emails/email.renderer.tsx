import { render } from '@react-email/components';

export async function renderEmail(name: string, data: Record<string, any>): Promise<string | null> {
  try {
    const EmailTemplate = await import(`./templates/${name}.tsx`).then((module) => module.default);

    const html = await render(<EmailTemplate {...data} />, { pretty: true });

    return html.replaceAll('http://www.w3.org', 'https://www.w3.org');
  } catch (err) {
    console.error(`Error rendering email template "${name}"`, err);
    return null;
  }
}
