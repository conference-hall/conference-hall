import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { TalkForm } from './talk-form.tsx';

const formats = [
  { id: 'format-1', name: 'Lightning Talk', description: '5 minutes presentation' },
  { id: 'format-2', name: 'Full Talk', description: '30 minutes presentation' },
];

const categories = [
  { id: 'cat-1', name: 'Frontend', description: 'Frontend technologies' },
  { id: 'cat-2', name: 'Backend', description: 'Backend technologies' },
];

const renderComponent = (props = {}) => {
  const defaultProps = { id: 'test-form', errors: {}, ...props };

  const RouteStub = createRoutesStub([
    {
      path: '/',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <TalkForm {...defaultProps} />
        </I18nextProvider>
      ),
      action: vi.fn(),
    },
  ]);
  return page.render(<RouteStub />);
};

describe('TalkForm', () => {
  it('renders all form fields', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText(/title/i)).toBeInTheDocument();
    await expect.element(page.getByLabelText(/abstract/i)).toBeInTheDocument();
    await expect.element(page.getByRole('group', { name: /level/i })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: /beginner/i })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: /intermediate/i })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: /advanced/i })).toBeInTheDocument();
    await expect.element(page.getByLabelText(/languages/i)).toBeInTheDocument();
    await expect.element(page.getByLabelText(/references/i)).toBeInTheDocument();
  });

  it('renders formats section when formats provided', async () => {
    await renderComponent({ formats: formats, formatsRequired: true });

    await expect.element(page.getByRole('group', { name: /format/i })).toBeInTheDocument();
    await expect.element(page.getByText('Lightning Talk')).toBeInTheDocument();
    await expect.element(page.getByText('Full Talk')).toBeInTheDocument();
  });

  it('renders categories section when categories provided', async () => {
    await renderComponent({ categories: categories, categoriesRequired: true });

    await expect.element(page.getByRole('group', { name: /categories/i })).toBeInTheDocument();
    await expect.element(page.getByLabelText('Frontend')).toBeInTheDocument();
    await expect.element(page.getByLabelText('Backend')).toBeInTheDocument();
  });

  it('displays initial values correctly', async () => {
    const initialValues = {
      title: 'Test Talk Title',
      abstract: 'Test abstract content',
      references: 'Test references',
      languages: ['en'],
      level: 'INTERMEDIATE',
      formats: [{ id: 'format-1' }],
      categories: [{ id: 'cat-1' }],
    };

    await renderComponent({ initialValues, formats: formats, categories: categories });

    const titleInput = page.getByLabelText(/title/i);
    const abstractTextarea = page.getByLabelText(/abstract/i);
    const referencesTextarea = page.getByLabelText(/references/i);

    await expect.element(titleInput).toHaveValue('Test Talk Title');
    await expect.element(abstractTextarea).toHaveValue('Test abstract content');
    await expect.element(referencesTextarea).toHaveValue('Test references');
    await expect.element(page.getByRole('radio', { name: /intermediate/i })).toBeChecked();
  });

  it('displays validation errors', async () => {
    const errors = {
      title: 'Title is required',
      abstract: 'Abstract is required',
      formats: 'Format selection is required',
      categories: 'Category selection is required',
    };

    await renderComponent({
      errors,
      formats: formats,
      categories: categories,
      formatsRequired: true,
      categoriesRequired: true,
    });

    await expect.element(page.getByText('Title is required')).toBeInTheDocument();
    await expect.element(page.getByText('Abstract is required')).toBeInTheDocument();
    await expect.element(page.getByText(/format.*required/i)).toBeInTheDocument();
    await expect.element(page.getByText(/categor.*required/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    await renderComponent({ onSubmit });

    const form = document.body.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });

    form?.dispatchEvent(submitEvent);
    expect(onSubmit).toHaveBeenCalled();
  });
});
