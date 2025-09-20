import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { SelectPanel, type SelectPanelProps } from './select-panel.tsx';

describe('SelectPanel component', () => {
  const onChangeMock = vi.fn();
  const options = [
    {
      value: 'option1',
      label: 'Option 1',
      color: '#FF0000',
      picture: 'https://example.com/user1.jpg',
      data: { role: 'admin', score: 100 },
    },
    {
      value: 'option2',
      label: 'Option 2',
      color: '#00FF00',
      picture: 'https://example.com/user2.jpg',
      data: { role: 'user', score: 80 },
    },
    { value: 'option3', label: 'Option 3', color: '#0000FF' },
    { value: 'option4', label: 'Another Option', color: '#FFFF00', picture: 'https://example.com/user4.jpg' },
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
              values={[]}
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

    const searchInput = screen.getByPlaceholder('Filter...');
    await userEvent.type(searchInput, 'another');

    await expect.element(screen.getByRole('option', { name: /Another Option/ })).toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 1/ })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 2/ })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('option', { name: /Option 3/ })).not.toBeInTheDocument();
  });

  it('shows "No results" message when no options match filter', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Filter...');
    await userEvent.type(searchInput, 'nonexistent');

    await expect.element(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('calls onChange when selecting options in multiple mode', async () => {
    const screen = renderComponent({ multiple: true, values: [] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    await userEvent.click(screen.getByText('Option 1'));
    expect(onChangeMock).toHaveBeenCalledWith([options[0]]);

    await userEvent.click(screen.getByText('Option 2'));
    expect(onChangeMock).toHaveBeenCalledWith([options[1]]);
  });

  it('shows selected options as checked in multiple mode', async () => {
    const screen = renderComponent({ multiple: true, values: [options[0].value, options[2].value] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const selectedOption1 = screen.getByRole('option', { name: /Option 1/ });
    const selectedOption3 = screen.getByRole('option', { name: /Option 3/ });

    expect(selectedOption1).toHaveAttribute('aria-selected', 'true');
    expect(selectedOption3).toHaveAttribute('aria-selected', 'true');
  });

  it('handles unselecting options in multiple mode', async () => {
    const screen = renderComponent({ multiple: true, values: [options[0].value, options[1].value] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));
    await userEvent.click(screen.getByText('Option 1'));

    expect(onChangeMock).toHaveBeenCalledWith([options[1]]);
  });

  it('calls onChange when selecting option in single mode', async () => {
    const screen = renderComponent({ multiple: false, values: [options[0].value] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));
    await userEvent.click(screen.getByText('Option 1'));

    expect(onChangeMock).toHaveBeenCalledWith([options[0]]);
  });

  it('shows selected item with radio button in single mode', async () => {
    const screen = renderComponent({ multiple: false, values: [options[0].value] });

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

  it('calls onSearch when provided', async () => {
    vi.useFakeTimers();
    const onSearchMock = vi.fn();
    const screen = renderComponent({ onSearch: onSearchMock });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder('Search...');
    await userEvent.type(searchInput, 'test query');

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
    const screen = renderComponent({ name: 'test-field', values: [options[0].value, options[1].value] });

    const hiddenInputs = screen.container.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs).toHaveLength(2);
    expect(hiddenInputs[0]).toHaveAttribute('name', 'test-field');
    expect(hiddenInputs[0]).toHaveAttribute('value', 'option1');
    expect(hiddenInputs[1]).toHaveAttribute('name', 'test-field');
    expect(hiddenInputs[1]).toHaveAttribute('value', 'option2');
  });

  it('displays pictures when displayPicture is true', async () => {
    const screen = renderComponent({ displayPicture: true });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    await expect.element(screen.getByRole('option', { name: /Option 1/ })).toBeInTheDocument();

    const allImages = document.querySelectorAll('img');
    expect(allImages.length).toBeGreaterThan(0);
  });

  it('does not display pictures when displayPicture is false or undefined', async () => {
    const screen = renderComponent({ displayPicture: false });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const avatars = screen.container.querySelectorAll(
      'img[src*="user1.jpg"], img[src*="user2.jpg"], img[src*="user4.jpg"]',
    );
    expect(avatars).toHaveLength(0);
  });

  it('accepts options with data attribute', () => {
    // Test that options with data attribute are accepted by TypeScript
    const optionsWithData = [
      { value: 'test1', label: 'Test 1', data: { category: 'A', priority: 1 } },
      { value: 'test2', label: 'Test 2', data: { category: 'B', priority: 2, nested: { key: 'value' } } },
      { value: 'test3', label: 'Test 3' }, // Without data attribute
    ];

    const screen = renderComponent({ options: optionsWithData });

    // Just verify the component renders without errors
    expect(screen.getByRole('button', { name: 'Open Select' })).toBeInTheDocument();
  });

  it('preserves data attribute in options throughout component lifecycle', async () => {
    const onChangeMockWithData = vi.fn();

    const optionsWithData = [
      { value: 'test1', label: 'Test 1', data: { category: 'A', priority: 1 } },
      { value: 'test2', label: 'Test 2', data: { category: 'B', priority: 2 } },
    ];

    const screen = renderComponent({
      options: optionsWithData,
      onChange: onChangeMockWithData,
      multiple: true,
      values: [],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));
    await userEvent.click(screen.getByText('Test 1'));

    // Verify onChange is called with the selected option objects (including data)
    expect(onChangeMockWithData).toHaveBeenCalledWith([optionsWithData[0]]);

    // The data attribute should be available in the options array passed to the component
    // This is a structural test to ensure the type system accepts the data attribute
    expect(optionsWithData[0].data).toEqual({ category: 'A', priority: 1 });
    expect(optionsWithData[1].data).toEqual({ category: 'B', priority: 2 });
  });

  it('supports various data types in data attribute', () => {
    // Test different data types that can be stored in the data attribute
    const complexOptions = [
      { value: 'obj', label: 'Object', data: { nested: { key: 'value' }, array: [1, 2, 3] } },
      { value: 'str', label: 'String', data: { description: 'Simple string value' } },
      { value: 'num', label: 'Number', data: { count: 42, percentage: 85.5 } },
      { value: 'bool', label: 'Boolean', data: { isActive: true, isVisible: false } },
      {
        value: 'mix',
        label: 'Mixed',
        data: { id: 123, name: 'Test', tags: ['a', 'b'], metadata: { created: new Date().toISOString() } },
      },
    ];

    const screen = renderComponent({ options: complexOptions });

    // Verify component renders with complex data structures
    expect(screen.getByRole('button', { name: 'Open Select' })).toBeInTheDocument();

    // Verify data is preserved exactly as provided
    expect(complexOptions[0].data).toEqual({ nested: { key: 'value' }, array: [1, 2, 3] });
    expect(complexOptions[3].data).toEqual({ isActive: true, isVisible: false });
  });

  it('uses custom placeholder when provided', async () => {
    const customPlaceholder = 'Type to search options...';
    const screen = renderComponent({ placeholder: customPlaceholder });

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    const searchInput = screen.getByPlaceholder(customPlaceholder);
    expect(searchInput).toBeInTheDocument();
  });

  it('uses default placeholder when custom placeholder is not provided', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Select' }));

    // Default placeholder should be the filter placeholder
    const searchInput = screen.getByPlaceholder('Filter...');
    expect(searchInput).toBeInTheDocument();
  });
});
