import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
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
    return page.render(<RouteStub />);
  };

  it('displays default selected tags', async () => {
    const selectedTags = [
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'beginner', label: 'Beginner', color: '#F59E0B' },
    ];

    await renderComponent({ defaultValue: selectedTags });

    await expect.element(page.getByText('Frontend')).toBeInTheDocument();
    await expect.element(page.getByText('Beginner')).toBeInTheDocument();
  });

  it('shows no tags message when none selected', async () => {
    await renderComponent({ defaultValue: [] });

    await expect.element(page.getByText('No tags')).toBeInTheDocument();
  });

  it('calls onChange when selecting tags', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({ onChange: onChangeMock });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();
    const element1 = page.getByText('Frontend');
    await element1.click();

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }]);
  });

  it('handles both controlled and uncontrolled modes', async () => {
    const onChangeMock = vi.fn();
    const selectedTags = [{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }];

    await renderComponent({
      value: selectedTags,
      onChange: onChangeMock,
    });

    await expect.element(page.getByText('Frontend')).toBeInTheDocument();

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();
    const element1 = page.getByText('Backend');
    await element1.click();

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'backend', label: 'Backend', color: '#10B981' },
    ]);
  });

  it('renders manage tags action when showAction is true', async () => {
    await renderComponent({ showAction: true });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();

    await expect.element(page.getByText('Manage tags')).toBeInTheDocument();
  });

  it('does not render manage action when showAction is false', async () => {
    await renderComponent({ showAction: false });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();

    await expect.element(page.getByText('Manage tags')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedTags = [{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }];
    await renderComponent({
      readonly: true,
      defaultValue: selectedTags,
    });

    await expect.element(page.getByText('Tags')).toBeInTheDocument();
    await expect.element(page.getByText('Frontend')).toBeInTheDocument();

    await expect.element(page.getByRole('button', { name: /Tags/ })).not.toBeInTheDocument();
  });

  it('includes form name when provided', async () => {
    await renderComponent({
      form: 'proposal-form',
      defaultValue: [{ value: 'frontend', label: 'Frontend', color: '#3B82F6' }],
    });

    const hiddenInput = document.body.querySelector('input[name="tags"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });

  it('supports multiple tag selection by default', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({ onChange: onChangeMock });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();
    const element1 = page.getByText('Frontend');
    await element1.click();
    const element2 = page.getByText('Backend');
    await element2.click();

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'frontend', label: 'Frontend', color: '#3B82F6' },
      { value: 'backend', label: 'Backend', color: '#10B981' },
    ]);
  });

  it('preserves tag color information in selection', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({ onChange: onChangeMock });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();
    const element1 = page.getByText('Beginner');
    await element1.click();

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'beginner', label: 'Beginner', color: '#F59E0B' }]);
  });
});
