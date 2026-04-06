import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import MultiSelect from './multi-select.tsx';

describe('MultiSelect component', () => {
  const options = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
  ];

  const renderComponent = () => {
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <MultiSelect
          name="languages"
          label="Languages"
          placeholder="Select languages"
          options={options}
          defaultValues={[]}
        />
      </I18nextProvider>,
    );
  };

  it('clears the search input after selecting an option', async () => {
    await renderComponent();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'fr');

    await expect.element(input).toHaveValue('fr');

    await page.getByRole('option', { name: /Français/i }).click();

    await expect.element(input).toHaveValue('');
    await expect.element(page.getByRole('listitem', { name: /Français/i })).toBeInTheDocument();
  });
});
