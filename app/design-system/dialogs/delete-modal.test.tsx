import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { DeleteModalButton, type DeleteModalButtonProps } from './delete-modal.tsx';

describe('DeleteModal component', () => {
  const renderComponent = (props: DeleteModalButtonProps) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <DeleteModalButton {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('can delete only when confirmation text is typed', async () => {
    const screen = await renderComponent({
      title: 'Delete item',
      description: 'This is the description',
      intent: 'delete',
      confirmationText: 'confirm',
    });

    await userEvent.click(screen.getByRole('button', { name: 'Delete item' }));

    const dialog = screen.getByRole('dialog', { name: 'Delete item' });
    await expect.element(dialog.getByRole('button', { name: 'Delete item' })).toBeDisabled();

    const textbox = dialog.getByRole('textbox');
    await userEvent.fill(textbox, 'confirm');

    await expect.element(dialog.getByRole('button', { name: 'Delete item' })).toBeEnabled();
  });
});
