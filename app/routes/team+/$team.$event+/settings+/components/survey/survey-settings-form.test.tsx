import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { SurveySettingsForm, type SurveySettingsFormProps } from './survey-settings-form.tsx';

describe('SurveySettingsForm component', () => {
  const renderComponent = (config: SurveySettingsFormProps) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SurveySettingsForm {...config} />
          </I18nextProvider>
        ),
      },
    ]);
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
