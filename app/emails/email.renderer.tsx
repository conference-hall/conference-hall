import { render } from '@react-email/components';

export async function renderEmail(name: string, data: Record<string, any>): Promise<string | null> {
  try {
    const EmailTemplate = await import(`./templates/${name}.tsx`).then((module) => module.default);

    return render(<EmailTemplate {...data} />, { pretty: true });
  } catch (err) {
    console.error(`Error rendering email template "${name}"`, err);
    return null;
  }
}
