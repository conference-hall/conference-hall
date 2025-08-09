import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { SelectPanel } from './select-panel.tsx';

type SelectPanelProps = {
  name?: string;
  label: string;
  options: Array<{ value: string; label: string; color?: string }>;
  defaultValue: string | Array<string>;
  multiple?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  form?: string;
  loading?: boolean;
  onSearch?: (query: string) => void | Promise<void>;
  onChange?: (values: string | Array<string>) => void;
  className?: string;
};

describe('SelectPanel component', () => {
  const onChangeMock = vi.fn();
  const options = [
    { value: 'option1', label: 'Option 1', color: '#FF0000' },
    { value: 'option2', label: 'Option 2', color: '#00FF00' },
    { value: 'option3', label: 'Option 3', color: '#0000FF' },
    { value: 'option4', label: 'Another Option', color: '#FFFF00' },
  ];

  const renderComponent = (props: Partial<SelectPanelProps> = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SelectPanel
              name="test-select"
              label="Test Select"
              options={options}
              defaultValue={[]}
              onChange={onChangeMock}
              {...props}
            >
              Open Select
            </SelectPanel>
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('renders the component and opens the dropdown on button click', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    await expect.element(screen.getByRole('option', { name: /Option 1/ })).toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 2/ })).toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 3/ })).toBeInTheDocument();
  });

  it('filters options case-insensitively', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Search...');
    await userEvent.type(searchInput, 'another');

    await expect.element(screen.getByRole('option', { name: /Another Option/ })).toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 1/ })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 2/ })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 3/ })).not.toBeInTheDocument();
  });

  it('shows "No results" message when no options match filter', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Search...');
    await userEvent.type(searchInput, 'nonexistent');

    await expect.element(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('calls onChange when selecting options in multiple mode', async () => {
    const screen = renderComponent({ multiple: true, defaultValue: [] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const checkboxes = screen.getByRole('checkbox').all();
    expect(checkboxes).toHaveLength(4);

    await userEvent.click(screen.getByText('Option 1'));
    expect(onChangeMock).toHaveBeenCalledWith(['option1']);

    await userEvent.click(screen.getByText('Option 2'));
    expect(onChangeMock).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('shows selected options as checked in multiple mode', async () => {
    const screen = renderComponent({ multiple: true, defaultValue: ['option1', 'option3'] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const selectedOption1 = screen.getByRole('option', { name: /Option 1/ });
    const selectedOption3 = screen.getByRole('option', { name: /Option 3/ });

    expect(selectedOption1).toHaveAttribute('aria-selected', 'true');
    expect(selectedOption3).toHaveAttribute('aria-selected', 'true');
  });

  it('handles unselecting options in multiple mode', async () => {
    const screen = renderComponent({ multiple: true, defaultValue: ['option1', 'option2'] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));
    await userEvent.click(screen.getByText('Option 1'));

    expect(onChangeMock).toHaveBeenCalledWith(['option2']);
  });

  it('calls onChange when selecting option in single mode', async () => {
    const screen = renderComponent({ multiple: false, defaultValue: '' });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));
    await userEvent.click(screen.getByText('Option 1'));

    expect(onChangeMock).toHaveBeenCalledWith('option1');
  });

  it('checks selected item in single mode', async () => {
    const screen = renderComponent({ multiple: false, defaultValue: 'option1' });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const selectedOption = screen.getByRole('option', { name: /Option 1/ });
    expect(selectedOption).toHaveAttribute('aria-selected', 'true');
  });

  it('renders footer when provided', async () => {
    const footer = <div>Custom Footer</div>;
    const screen = renderComponent({ footer });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    await expect.element(screen.getByText('Custom Footer')).toBeInTheDocument();
  });

  it('focuses search input when panel opens', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Search...');
    expect(searchInput).toHaveFocus();
  });

  it('calls onSearch when provided', async () => {
    vi.useFakeTimers();
    const onSearchMock = vi.fn();
    const screen = renderComponent({ onSearch: onSearchMock });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Search...');
    await userEvent.type(searchInput, 'test query');

    // Fast-forward debounced timer
    vi.advanceTimersByTime(300);

    expect(onSearchMock).toHaveBeenCalledWith('test query');
    vi.useRealTimers();
  });

  it('debounces onSearch calls', async () => {
    vi.useFakeTimers();
    const onSearchMock = vi.fn();
    const screen = renderComponent({ onSearch: onSearchMock });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Search...');

    // Type multiple characters quickly
    await userEvent.type(searchInput, 'a');
    await userEvent.type(searchInput, 'b');
    await userEvent.type(searchInput, 'c');

    // Should not call onSearch yet
    expect(onSearchMock).not.toHaveBeenCalled();

    // Fast-forward less than the debounce time
    vi.advanceTimersByTime(200);
    expect(onSearchMock).not.toHaveBeenCalled();

    // Fast-forward past the debounce time
    vi.advanceTimersByTime(100);
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('abc');

    vi.useRealTimers();
  });

  it('creates hidden form inputs when name is provided', async () => {
    const screen = renderComponent({ name: 'test-field', defaultValue: ['option1', 'option2'] });

    const hiddenInputs = screen.container.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs).toHaveLength(2);
    expect(hiddenInputs[0]).toHaveAttribute('name', 'test-field');
    expect(hiddenInputs[0]).toHaveAttribute('value', 'option1');
    expect(hiddenInputs[1]).toHaveAttribute('name', 'test-field');
    expect(hiddenInputs[1]).toHaveAttribute('value', 'option2');
  });

  it('does not create hidden inputs when no name is provided', async () => {
    const screen = renderComponent({ name: undefined, defaultValue: ['option1', 'option2'] });

    const hiddenInputs = screen.container.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs).toHaveLength(0);
  });

  it('associates hidden inputs with form when form prop is provided', async () => {
    const screen = renderComponent({ name: 'test-field', form: 'my-form', defaultValue: ['option1'] });

    const hiddenInput = screen.container.querySelector('input[type="hidden"]');
    expect(hiddenInput).toHaveAttribute('form', 'my-form');
  });
});
