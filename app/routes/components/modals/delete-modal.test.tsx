import { userEvent } from '@vitest/browser/context';
import { createRoutesStub } from 'react-router';
import { render } from 'vitest-browser-react';
import { DeleteModalButton, type DeleteModalButtonProps } from './delete-modal.tsx';

describe('DeleteModal component', () => {
  const renderComponent = (props: DeleteModalButtonProps) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => <DeleteModalButton {...props} />,
      },
    ]);
    return render(<RouteStub />);
  };

  it('can delete only when confirmation text is typed', async () => {
    const screen = renderComponent({
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
