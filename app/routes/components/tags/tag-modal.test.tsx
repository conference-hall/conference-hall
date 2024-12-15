import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';
import type { Tag } from '~/types/tags.types.ts';
import { TagModal } from './tag-modal.tsx';

describe('TagModal component', () => {
  const renderComponent = (mode: 'create' | 'edit', initialValues?: Tag) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <TagModal mode={mode} initialValues={initialValues}>
            {({ onOpen }) => (
              <button type="button" onClick={onOpen}>
                Open Modal
              </button>
            )}
          </TagModal>
        ),
      },
    ]);
    render(<RouteStub />);
  };

  it('renders the modal in create mode', async () => {
    renderComponent('create');

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    expect(screen.getByRole('button', { name: 'Create tag' })).toBeInTheDocument();
    expect(screen.getByText('Tag preview')).toBeInTheDocument();
  });

  it('renders the modal in edit mode', async () => {
    renderComponent('edit', { id: '1', name: 'Existing Tag', color: '#ff0000' });

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    expect(screen.getByRole('button', { name: 'Save tag' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Tag')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#ff0000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save tag' })).toBeInTheDocument();
  });

  it('disables the submit button when name is empty', async () => {
    renderComponent('create');

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));
    const submitButton = screen.getByRole('button', { name: 'Create tag' });
    expect(submitButton).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('Tag name'), 'Some Tag');
    expect(submitButton).not.toBeDisabled();
  });
});
