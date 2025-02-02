import { userEvent } from '@vitest/browser/context';
import { createRoutesStub } from 'react-router';
import { render } from 'vitest-browser-react';
import { SurveySettingsForm, type SurveySettingsFormProps } from './survey-settings-form.tsx';

describe('SurveySettingsForm component', () => {
  const renderComponent = (config: SurveySettingsFormProps) => {
    const RouteStub = createRoutesStub([{ path: '/', Component: () => <SurveySettingsForm {...config} /> }]);
    return render(<RouteStub initialEntries={['/']} />);
  };

  it('renders the survey settings form', async () => {
    const config = {
      legacy: false,
      enabled: true,
      questions: [],
    };

    const screen = renderComponent({ config });

    await expect.element(screen.getByRole('heading', { name: 'Speaker survey' })).toBeInTheDocument();
    await expect.element(screen.getByText(/New/)).toBeInTheDocument();
    await expect.element(screen.getByText(/Speaker survey activation/)).toBeInTheDocument();
  });

  it('adds a new question', async () => {
    const config = {
      legacy: false,
      enabled: true,
      questions: [],
    };

    const screen = renderComponent({ config });

    await userEvent.click(screen.getByRole('button', { name: 'Add question' }));

    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
