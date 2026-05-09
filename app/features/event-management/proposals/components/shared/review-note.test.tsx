import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { ReviewNote } from './review-note.tsx';

describe('ReviewNote component', () => {
  const renderComponent = (props: Parameters<typeof ReviewNote>[0]) => {
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <ReviewNote {...props} />
      </I18nextProvider>,
    );
  };

  it('renders formatted note and icon for NEUTRAL feeling with note', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3 });

    await expect.element(page.getByText('3')).toBeInTheDocument();
  });

  it('renders formatted note for POSITIVE feeling', async () => {
    await renderComponent({ feeling: 'POSITIVE', note: 5 });

    await expect.element(page.getByText('5')).toBeInTheDocument();
  });

  it('renders formatted note for NEGATIVE feeling', async () => {
    await renderComponent({ feeling: 'NEGATIVE', note: 0 });

    await expect.element(page.getByText('0')).toBeInTheDocument();
  });

  it('renders for NO_OPINION feeling with null note', async () => {
    await renderComponent({ feeling: 'NO_OPINION', note: null });

    await expect.element(page.getByLabelText('No opinion')).toBeInTheDocument();
  });

  it('renders decimal note with one decimal place', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3.5 });

    await expect.element(page.getByText('3.5')).toBeInTheDocument();
  });

  it('hides content with invisible class when note is null and hideEmpty is true', async () => {
    await renderComponent({ feeling: 'NO_OPINION', note: null, hideEmpty: true });

    const element = page.getByLabelText('No opinion');
    await expect.element(element).toHaveClass('invisible');
  });

  it('shows content when note is present and hideEmpty is true', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3, hideEmpty: true });

    const element = page.getByText('3');
    await expect.element(element).toBeInTheDocument();
  });

  it('uses label in aria-label when provided', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3, label: 'Average' });

    await expect.element(page.getByLabelText('Average = 3')).toBeInTheDocument();
  });
});
