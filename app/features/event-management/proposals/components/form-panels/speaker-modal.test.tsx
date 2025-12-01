import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { SpeakerModal } from './speaker-modal.tsx';

describe('SpeakerModal component', () => {
  const mockOnSpeakerCreated = vi.fn();

  const renderComponent = () => {
    const RouteStub = createRoutesStub([
      {
        path: '/team/:team/:event/proposals/new',
        action: vi.fn().mockResolvedValue({
          speaker: { id: '1', name: 'John Doe', email: 'john@example.com', picture: null, company: 'Test Company' },
        }),
        Component: () => null,
      },
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <SpeakerModal team="test-team" event="test-event" onSpeakerCreated={mockOnSpeakerCreated}>
              {({ onOpen }) => (
                <button type="button" onClick={onOpen}>
                  Open Modal
                </button>
              )}
            </SpeakerModal>
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub initialEntries={['/']} />);
  };

  beforeEach(() => {
    mockOnSpeakerCreated.mockClear();
  });

  it('renders the modal trigger button', async () => {
    await renderComponent();
    await expect.element(page.getByRole('button', { name: 'Open Modal' })).toBeInTheDocument();
  });

  it('opens and displays the modal when trigger is clicked', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: 'Open Modal' });
    await element.click();

    await expect.element(page.getByRole('button', { name: 'Create speaker' })).toBeInTheDocument();
    await expect.element(page.getByLabelText('Email')).toBeInTheDocument();
    await expect.element(page.getByLabelText('Full Name')).toBeInTheDocument();
    await expect.element(page.getByLabelText('Company')).toBeInTheDocument();
    await expect.element(page.getByLabelText('Biography')).toBeInTheDocument();
  });

  it('has required validation for email and name fields', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: 'Open Modal' });
    await element.click();

    const emailInput = page.getByLabelText('Email');
    const nameInput = page.getByLabelText('Full Name');

    await expect.element(emailInput).toBeRequired();
    await expect.element(nameInput).toBeRequired();
  });

  it('shows email type validation for email field', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: 'Open Modal' });
    await element.click();

    const emailInput = page.getByLabelText('Email');
    await expect.element(emailInput).toHaveAttribute('type', 'email');
  });
});
