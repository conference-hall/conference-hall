import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
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
    return page.render(<RouteStub />);
  };

  it('displays default selected categories', async () => {
    const selectedCategories = [
      { value: 'web', label: 'Web Development' },
      { value: 'ai', label: 'Artificial Intelligence' },
    ];

    await renderComponent({ defaultValue: selectedCategories });

    await expect.element(page.getByText('Web Development')).toBeInTheDocument();
    await expect.element(page.getByText('Artificial Intelligence')).toBeInTheDocument();
  });

  it('shows no categories message when none selected', async () => {
    await renderComponent({ defaultValue: [] });

    await expect.element(page.getByText('No categories')).toBeInTheDocument();
  });

  it('calls onChange when selecting categories', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({ onChange: onChangeMock });

    const element = page.getByRole('button', { name: /Categories/ });
    await element.click();
    const element1 = page.getByText('Web Development');
    await element1.click();

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'web', label: 'Web Development' }]);
  });

  it('handles both controlled and uncontrolled modes', async () => {
    const onChangeMock = vi.fn();
    const selectedCategories = [{ value: 'web', label: 'Web Development' }];

    await renderComponent({
      value: selectedCategories,
      onChange: onChangeMock,
    });

    await expect.element(page.getByText('Web Development')).toBeInTheDocument();

    const element = page.getByRole('button', { name: /Categories/ });
    await element.click();
    const element1 = page.getByText('Mobile Development');
    await element1.click();

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'web', label: 'Web Development' },
      { value: 'mobile', label: 'Mobile Development' },
    ]);
  });

  it('displays error messages when provided', async () => {
    const error = ['At least one category is required'];
    await renderComponent({ error });

    await expect.element(page.getByText('At least one category is required')).toBeInTheDocument();
  });

  it('renders manage categories action when showAction is true', async () => {
    await renderComponent({ showAction: true });

    const element = page.getByRole('button', { name: /Categories/ });
    await element.click();

    await expect.element(page.getByText('Manage categories')).toBeInTheDocument();
  });

  it('does not render manage action when showAction is false', async () => {
    await renderComponent({ showAction: false });

    const element = page.getByRole('button', { name: /Categories/ });
    await element.click();

    await expect.element(page.getByText('Manage categories')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedCategories = [{ value: 'web', label: 'Web Development' }];
    await renderComponent({
      readonly: true,
      defaultValue: selectedCategories,
    });

    await expect.element(page.getByText('Categories')).toBeInTheDocument();
    await expect.element(page.getByText('Web Development')).toBeInTheDocument();

    await expect.element(page.getByRole('button', { name: /Categories/ })).not.toBeInTheDocument();
  });

  it('supports single selection mode', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({
      multiple: false,
      onChange: onChangeMock,
    });

    const element = page.getByRole('button', { name: /Categories/ });
    await element.click();
    const element1 = page.getByText('Web Development');
    await element1.click();

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'web', label: 'Web Development' }]);

    const element2 = page.getByText('Mobile Development');
    await element2.click();

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'mobile', label: 'Mobile Development' }]);
  });

  it('includes form name when provided', async () => {
    await renderComponent({
      form: 'proposal-form',
      defaultValue: [{ value: 'web', label: 'Web Development' }],
    });

    const hiddenInput = document.body.querySelector('input[name="categories"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });
});
