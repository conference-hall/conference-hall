import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { ExternalLink } from './links.tsx';

describe('ExternalLink component', () => {
  const renderComponent = (untrusted: boolean) =>
    page.render(
      <I18nextProvider i18n={i18nTest}>
        <ExternalLink href="https://unknown.example.com/deck" untrusted={untrusted}>
          Slides
        </ExternalLink>
      </I18nextProvider>,
    );

  it('renders a direct link when the link is trusted', async () => {
    await renderComponent(false);

    const link = page.getByRole('link', { name: 'Slides' });
    await expect.element(link).toHaveAttribute('href', 'https://unknown.example.com/deck');
    await expect.element(link).toHaveAttribute('target', '_blank');

    expect(page.getByRole('dialog').elements()).toHaveLength(0);
  });

  it('asks for a confirmation when the link is untrusted', async () => {
    await renderComponent(true);

    await page.getByRole('link', { name: 'Slides' }).click();

    const dialog = page.getByRole('dialog', { name: 'Open an external link' });
    await expect.element(dialog.getByText('https://unknown.example.com/deck')).toBeVisible();
    await expect
      .element(dialog.getByRole('link', { name: 'Open the link' }))
      .toHaveAttribute('href', 'https://unknown.example.com/deck');
  });

  it('asks for a confirmation on ctrl/cmd+click too', async () => {
    await renderComponent(true);

    await userEvent.click(page.getByRole('link', { name: 'Slides' }).element(), { modifiers: ['Meta'] });

    const dialog = page.getByRole('dialog', { name: 'Open an external link' });
    await expect.element(dialog.getByText('https://unknown.example.com/deck')).toBeVisible();
  });

  it('asks for a confirmation on middle click too', async () => {
    await renderComponent(true);

    await userEvent.click(page.getByRole('link', { name: 'Slides' }).element(), { button: 'middle' });

    const dialog = page.getByRole('dialog', { name: 'Open an external link' });
    await expect.element(dialog.getByText('https://unknown.example.com/deck')).toBeVisible();
  });

  it('closes the confirmation without opening the link', async () => {
    await renderComponent(true);

    await page.getByRole('link', { name: 'Slides' }).click();

    const dialog = page.getByRole('dialog', { name: 'Open an external link' });
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect.element(dialog).not.toBeInTheDocument();
  });
});
