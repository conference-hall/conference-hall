import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { CategoriesSection } from './categories-section.tsx';

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

describe('CategoriesSection component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    proposalId: 'proposal-123',
    proposalCategories: [
      { id: '1', name: 'Web Development' },
      { id: '2', name: 'AI/ML' },
    ],
    eventCategories: [
      { id: '1', name: 'Web Development' },
      { id: '2', name: 'AI/ML' },
      { id: '3', name: 'Mobile Development' },
    ],
    multiple: true,
    canEditEventProposals: true,
    canEditEvent: true,
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
            <CategoriesSection {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub />);
  };

  it('displays current proposal categories', async () => {
    const screen = renderComponent();

    await expect.element(screen.getByText('Web Development')).toBeInTheDocument();
    await expect.element(screen.getByText('AI/ML')).toBeInTheDocument();
  });

  it('submits form data when categories are changed', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));
    await userEvent.click(screen.getByText('Mobile Development'));

    expect(mockFetcher.submit).toHaveBeenCalledWith(expect.any(FormData), { method: 'POST', preventScrollReset: true });

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('intent')).toBe('save-categories');
    expect(submittedFormData.getAll('categories')).toContain('1');
    expect(submittedFormData.getAll('categories')).toContain('2');
    expect(submittedFormData.getAll('categories')).toContain('3');
  });

  it('renders in readonly mode when canEditEventProposals is false', async () => {
    const screen = renderComponent({ canEditEventProposals: false });

    await expect.element(screen.getByText('Categories')).toBeInTheDocument();
    await expect.element(screen.getByText('Web Development')).toBeInTheDocument();

    await expect.element(screen.getByRole('button', { name: /Categories/ })).not.toBeInTheDocument();
  });

  it('hides action button when canEditEvent is false', async () => {
    const screen = renderComponent({ canEditEvent: false });

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));

    await expect.element(screen.getByText('Manage categories')).not.toBeInTheDocument();
  });

  it('shows action button when canEditEvent is true', async () => {
    const screen = renderComponent({ canEditEvent: true });

    await userEvent.click(screen.getByRole('button', { name: /Categories/ }));

    await expect.element(screen.getByText('Manage categories')).toBeInTheDocument();
  });
});
