import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { DeleteAccountSection } from './delete-account-section.tsx';

const renderComponent = () => {
  const RouteStub = createRoutesStub([
    {
      path: '/speaker/settings',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <DeleteAccountSection />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/speaker/settings']} />);
};

describe('DeleteAccountSection', () => {
  it('renders heading and delete button', async () => {
    await renderComponent();

    await expect.element(page.getByRole('heading', { name: 'Delete my account' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Delete my account' })).toBeVisible();
  });

  it('opens delete confirmation modal on button click', async () => {
    await renderComponent();

    await page.getByRole('button', { name: 'Delete my account' }).click();

    const dialog = page.getByRole('dialog', { name: 'Delete my account' });
    await expect
      .element(dialog.getByText('This action is permanent and cannot be undone.', { exact: false }))
      .toBeVisible();
  });

  it('disables submit until confirmation text matches', async () => {
    await renderComponent();

    await page.getByRole('button', { name: 'Delete my account' }).click();

    const dialog = page.getByRole('dialog', { name: 'Delete my account' });
    await expect.element(dialog.getByRole('button', { name: 'Delete my account' })).toBeDisabled();

    await dialog.getByRole('textbox').fill('delete my account');
    await expect.element(dialog.getByRole('button', { name: 'Delete my account' })).toBeEnabled();
  });
});
