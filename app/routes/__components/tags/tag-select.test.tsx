// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TagSelect, type TagSelectorProps } from './tag-select.tsx';

describe('TagSelect component', () => {
  const onChangeMock = vi.fn();
  const tags = [
    { id: '1', name: 'Foo', color: '#FF0000' },
    { id: '2', name: 'Bar', color: '#00FF00' },
    { id: '3', name: 'Baz', color: '#0000FF' },
  ];

  const renderComponent = (props: Partial<TagSelectorProps> = {}) => {
    const user = userEvent.setup();
    const element = (
      <TagSelect tags={tags} defaultValues={[]} onChange={onChangeMock} canEditEventTags {...props}>
        Open Tags
      </TagSelect>
    );
    render(<RouterProvider router={createMemoryRouter([{ path: '/', element }])} />);
    return { user };
  };

  it('renders the component, opens the dropdown on button click, and sorts selected tags first', async () => {
    const { user } = renderComponent({ defaultValues: [tags[2]] });

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));

    expect(screen.getByText('Apply tags to this proposal')).toBeInTheDocument();

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['Baz', 'Foo', 'Bar']);
  });

  it('displays and filters tag options based on search input', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));

    const filterElement = await screen.findByPlaceholderText('Filter tags');
    await user.type(filterElement, 'Bar');

    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.queryByText('Foo')).not.toBeInTheDocument();
    expect(screen.queryByText('Baz')).not.toBeInTheDocument();
  });

  it('calls onChange with the selected tags when user close the select', async () => {
    const { user } = renderComponent({ defaultValues: [tags[0]] });

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));
    await user.click(screen.getByText('Foo'));
    await user.click(screen.getByText('Bar'));
    await user.click(screen.getByText('Baz'));

    expect(onChangeMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));

    expect(onChangeMock).toHaveBeenCalledWith([
      { id: '2', name: 'Bar', color: '#00FF00' },
      { id: '3', name: 'Baz', color: '#0000FF' },
    ]);
  });

  it('displays "Manage tags" link if canEditEventTags is true', async () => {
    const { user } = renderComponent({ canEditEventTags: true });

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));

    expect(screen.getByRole('link', { name: /Manage tags/i })).toHaveAttribute('href', '/settings/tags');
  });

  it('does not display "Manage tags" link if canEditEventTags is false', async () => {
    const { user } = renderComponent({ canEditEventTags: false });

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));

    expect(screen.queryByRole('link', { name: /Manage tags/i })).not.toBeInTheDocument();
  });

  it('resets filter when dropdown is closed', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));
    await user.type(screen.getByLabelText('Filter tags'), 'Baz');

    expect(screen.getByText('Baz')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));
    await user.click(screen.getByRole('button', { name: 'Open Tags' }));

    expect(screen.getByLabelText('Filter tags')).toHaveValue('');
  });

  it('shows "No tags found" message if no tags match filter', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'Open Tags' }));
    await user.type(screen.getByLabelText('Filter tags'), 'Non-existent tag');

    expect(screen.getByText('No tags found')).toBeInTheDocument();
  });
});
