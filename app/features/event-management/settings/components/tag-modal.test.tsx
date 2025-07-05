import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import type { Tag } from '~/shared/types/tags.types.ts';
import { TagModal } from './tag-modal.tsx';

describe('TagModal component', () => {
  const renderComponent = (mode: 'create' | 'edit', initialValues?: Tag) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <TagModal mode={mode} initialValues={initialValues}>
              {({ onOpen }) => (
                <button type="button" onClick={onOpen}>
                  Open Modal
                </button>
              )}
            </TagModal>
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('renders the modal in create mode', async () => {
    const screen = renderComponent('create');

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    await expect.element(screen.getByRole('button', { name: 'Create tag' })).toBeInTheDocument();
    await expect.element(screen.getByText('Tag preview')).toBeInTheDocument();
  });

  it('renders the modal in edit mode', async () => {
    const screen = renderComponent('edit', { id: '1', name: 'Existing Tag', color: '#ff0000' });

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    const nameInput = screen.getByLabelText('Tag name');
    await expect.element(nameInput).toHaveValue('Existing Tag');

    const colorInput = screen.getByLabelText('Pick a color');
    await expect.element(colorInput).toHaveValue('#ff0000');

    await expect.element(screen.getByRole('button', { name: 'Save tag' })).toBeInTheDocument();
  });

  it('disables the submit button when name is empty', async () => {
    const screen = renderComponent('create');

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));
    const submitButton = screen.getByRole('button', { name: 'Create tag' });
    await expect.element(submitButton).toBeDisabled();

    await userEvent.type(screen.getByPlaceholder('Tag name'), 'Some Tag');
    await expect.element(submitButton).not.toBeDisabled();
  });
});
