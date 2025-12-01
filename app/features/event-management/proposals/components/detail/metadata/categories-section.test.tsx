import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
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
    canChangeCategory: true,
    canCreateCategory: true,
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
            <CategoriesSection {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub />);
  };

  it('displays current proposal categories', async () => {
    await renderComponent();

    await expect.element(page.getByText('Web Development')).toBeInTheDocument();
    await expect.element(page.getByText('AI/ML')).toBeInTheDocument();
  });

  it('submits form data when categories are changed', async () => {
    await renderComponent();

    const button = page.getByRole('button', { name: /Categories/ });
    await button.click();
    const option = page.getByText('Mobile Development');
    await option.click();

    expect(mockFetcher.submit).toHaveBeenCalledWith(expect.any(FormData), { method: 'POST', preventScrollReset: true });

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('intent')).toBe('save-categories');
    expect(submittedFormData.getAll('categories')).toContain('1');
    expect(submittedFormData.getAll('categories')).toContain('2');
    expect(submittedFormData.getAll('categories')).toContain('3');
  });

  it('renders in readonly mode when canChangeCategory is false', async () => {
    await renderComponent({ canChangeCategory: false });

    await expect.element(page.getByText('Categories')).toBeInTheDocument();
    await expect.element(page.getByText('Web Development')).toBeInTheDocument();

    await expect.element(page.getByRole('button', { name: /Categories/ })).not.toBeInTheDocument();
  });

  it('hides action button when canCreateCategory is false', async () => {
    await renderComponent({ canCreateCategory: false });

    const button = page.getByRole('button', { name: /Categories/ });
    await button.click();

    await expect.element(page.getByText('Manage categories')).not.toBeInTheDocument();
  });

  it('shows action button when canCreateCategory is true', async () => {
    await renderComponent({ canCreateCategory: true });

    const button = page.getByRole('button', { name: /Categories/ });
    await button.click();

    await expect.element(page.getByText('Manage categories')).toBeInTheDocument();
  });
});
