import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { FormatsSection } from './formats-section.tsx';

// Mock useFetcher
const mockFetcher = {
  formData: null as FormData | null,
  state: 'idle' as 'idle' | 'loading' | 'submitting',
  submit: vi.fn(),
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useFetcher: () => mockFetcher,
  };
});

describe('FormatsSection component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    proposalId: 'proposal-123',
    proposalFormats: [
      { id: '1', name: 'Lightning Talk (5min)' },
      { id: '2', name: 'Short Talk (20min)' },
    ],
    eventFormats: [
      { id: '1', name: 'Lightning Talk (5min)' },
      { id: '2', name: 'Short Talk (20min)' },
      { id: '3', name: 'Long Talk (45min)' },
    ],
    multiple: true,
    canChangeFormats: true,
    canCreateFormats: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.formData = null;
    mockFetcher.state = 'idle';
  });

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <FormatsSection {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays current proposal formats', async () => {
    const screen = renderComponent();

    await expect.element(screen.getByText('Lightning Talk (5min)')).toBeInTheDocument();
    await expect.element(screen.getByText('Short Talk (20min)')).toBeInTheDocument();
  });

  it('submits form data when formats are changed', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));
    await userEvent.click(screen.getByText('Long Talk (45min)'));

    expect(mockFetcher.submit).toHaveBeenCalledWith(expect.any(FormData), { method: 'POST', preventScrollReset: true });

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('intent')).toBe('save-formats');
    expect(submittedFormData.getAll('formats')).toContain('1');
    expect(submittedFormData.getAll('formats')).toContain('2');
    expect(submittedFormData.getAll('formats')).toContain('3');
  });

  it('renders in readonly mode when canChangeFormats is false', async () => {
    const screen = renderComponent({ canChangeFormats: false });

    await expect.element(screen.getByText('Formats')).toBeInTheDocument();
    await expect.element(screen.getByText('Lightning Talk (5min)')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Formats/ })).not.toBeInTheDocument();
  });

  it('hides action button when canCreateFormats is false', async () => {
    const screen = renderComponent({ canCreateFormats: false });

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));

    await expect.element(screen.getByText('Manage formats')).not.toBeInTheDocument();
  });

  it('shows action button when canCreateFormats is true', async () => {
    const screen = renderComponent({ canCreateFormats: true });

    await userEvent.click(screen.getByRole('button', { name: /Formats/ }));

    await expect.element(screen.getByText('Manage formats')).toBeInTheDocument();
  });
});
