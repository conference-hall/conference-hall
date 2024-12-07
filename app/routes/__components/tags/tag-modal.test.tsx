// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import type { Tag } from '~/types/tags.types.ts';
import { TagModal } from './tag-modal.tsx';

describe('TagModal component', () => {
  const renderComponent = (mode: 'create' | 'edit', initialValues?: Tag) => {
    const user = userEvent.setup();

    const element = (
      <TagModal mode={mode} initialValues={initialValues}>
        {({ onOpen }) => (
          <button type="button" onClick={onOpen}>
            Open Modal
          </button>
        )}
      </TagModal>
    );

    const router = createMemoryRouter([{ path: '/', element }]);
    render(<RouterProvider router={router} />);

    return { user };
  };

  it('renders the modal in create mode', async () => {
    const { user } = renderComponent('create');

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));

    expect(screen.getByRole('button', { name: 'Create tag' })).toBeInTheDocument();
    expect(screen.getByText('Tag preview')).toBeInTheDocument();
  });

  it('renders the modal in edit mode', async () => {
    const { user } = renderComponent('edit', { id: '1', name: 'Existing Tag', color: '#ff0000' });

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));

    expect(screen.getByRole('button', { name: 'Save tag' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Tag')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#ff0000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save tag' })).toBeInTheDocument();
  });

  it('disables the submit button when name is empty', async () => {
    const { user } = renderComponent('create');

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    const submitButton = screen.getByRole('button', { name: 'Create tag' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Tag name'), 'Some Tag');
    expect(submitButton).not.toBeDisabled();
  });
});
