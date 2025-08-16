import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { TagsPanel } from './tags-panel.tsx';

describe('TagsPanel component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    options: [
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'backend', label: 'Backend', color: '#10B981' },
      { value: 'beginner', label: 'Beginner', color: '#F59E0B' },
    ],
  };

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <TagsPanel {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays default selected tags', async () => {
    const selectedTags = [
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'beginner', label: 'Beginner', color: '#F59E0B' },
    ];

    const screen = renderComponent({ defaultValue: selectedTags });

    await expect.element(screen.getByText('Frontend')).toBeInTheDocument();
    await expect.element(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('shows no tags message when none selected', async () => {
    const screen = renderComponent({ defaultValue: [] });

    await expect.element(screen.getByText('No tags')).toBeInTheDocument();
  });

  it('calls onChange when selecting tags', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
    await userEvent.click(screen.getByText('Frontend'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }]);
  });

  it('handles both controlled and uncontrolled modes', async () => {
    const onChangeMock = vi.fn();
    const selectedTags = [{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }];

    const screen = renderComponent({
      value: selectedTags,
      onChange: onChangeMock,
    });

    await expect.element(screen.getByText('Frontend')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
    await userEvent.click(screen.getByText('Backend'));

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'backend', label: 'Backend', color: '#10B981' },
    ]);
  });

  it('renders manage tags action when showAction is true', async () => {
    const screen = renderComponent({ showAction: true });

    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));

    await expect.element(screen.getByText('Manage tags')).toBeInTheDocument();
  });

  it('does not render manage action when showAction is false', async () => {
    const screen = renderComponent({ showAction: false });

    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));

    await expect.element(screen.getByText('Manage tags')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedTags = [{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }];
    const screen = renderComponent({
      readonly: true,
      defaultValue: selectedTags,
    });

    await expect.element(screen.getByText('Tags')).toBeInTheDocument();
    await expect.element(screen.getByText('Frontend')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Tags/ })).not.toBeInTheDocument();
  });

  it('includes form name when provided', async () => {
    const screen = renderComponent({
      form: 'proposal-form',
      defaultValue: [{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }],
    });

    const hiddenInput = screen.container.querySelector('input[name="tags"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });

  it('supports multiple tag selection by default', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
    await userEvent.click(screen.getByText('Frontend'));
    await userEvent.click(screen.getByText('Backend'));

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'backend', label: 'Backend', color: '#10B981' },
    ]);
  });

  it('preserves tag color information in selection', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
    await userEvent.click(screen.getByText('Beginner'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'beginner', label: 'Beginner', color: '#F59E0B' }]);
  });
});
