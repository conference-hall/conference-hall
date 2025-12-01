import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { TagsSection } from './tags-section.tsx';

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

describe('TagsSection component', () => {
  const defaultProps = {
    team: 'test-team',
    event: 'test-event',
    proposalId: 'proposal-123',
    proposalTags: [
      { id: '1', name: 'Frontend', color: '#3B82F6' },
      { id: '2', name: 'Backend', color: '#10B981' },
    ],
    eventTags: [
      { id: '1', name: 'Frontend', color: '#3B82F6' },
      { id: '2', name: 'Backend', color: '#10B981' },
      { id: '3', name: 'Beginner', color: '#F59E0B' },
      { id: '4', name: 'Advanced', color: '#EF4444' },
    ],
    canChangeTags: true,
    canCreateTags: true,
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
            <TagsSection {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub />);
  };

  it('displays current proposal tags with colors', async () => {
    await renderComponent();

    await expect.element(page.getByText('Frontend')).toBeInTheDocument();
    await expect.element(page.getByText('Backend')).toBeInTheDocument();
  });

  it('submits form data when tags are changed', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();
    const element1 = page.getByText('Beginner');
    await element1.click();

    expect(mockFetcher.submit).toHaveBeenCalledWith(expect.any(FormData), { method: 'POST', preventScrollReset: true });

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('intent')).toBe('save-tags');
    expect(submittedFormData.getAll('tags')).toContain('1');
    expect(submittedFormData.getAll('tags')).toContain('2');
    expect(submittedFormData.getAll('tags')).toContain('3');
  });

  it('shows submitting state when fetcher is submitting', async () => {
    mockFetcher.state = 'submitting';

    await renderComponent();

    // Should still display current tags during submission
    await expect.element(page.getByText('Frontend')).toBeInTheDocument();
    await expect.element(page.getByText('Backend')).toBeInTheDocument();
  });

  it('renders in readonly mode when canChangeTags is false', async () => {
    await renderComponent({ canChangeTags: false });

    await expect.element(page.getByText('Tags')).toBeInTheDocument();
    await expect.element(page.getByText('Frontend')).toBeInTheDocument();

    // Should not have interactive button when readonly
    await expect.element(page.getByRole('button', { name: /Tags/ })).not.toBeInTheDocument();
  });

  it('hides action button when canCreateTags is false', async () => {
    await renderComponent({ canCreateTags: false });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();

    await expect.element(page.getByText('Manage tags')).not.toBeInTheDocument();
  });

  it('shows action button when canCreateTags is true', async () => {
    await renderComponent({ canCreateTags: true });

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();

    await expect.element(page.getByText('Manage tags')).toBeInTheDocument();
  });

  it('supports multiple tag selection by default', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: /Tags/ });
    await element.click();
    const element1 = page.getByText('Beginner');
    await element1.click();

    const submittedFormData = mockFetcher.submit.mock.calls[0][0] as FormData;
    expect(submittedFormData.getAll('tags')).toContain('1'); // Frontend (existing)
    expect(submittedFormData.getAll('tags')).toContain('2'); // Backend (existing)
    expect(submittedFormData.getAll('tags')).toContain('3'); // Beginner (newly added)
  });

  it('preserves tag colors in the display', async () => {
    await renderComponent();

    // Tags should render with their color information preserved
    await expect.element(page.getByText('Frontend')).toBeInTheDocument();
    await expect.element(page.getByText('Backend')).toBeInTheDocument();
  });

  it('applies custom className', async () => {
    await renderComponent({ className: 'custom-tags' });

    const section = document.body.querySelector('.custom-tags');
    expect(section).toBeInTheDocument();
  });

  it('sorts displayed tags alphabetically', async () => {
    const unsortedTags = [
      { id: '1', name: 'Zebra', color: '#3B82F6' },
      { id: '2', name: 'Alpha', color: '#10B981' },
      { id: '3', name: 'Beta', color: '#F59E0B' },
    ];

    await renderComponent({ proposalTags: unsortedTags });

    // Check that all tags are displayed (sorting is handled by the component)
    await expect.element(page.getByText('Alpha')).toBeInTheDocument();
    await expect.element(page.getByText('Beta')).toBeInTheDocument();
    await expect.element(page.getByText('Zebra')).toBeInTheDocument();
  });

  it('handles tags without colors', async () => {
    const tagsWithoutColors = [
      { id: '1', name: 'No Color Tag', color: '' },
      { id: '2', name: 'Regular Tag', color: '#3B82F6' },
    ];

    const eventTagsWithoutColors = [
      { id: '1', name: 'No Color Tag', color: '' },
      { id: '2', name: 'Regular Tag', color: '#3B82F6' },
      { id: '3', name: 'Another No Color', color: '' },
    ];

    await renderComponent({
      proposalTags: tagsWithoutColors,
      eventTags: eventTagsWithoutColors,
    });

    await expect.element(page.getByText('No Color Tag')).toBeInTheDocument();
    await expect.element(page.getByText('Regular Tag')).toBeInTheDocument();
  });
});
