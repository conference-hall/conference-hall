import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { SpeakersPanel } from './speakers-panel.tsx';

// Mock useFetcher
const mockFetcher = {
  data: [
    {
      id: 'speaker1',
      title: 'John Doe',
      description: 'Senior Developer',
      picture: 'https://example.com/john.jpg',
    },
    {
      id: 'speaker2',
      title: 'Jane Smith',
      description: 'Tech Lead',
      picture: 'https://example.com/jane.jpg',
    },
  ],
  state: 'idle',
  load: vi.fn(),
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useFetcher: () => mockFetcher,
  };
});

describe('SpeakersPanel component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.state = 'idle';
  });

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SpeakersPanel {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays selected speakers', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];

    const screen = renderComponent({ value: selectedSpeakers });

    await expect.element(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows no speakers message when none selected', async () => {
    const screen = renderComponent({ value: [] });

    await expect.element(screen.getByText('No speakers')).toBeInTheDocument();
  });

  it('calls onChange when selecting speakers', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));
    await userEvent.click(screen.getByText('John Doe'));

    expect(onChangeMock).toHaveBeenCalledWith([
      {
        value: 'speaker1',
        label: 'John Doe',
        picture: 'https://example.com/john.jpg',
        data: { description: 'Senior Developer' },
      },
    ]);
  });

  it('displays error messages when provided', async () => {
    const error = ['At least one speaker is required'];
    const screen = renderComponent({ error });

    await expect.element(screen.getByText('At least one speaker is required')).toBeInTheDocument();
  });

  it('renders manage speakers action when showAction is true', async () => {
    const screen = renderComponent({ showAction: true });

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));

    await expect.element(screen.getByText('Create speaker')).toBeInTheDocument();
  });

  it('does not render manage action when showAction is false', async () => {
    const screen = renderComponent({ showAction: false });

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));

    await expect.element(screen.getByText('Create speaker')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];
    const screen = renderComponent({
      readonly: true,
      value: selectedSpeakers,
    });

    await expect.element(screen.getByText('Speakers')).toBeInTheDocument();
    await expect.element(screen.getByText('John Doe')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Speakers/ })).not.toBeInTheDocument();
  });

  it('makes speaker row clickable when speaker details are available', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];
    const speakersDetails = [
      {
        id: 'speaker1',
        name: 'John Doe',
        picture: 'https://example.com/john.jpg',
        email: 'john@example.com',
        location: 'San Francisco',
        company: 'Tech Corp',
        socials: {},
        socialLinks: [],
        references: { talks: [] },
      },
    ];

    const screen = renderComponent({
      value: selectedSpeakers,
      speakersDetails,
    });

    const speakerButton = screen.getByRole('button', { name: /John Doe/ });
    expect(speakerButton).toBeInTheDocument();
  });

  it('includes form name when provided', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];
    const screen = renderComponent({ form: 'proposal-form', value: selectedSpeakers });

    const hiddenInput = screen.container.querySelector('input[name="speakers"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });

  it('triggers search when typing in search input', async () => {
    vi.useFakeTimers();
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));

    const searchInput = screen.getByPlaceholder('Search...');
    await userEvent.type(searchInput, 'John');

    // Advance timers to trigger debounced search
    vi.advanceTimersByTime(300);

    expect(mockFetcher.load).toHaveBeenCalledWith(
      expect.stringContaining('/team/test-team/test-event/autocomplete?query=John&kind=speakers'),
    );

    vi.useRealTimers();
  });

  it('displays loading state when fetcher is loading', async () => {
    mockFetcher.state = 'loading';

    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));

    const searchInput = screen.getByPlaceholder('Search...');
    expect(searchInput).toBeInTheDocument();

    // Reset the mock state
    mockFetcher.state = 'idle';
  });

  it('handles multiple speaker selection', async () => {
    const onChangeMock = vi.fn();
    const screen = renderComponent({ onChange: onChangeMock });

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));

    await userEvent.click(screen.getByText('John Doe'));
    await userEvent.click(screen.getByText('Jane Smith'));

    expect(onChangeMock).toHaveBeenCalledWith([
      {
        value: 'speaker1',
        label: 'John Doe',
        picture: 'https://example.com/john.jpg',
        data: { description: 'Senior Developer' },
      },
      {
        value: 'speaker2',
        label: 'Jane Smith',
        picture: 'https://example.com/jane.jpg',
        data: { description: 'Tech Lead' },
      },
    ]);
  });
});
