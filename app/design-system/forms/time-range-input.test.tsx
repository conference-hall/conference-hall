import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { TimeRangeInput } from './time-range-input.tsx';

describe('TimeRangeInput', () => {
  const renderInput = () =>
    page.render(
      <I18nextProvider i18n={i18nTest}>
        <TimeRangeInput start={9 * 60} end={18 * 60} step={60} onChange={() => {}} />
      </I18nextProvider>,
    );

  it('proposes end times strictly after the start time', async () => {
    await renderInput();

    const endSelect = page.getByRole('combobox', { name: 'To' });
    await expect.element(endSelect.getByRole('option', { name: '10:00' })).toBeInTheDocument();
    await expect.element(endSelect.getByRole('option', { name: '09:00' })).not.toBeInTheDocument();
  });

  it('proposes start times strictly before the end time', async () => {
    await renderInput();

    const startSelect = page.getByRole('combobox', { name: 'From' });
    await expect.element(startSelect.getByRole('option', { name: '17:00' })).toBeInTheDocument();
    await expect.element(startSelect.getByRole('option', { name: '18:00' })).not.toBeInTheDocument();
  });
});
