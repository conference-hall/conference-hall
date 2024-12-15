import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createRoutesStub } from 'react-router';
import { SurveySettingsForm, type SurveySettingsFormProps } from './survey-settings-form.tsx';

describe('SurveySettingsForm component', () => {
  const renderComponent = (config: SurveySettingsFormProps) => {
    const RouteStub = createRoutesStub([{ path: '/', Component: () => <SurveySettingsForm {...config} /> }]);
    return render(<RouteStub />);
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

    renderComponent({ config });

    await userEvent.click(screen.getByRole('button', { name: 'Add question' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
