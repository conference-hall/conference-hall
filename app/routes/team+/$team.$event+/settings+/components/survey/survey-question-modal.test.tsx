// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import type { SurveyQuestion } from '~/.server/event-survey/types.ts';
import { SurveyQuestionModal } from './survey-question-modal.tsx';

describe('SurveyQuestionModal component', () => {
  const renderComponent = (initialValues?: SurveyQuestion) => {
    const user = userEvent.setup();

    const element = (
      <SurveyQuestionModal initialValues={initialValues}>
        {({ onOpen }) => (
          <button type="button" onClick={onOpen}>
            Open Modal
          </button>
        )}
      </SurveyQuestionModal>
    );

    const router = createMemoryRouter([{ path: '/', element }]);
    render(<RouterProvider router={router} />);

    return { user };
  };

  it('renders the modal in create mode', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));

    expect(screen.getByRole('button', { name: 'Add question' })).toBeInTheDocument();
    expect(screen.getByLabelText('Question')).toBeInTheDocument();
  });

  it('renders the modal in edit mode', async () => {
    const { user } = renderComponent({ id: '1', label: 'Existing Question', type: 'text', required: false });

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));

    expect(screen.getByRole('button', { name: 'Save question' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Question')).toBeInTheDocument();
  });

  it('adds a new option', async () => {
    const { user } = renderComponent({ id: '1', label: 'Question with options', type: 'checkbox', required: false });

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    await user.type(screen.getByPlaceholderText('New answer'), 'Option 1');
    await user.click(screen.getByRole('button', { name: 'Add answer' }));

    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
  });

  it('removes an existing option', async () => {
    const { user } = renderComponent({
      id: '1',
      label: 'Question with options',
      type: 'checkbox',
      required: false,
      options: [{ id: 'opt1', label: 'Option 1' }],
    });

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(screen.queryByDisplayValue('Option 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove answer: Option 1' }));
    expect(screen.queryByDisplayValue('Option 1')).not.toBeInTheDocument();
  });

  it('disables the submit button when no options are provided for checkbox or radio types', async () => {
    const { user } = renderComponent({ id: '1', label: 'Question with options', type: 'checkbox', required: false });

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));
    const submitButton = screen.getByRole('button', { name: 'Save question' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('New answer'), 'Option 1');
    await user.click(screen.getByRole('button', { name: 'Add answer' }));
    expect(submitButton).not.toBeDisabled();
  });
});
