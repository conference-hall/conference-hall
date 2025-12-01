import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
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
    return page.render(<RouteStub />);
  };

  it('displays current proposal formats', async () => {
    await renderComponent();

    await expect.element(page.getByText('Lightning Talk (5min)')).toBeInTheDocument();
    await expect.element(page.getByText('Short Talk (20min)')).toBeInTheDocument();
  });

  it('submits form data when formats are changed', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: /Formats/ });
    await element.click();
    const element1 = page.getByText('Long Talk (45min)');
    await element1.click();

    expect(mockFetcher.submit).toHaveBeenCalledWith(expect.any(FormData), { method: 'POST', preventScrollReset: true });

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('intent')).toBe('save-formats');
    expect(submittedFormData.getAll('formats')).toContain('1');
    expect(submittedFormData.getAll('formats')).toContain('2');
    expect(submittedFormData.getAll('formats')).toContain('3');
  });

  it('renders in readonly mode when canChangeFormats is false', async () => {
    await renderComponent({ canChangeFormats: false });

    await expect.element(page.getByText('Formats')).toBeInTheDocument();
    await expect.element(page.getByText('Lightning Talk (5min)')).toBeInTheDocument();

    await expect.element(page.getByRole('button', { name: /Formats/ })).not.toBeInTheDocument();
  });

  it('hides action button when canCreateFormats is false', async () => {
    await renderComponent({ canCreateFormats: false });

    const element = page.getByRole('button', { name: /Formats/ });
    await element.click();

    await expect.element(page.getByText('Manage formats')).not.toBeInTheDocument();
  });

  it('shows action button when canCreateFormats is true', async () => {
    await renderComponent({ canCreateFormats: true });

    const element = page.getByRole('button', { name: /Formats/ });
    await element.click();

    await expect.element(page.getByText('Manage formats')).toBeInTheDocument();
  });
});
