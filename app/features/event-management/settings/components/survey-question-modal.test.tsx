import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page, userEvent } from 'vitest/browser';
import type { SurveyQuestion } from '~/shared/types/survey.types.ts';
import { SurveyQuestionModal } from './survey-question-modal.tsx';

describe('SurveyQuestionModal component', () => {
  const renderComponent = (initialValues?: SurveyQuestion) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SurveyQuestionModal initialValues={initialValues}>
              {({ onOpen }) => (
                <button type="button" onClick={onOpen}>
                  Open Modal
                </button>
              )}
            </SurveyQuestionModal>
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub />);
  };

  it('renders the modal in create mode', async () => {
    await renderComponent();

    await userEvent.click(page.getByRole('button', { name: 'Open Modal' }));

    await expect.element(page.getByRole('button', { name: 'Add question' })).toBeInTheDocument();

    const questionInput = page.getByLabelText('Question', { exact: true });
    await expect.element(questionInput).toBeInTheDocument();
  });

  it('renders the modal in edit mode', async () => {
    await renderComponent({ id: '1', label: 'Existing Question', type: 'text', required: false });

    await userEvent.click(page.getByRole('button', { name: 'Open Modal' }));

    await expect.element(page.getByRole('button', { name: 'Save question' })).toBeInTheDocument();

    const questionInput = page.getByLabelText('Question', { exact: true });
    await expect.element(questionInput).toHaveValue('Existing Question');
  });

  it('adds a new option', async () => {
    await renderComponent({
      id: '1',
      label: 'Question with options',
      type: 'checkbox',
      required: false,
    });

    await userEvent.click(page.getByRole('button', { name: 'Open Modal' }));
    await userEvent.type(page.getByPlaceholder('New answer'), 'Option 1');
    await userEvent.click(page.getByRole('button', { name: 'Add answer' }));

    const optionInput = page.getByLabelText('Option 1', { exact: true });
    await expect.element(optionInput).toHaveValue('Option 1');
  });

  it('removes an existing option', async () => {
    await renderComponent({
      id: '1',
      label: 'Question with options',
      type: 'checkbox',
      required: false,
      options: [{ id: 'opt1', label: 'Option 1' }],
    });

    await userEvent.click(page.getByRole('button', { name: 'Open Modal' }));
    await expect.element(page.getByLabelText('Option 1', { exact: true })).toBeInTheDocument();

    await userEvent.click(page.getByRole('button', { name: 'Remove answer: Option 1' }));
    await expect.element(page.getByLabelText('Option 1', { exact: true })).not.toBeInTheDocument();
  });

  it('disables the submit button when no options are provided for checkbox or radio types', async () => {
    await renderComponent({
      id: '1',
      label: 'Question with options',
      type: 'checkbox',
      required: false,
    });

    await userEvent.click(page.getByRole('button', { name: 'Open Modal' }));
    const submitButton = page.getByRole('button', { name: 'Save question' });
    await expect.element(submitButton).toBeDisabled();

    await userEvent.type(page.getByPlaceholder('New answer'), 'Option 1');
    await userEvent.click(page.getByRole('button', { name: 'Add answer' }));
    await expect.element(submitButton).not.toBeDisabled();
  });
});
