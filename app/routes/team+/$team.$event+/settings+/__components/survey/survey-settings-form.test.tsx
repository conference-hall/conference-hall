// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { SurveySettingsForm, type SurveySettingsFormProps } from './survey-settings-form.tsx';

describe('SurveySettingsForm component', () => {
  const renderComponent = (config: SurveySettingsFormProps) => {
    const user = userEvent.setup();

    const element = <SurveySettingsForm {...config} />;

    const router = createMemoryRouter([{ path: '/', element }]);
    render(<RouterProvider router={router} />);

    return { user };
  };

  it('renders the survey settings form', () => {
    const config = {
      legacy: false,
      enabled: true,
      questions: [],
    };

    renderComponent({ config });

    expect(screen.getByText('Speaker survey')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Speaker survey activation')).toBeInTheDocument();
  });

  it('adds a new question', async () => {
    const config = {
      legacy: false,
      enabled: true,
      questions: [],
    };

    const { user } = renderComponent({ config });

    await user.click(screen.getByRole('button', { name: 'Add question' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
