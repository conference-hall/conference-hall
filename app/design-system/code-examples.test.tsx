import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { type CodeExample, CodeExamples } from './code-examples.tsx';

describe('CodeExamples component', () => {
  const examples: Array<CodeExample> = [
    { id: 'curl', label: 'cURL', code: 'curl https://example.com/api' },
    { id: 'fetch', label: 'JavaScript', code: 'await fetch("https://example.com/api")' },
  ];

  const renderComponent = () => {
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <CodeExamples examples={examples} />
      </I18nextProvider>,
    );
  };

  beforeEach(() => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  });

  it('renders a tab per example and the first example code by default', async () => {
    await renderComponent();

    await expect.element(page.getByRole('button', { name: 'cURL' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'JavaScript' })).toBeInTheDocument();
    await expect.element(page.getByText('curl https://example.com/api')).toBeInTheDocument();
  });

  it('switches the displayed code when another tab is selected', async () => {
    await renderComponent();

    await page.getByRole('button', { name: 'JavaScript' }).click();

    await expect.element(page.getByText('await fetch("https://example.com/api")')).toBeInTheDocument();
    expect(page.getByText('curl https://example.com/api').query()).toBeNull();
  });
});
