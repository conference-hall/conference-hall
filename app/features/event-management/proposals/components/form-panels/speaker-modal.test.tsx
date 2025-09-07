import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { SpeakerModal } from './speaker-modal.tsx';

describe('SpeakerModal component', () => {
  const mockOnSpeakerCreated = vi.fn();

  const renderComponent = () => {
    const RouteStub = createRoutesStub([
      {
        path: '/team/:team/:event/reviews/new',
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
    return render(<RouteStub initialEntries={['/']} />);
  };

  beforeEach(() => {
    mockOnSpeakerCreated.mockClear();
  });

  it('renders the modal trigger button', async () => {
    const screen = renderComponent();
    await expect.element(screen.getByRole('button', { name: 'Open Modal' })).toBeInTheDocument();
  });

  it('opens and displays the modal when trigger is clicked', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    await expect.element(screen.getByRole('button', { name: 'Create speaker' })).toBeInTheDocument();
    await expect.element(screen.getByLabelText('Email')).toBeInTheDocument();
    await expect.element(screen.getByLabelText('Full Name')).toBeInTheDocument();
    await expect.element(screen.getByLabelText('Company')).toBeInTheDocument();
    await expect.element(screen.getByLabelText('Biography')).toBeInTheDocument();
  });

  it('has required validation for email and name fields', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    const emailInput = screen.getByLabelText('Email');
    const nameInput = screen.getByLabelText('Full Name');

    await expect.element(emailInput).toBeRequired();
    await expect.element(nameInput).toBeRequired();
  });

  it('shows email type validation for email field', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Modal' }));

    const emailInput = screen.getByLabelText('Email');
    await expect.element(emailInput).toHaveAttribute('type', 'email');
  });
});
