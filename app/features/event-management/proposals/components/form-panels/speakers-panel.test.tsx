import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page, userEvent } from 'vitest/browser';
import { SpeakersPanel } from './speakers-panel.tsx';

// Mock useFetcher
const mockFetcher = {
  data: [
    {
      id: 'speaker1',
      label: 'John Doe',
      description: 'Senior Developer',
      picture: 'https://example.com/john.jpg',
    },
    {
      id: 'speaker2',
      label: 'Jane Smith',
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
    return page.render(<RouteStub />);
  };

  it('displays selected speakers', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];

    await renderComponent({ value: selectedSpeakers });

    await expect.element(page.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows no speakers message when none selected', async () => {
    await renderComponent({ value: [] });

    await expect.element(page.getByText('No speakers')).toBeInTheDocument();
  });

  it('calls onChange when selecting speakers', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({ onChange: onChangeMock, canChangeSpeakers: true });

    await userEvent.click(page.getByRole('button', { name: /Speakers/ }));
    await userEvent.click(page.getByText('John Doe'));

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
    await renderComponent({ error, canChangeSpeakers: true });

    await expect.element(page.getByText('At least one speaker is required')).toBeInTheDocument();
  });

  it('renders manage speakers action when canCreateSpeaker is true', async () => {
    await renderComponent({ canCreateSpeaker: true, canChangeSpeakers: true });

    await userEvent.click(page.getByRole('button', { name: /Speakers/ }));

    await expect.element(page.getByText('Create speaker')).toBeInTheDocument();
  });

  it('does not render manage action when canCreateSpeaker is false', async () => {
    await renderComponent({ canCreateSpeaker: false, canChangeSpeakers: true });

    await userEvent.click(page.getByRole('button', { name: /Speakers/ }));

    await expect.element(page.getByText('Create speaker')).not.toBeInTheDocument();
  });

  it('renders in readonly mode without select functionality', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];
    await renderComponent({
      canChangeSpeakers: false,
      value: selectedSpeakers,
    });

    await expect.element(page.getByText('Speakers')).toBeInTheDocument();
    await expect.element(page.getByText('John Doe')).toBeInTheDocument();

    await expect.element(page.getByRole('button', { name: /Speakers/ })).not.toBeInTheDocument();
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

    await renderComponent({
      value: selectedSpeakers,
      speakersDetails,
    });

    const speakerButton = page.getByRole('button', { name: /John Doe/ });
    expect(speakerButton).toBeInTheDocument();
  });

  it('includes form name when provided', async () => {
    const selectedSpeakers = [{ value: 'speaker1', label: 'John Doe', picture: 'https://example.com/john.jpg' }];
    await renderComponent({ form: 'proposal-form', value: selectedSpeakers, canChangeSpeakers: true });

    const hiddenInput = document.body.querySelector('input[name="speakers"][type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('form', 'proposal-form');
  });

  it('triggers search when typing in search input', async () => {
    vi.useFakeTimers();
    await renderComponent({ canChangeSpeakers: true });

    await userEvent.click(page.getByRole('button', { name: /Speakers/ }));

    const searchInput = page.getByPlaceholder('Search...');
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

    await renderComponent({ canChangeSpeakers: true });

    await userEvent.click(page.getByRole('button', { name: /Speakers/ }));

    const searchInput = page.getByPlaceholder('Search...');
    expect(searchInput).toBeInTheDocument();

    // Reset the mock state
    mockFetcher.state = 'idle';
  });

  it('handles multiple speaker selection', async () => {
    const onChangeMock = vi.fn();
    await renderComponent({ onChange: onChangeMock, canChangeSpeakers: true });

    await userEvent.click(page.getByRole('button', { name: /Speakers/ }));

    await userEvent.click(page.getByText('John Doe'));
    await userEvent.click(page.getByText('Jane Smith'));

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
