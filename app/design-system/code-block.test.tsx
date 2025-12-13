import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import type { Mock } from 'vitest';
import { page } from 'vitest/browser';
import { CodeBlock } from './code-block.tsx';

describe('CodeBlock component', () => {
  const renderComponent = (code: string, label?: string) => {
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <CodeBlock code={code} label={label} />
      </I18nextProvider>,
    );
  };

  let writeTextSpy: Mock;

  beforeEach(() => {
    writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
  });

  it('renders the code content', async () => {
    await renderComponent('curl -H "X-API-Key: test-key" "https://example.com/api"');

    await expect.element(page.getByText('curl -H "X-API-Key: test-key" "https://example.com/api"')).toBeInTheDocument();
  });

  it('renders the label when provided', async () => {
    await renderComponent('echo "Hello World"', 'Example command');

    await expect.element(page.getByText('Example command')).toBeInTheDocument();
  });

  it('does not render label when not provided', async () => {
    await renderComponent('echo "Hello World"');

    expect(page.getByText('Example command').query()).toBeNull();
  });

  it('displays copy button with correct initial text', async () => {
    await renderComponent('test code');

    await expect.element(page.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('copies code to clipboard when copy button is clicked', async () => {
    const testCode = 'curl -X GET https://api.example.com';
    await renderComponent(testCode);

    const copyButton = page.getByRole('button', { name: 'Copy' });
    await copyButton.click();

    await expect.element(page.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(writeTextSpy).toHaveBeenCalledWith(testCode);
    expect(writeTextSpy).toHaveBeenCalledTimes(1);
  });
});
