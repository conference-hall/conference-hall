import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { CategoriesPanel } from './categories-panel.tsx';

describe('CategoriesPanel component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    options: [
      { value: 'web', label: 'Web Development' },
      { value: 'mobile', label: 'Mobile Development' },
      { value: 'ai', label: 'Artificial Intelligence' },
    ],
  };

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <CategoriesPanel {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays default selected categories', async () => {
    const selectedCategories = [
      { value: 'web', label: 'Web Development' },
      { value: 'ai', label: 'Artificial Intelligence' },
    ];

    const screen = renderComponent({ defaultValue: selectedCategories });

    await expect.element(screen.getByText('Web Development')).toBeInTheDocument();
    await expect.element(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
  });

  it('shows no categories message when none selected', async () => {
    const screen = renderComponent({ defaultValue: [] });

    await expect.element(screen.getByText('No categories')).toBeInTheDocument();
  });

  it('calls onChange when selecting categories', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));
    await userEvent.click(screen.getByText('Web Development'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'web', label: 'Web Development' }]);
  });

  it('handles both controlled and uncontrolled modes', async () => {
    const onChangeMock = vi.fn();
    const selectedCategories = [{ value: 'web', label: 'Web Development' }];

    const screen = renderComponent({
      value: selectedCategories,
      onChange: onChangeMock,
    });

    await expect.element(screen.getByText('Web Development')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));
    await userEvent.click(screen.getByText('Mobile Development'));

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'web', label: 'Web Development' },
      { value: 'mobile', label: 'Mobile Development' },
    ]);
  });

  it('displays error messages when provided', async () => {
    const error = ['At least one category is required'];
    const screen = renderComponent({ error });

    await expect.element(screen.getByText('At least one category is required')).toBeInTheDocument();
  });

  it('renders manage categories action when showAction is true', async () => {
    const screen = renderComponent({ showAction: true });

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));

    await expect.element(screen.getByText('Manage categories')).toBeInTheDocument();
  });

  it('does not render manage action when showAction is false', async () => {
    const screen = renderComponent({ showAction: false });

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));

    await expect.element(screen.getByText('Manage categories')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedCategories = [{ value: 'web', label: 'Web Development' }];
    const screen = renderComponent({
      readonly: true,
      defaultValue: selectedCategories,
    });

    await expect.element(screen.getByText('Categories')).toBeInTheDocument();
    await expect.element(screen.getByText('Web Development')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Categories/ })).not.toBeInTheDocument();
  });

  it('supports single selection mode', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({
      multiple: false,
      onChange: onChangeMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));
    await userEvent.click(screen.getByText('Web Development'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'web', label: 'Web Development' }]);

    await userEvent.click(screen.getByText('Mobile Development'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'mobile', label: 'Mobile Development' }]);
  });

  it('includes form name when provided', async () => {
    const screen = renderComponent({
      form: 'proposal-form',
      defaultValue: [{ value: 'web', label: 'Web Development' }],
    });

    const hiddenInput = screen.container.querySelector('input[name="categories"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });
});
