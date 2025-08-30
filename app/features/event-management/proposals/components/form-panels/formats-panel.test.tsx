import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { FormatsPanel } from './formats-panel.tsx';

describe('FormatsPanel component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    options: [
      { value: 'lightning', label: 'Lightning Talk (5min)' },
      { value: 'short', label: 'Short Talk (20min)' },
      { value: 'long', label: 'Long Talk (45min)' },
    ],
  };

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <FormatsPanel {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays default selected formats', async () => {
    const selectedFormats = [
      { value: 'lightning', label: 'Lightning Talk (5min)' },
      { value: 'short', label: 'Short Talk (20min)' },
    ];

    const screen = renderComponent({ defaultValue: selectedFormats });

    await expect.element(screen.getByText('Lightning Talk (5min)')).toBeInTheDocument();
    await expect.element(screen.getByText('Short Talk (20min)')).toBeInTheDocument();
  });

  it('shows no formats message when none selected', async () => {
    const screen = renderComponent({ defaultValue: [] });

    await expect.element(screen.getByText('No formats')).toBeInTheDocument();
  });

  it('calls onChange when selecting formats', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));
    await userEvent.click(screen.getByText('Lightning Talk (5min)'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'lightning', label: 'Lightning Talk (5min)' }]);
  });

  it('handles both controlled and uncontrolled modes', async () => {
    const onChangeMock = vi.fn();
    const selectedFormats = [{ value: 'lightning', label: 'Lightning Talk (5min)' }];

    const screen = renderComponent({
      value: selectedFormats,
      onChange: onChangeMock,
    });

    await expect.element(screen.getByText('Lightning Talk (5min)')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));
    await userEvent.click(screen.getByText('Short Talk (20min)'));

    expect(onChangeMock).toHaveBeenCalledWith([
      { value: 'lightning', label: 'Lightning Talk (5min)' },
      { value: 'short', label: 'Short Talk (20min)' },
    ]);
  });

  it('displays error messages when provided', async () => {
    const error = ['Please select at least one format'];
    const screen = renderComponent({ error });

    await expect.element(screen.getByText('Please select at least one format')).toBeInTheDocument();
  });

  it('renders manage formats action when showAction is true', async () => {
    const screen = renderComponent({ showAction: true });

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));

    await expect.element(screen.getByText('Manage formats')).toBeInTheDocument();
  });

  it('does not render manage action when showAction is false', async () => {
    const screen = renderComponent({ showAction: false });

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));

    await expect.element(screen.getByText('Manage formats')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedFormats = [{ value: 'lightning', label: 'Lightning Talk (5min)' }];
    const screen = renderComponent({
      readonly: true,
      defaultValue: selectedFormats,
    });

    await expect.element(screen.getByText('Formats')).toBeInTheDocument();
    await expect.element(screen.getByText('Lightning Talk (5min)')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Formats/ })).not.toBeInTheDocument();
  });

  it('supports single selection mode', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({
      multiple: false,
      onChange: onChangeMock,
    });

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));
    await userEvent.click(screen.getByText('Lightning Talk (5min)'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'lightning', label: 'Lightning Talk (5min)' }]);

    await userEvent.click(screen.getByText('Short Talk (20min)'));

    expect(onChangeMock).toHaveBeenCalledWith([{ value: 'short', label: 'Short Talk (20min)' }]);
  });

  it('includes form name when provided', async () => {
    const screen = renderComponent({
      form: 'proposal-form',
      defaultValue: [{ value: 'lightning', label: 'Lightning Talk (5min)' }],
    });

    const hiddenInput = screen.container.querySelector('input[name="formats"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });
});
