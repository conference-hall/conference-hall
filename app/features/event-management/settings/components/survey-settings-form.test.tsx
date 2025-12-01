import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
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
    return page.render(<RouteStub initialEntries={['/']} />);
  };

  it('renders the survey settings form', async () => {
    const config = {
      legacy: false,
      enabled: true,
      questions: [],
    };

    await renderComponent({ config });

    await expect.element(page.getByRole('heading', { name: 'Speaker survey' })).toBeInTheDocument();
    await expect.element(page.getByText(/Speaker survey activation/)).toBeInTheDocument();
  });

  it('adds a new question', async () => {
    const config = {
      legacy: false,
      enabled: true,
      questions: [],
    };

    await renderComponent({ config });

    const element = page.getByRole('button', { name: 'Add question' });
    await element.click();

    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
  });
});
