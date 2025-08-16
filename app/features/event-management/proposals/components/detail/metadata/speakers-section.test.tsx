import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { SpeakersSection } from './speakers-section.tsx';

// Mock useFetcher
const mockFetcher = {
  formData: null as FormData | null,
  state: 'idle' as 'idle' | 'loading' | 'submitting',
  submit: vi.fn(),
};

// Mock the autocomplete useFetcher from SpeakersPanel
const mockAutocompleteFetcher = {
  data: [
    {
      id: 'speaker3',
      title: 'Alice Johnson',
      description: 'UX Designer',
      picture: 'https://example.com/alice.jpg',
    },
  ],
  state: 'idle',
  load: vi.fn(),
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useFetcher: ({ key }: { key?: string } = {}) => {
      if (key?.startsWith('save-speakers:')) {
        return mockFetcher;
      }
      return mockAutocompleteFetcher;
    },
  };
});

describe('SpeakersSection component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    proposalId: 'proposal-123',
    proposalSpeakers: [
      {
        id: 'speaker1',
        name: 'John Doe',
        picture: 'https://example.com/john.jpg',
        company: 'Tech Corp',
        bio: null,
        email: 'john@example.com',
        location: 'San Francisco',
        socials: {},
        socialLinks: [],
        references: '',
      },
      {
        id: 'speaker2',
        name: 'Jane Smith',
        picture: 'https://example.com/jane.jpg',
        company: 'Design Inc',
        bio: null,
        email: 'jane@example.com',
        location: 'New York',
        socials: {},
        socialLinks: [],
        references: '',
      },
    ],
    canEditEventProposals: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.formData = null;
    mockFetcher.state = 'idle';
    mockAutocompleteFetcher.state = 'idle';
  });

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SpeakersSection {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays current proposal speakers', async () => {
    const screen = renderComponent();

    await expect.element(screen.getByText('John Doe')).toBeInTheDocument();
    await expect.element(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('submits form data when speakers are changed', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));
    await userEvent.click(screen.getByText('Alice Johnson'));

    expect(mockFetcher.submit).toHaveBeenCalledWith(expect.any(FormData), { method: 'POST', preventScrollReset: true });

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('intent')).toBe('save-speakers');
    expect(submittedFormData.getAll('speakers')).toContain('speaker1');
    expect(submittedFormData.getAll('speakers')).toContain('speaker2');
    expect(submittedFormData.getAll('speakers')).toContain('speaker3');
  });

  it('renders in readonly mode when canEditEventProposals is false', async () => {
    const screen = renderComponent({ canEditEventProposals: false });

    await expect.element(screen.getByText('Speakers')).toBeInTheDocument();
    await expect.element(screen.getByText('John Doe')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Speakers/ })).not.toBeInTheDocument();
  });

  it('does not show action button (manage speakers)', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Speakers/ }));

    await expect.element(screen.getByText('Create speaker')).not.toBeInTheDocument();
  });
});
