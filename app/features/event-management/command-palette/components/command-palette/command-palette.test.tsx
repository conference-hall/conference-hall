import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { CommandPalette, type CommandPaletteItemData } from './command-palette.tsx';

// Mock use-debounce to avoid React context issues in tests
vi.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: any, _delay: number) => {
    // Return a function that calls the original function immediately for testing
    return vi.fn().mockImplementation(async (...args: any[]) => {
      await fn(...args);
    });
  },
}));

const MOCK_ITEMS: CommandPaletteItemData[] = [
  {
    section: 'Proposals',
    id: '1',
    title: 'React Performance Best Practices',
    description: 'John Doe',
    icon: MagnifyingGlassIcon,
  },
  {
    section: 'Proposals',
    id: '2',
    title: 'Vue.js Advanced Patterns',
    description: 'Jane Smith',
  },
  {
    section: 'Speakers',
    id: '3',
    title: 'Alice Johnson',
    description: 'Frontend Developer at Tech Corp',
    picture: '/avatar.jpg',
  },
];

describe('CommandPalette integration tests', () => {
  it('renders command palette with input and empty state', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={[]}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const searchInput = screen.getByRole('combobox');
    await expect.element(searchInput).toBeVisible();

    const emptyStateTitle = screen.getByText('Search');
    await expect.element(emptyStateTitle).toBeVisible();
  });

  it('displays items grouped by sections when provided', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={MOCK_ITEMS}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    // Check sections are displayed
    const proposalsSection = screen.getByText('Proposals');
    const speakersSection = screen.getByText('Speakers');
    await expect.element(proposalsSection).toBeVisible();
    await expect.element(speakersSection).toBeVisible();

    // Check items are displayed
    const proposal1 = screen.getByText('React Performance Best Practices');
    const proposal2 = screen.getByText('Vue.js Advanced Patterns');
    const speaker = screen.getByText('Alice Johnson');

    await expect.element(proposal1).toBeVisible();
    await expect.element(proposal2).toBeVisible();
    await expect.element(speaker).toBeVisible();
  });

  it('calls onSearch when user types in the input', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={[]}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const searchInput = screen.getByRole('combobox');
    await userEvent.type(searchInput, 'React');

    // onSearch should be called with debounce, wait for it
    await vi.waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('React');
    });
  });

  it('calls onClick and onClose when user selects an item', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={MOCK_ITEMS}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    // Type to set query
    const searchInput = screen.getByRole('combobox');
    await userEvent.type(searchInput, 'React');

    // Click on first proposal
    const proposal = screen.getByRole('option', { name: /React Performance Best Practices/ });
    await userEvent.click(proposal);

    expect(mockOnClick).toHaveBeenCalledWith(MOCK_ITEMS[0], 'React');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state when loading prop is true', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={[]}
          loading={true}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const loadingIcon = screen.getByLabelText('Loading');
    await expect.element(loadingIcon).toBeVisible();
  });

  it('shows typing loading state when user is typing', async () => {
    const mockOnSearch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={[]}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const searchInput = screen.getByRole('combobox');
    await userEvent.type(searchInput, 'R');

    // Should show loading while typing and waiting for debounced search
    const loadingIcon = screen.getByLabelText('Loading');
    await expect.element(loadingIcon).toBeVisible();
  });

  it('displays empty state with query when no results found', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={[]}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const searchInput = screen.getByRole('combobox');
    await userEvent.type(searchInput, 'NoResults');

    // Wait for search to complete
    await vi.waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('NoResults');
    });

    // Empty state should be visible with the query
    const emptyStateTitle = screen.getByText('Search');
    await expect.element(emptyStateTitle).toBeVisible();
  });

  it('displays close text when provided', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={[]}
          loading={false}
          closeText="Custom close"
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const closeText = screen.getByText('Custom close');
    await expect.element(closeText).toBeVisible();
  });

  it('handles keyboard navigation between items', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={MOCK_ITEMS}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    // Navigate down with arrow key
    await userEvent.keyboard('[ArrowDown]');

    // First item should be focused (HeadlessUI handles the focus automatically)
    const firstItem = screen.getByRole('option', { name: /React Performance Best Practices/ });
    await expect.element(firstItem).toHaveAttribute('data-focus');

    // Press Enter to select focused item
    await userEvent.keyboard('[Enter]');

    expect(mockOnClick).toHaveBeenCalledWith(MOCK_ITEMS[0], '');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears query and shows initial empty state', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);
    const mockOnClick = vi.fn();
    const mockOnClose = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <CommandPalette
          title="Search"
          description="Find proposals and speakers"
          items={MOCK_ITEMS}
          loading={false}
          onSearch={mockOnSearch}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </I18nextProvider>,
    );

    const searchInput = screen.getByRole('combobox');

    // Type something
    await userEvent.type(searchInput, 'React');
    await expect.element(searchInput).toHaveValue('React');

    // Clear the input
    await userEvent.clear(searchInput);
    await expect.element(searchInput).toHaveValue('');

    // Should call onSearch with empty string
    await vi.waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });
});
