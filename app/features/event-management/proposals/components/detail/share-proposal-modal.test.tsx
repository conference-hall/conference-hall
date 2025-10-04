import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { ShareProposalModal } from './share-proposal-modal.tsx';

describe('ShareProposalModal component', () => {
  const defaultProps = {
    open: true,
    onClose: () => {},
  };

  const renderComponent = (props = defaultProps) => {
    const RouteStub = createRoutesStub([
      {
        path: '/team/:team/:event/proposals/:proposal',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <ShareProposalModal {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub initialEntries={['/team/my-team/my-event/proposals/proposal-123']} />);
  };

  it('displays the modal with title', async () => {
    const screen = renderComponent();

    const dialog = screen.getByRole('dialog', { name: 'Share proposal' });
    await expect.element(dialog).toBeInTheDocument();
  });

  it('displays organizer link', async () => {
    const screen = renderComponent();

    const dialog = screen.getByRole('dialog');
    await expect.element(dialog.getByText('Organizer link')).toBeInTheDocument();

    const organizerInput = screen.getByRole('textbox', { name: 'Organizer link' });
    await expect
      .element(organizerInput)
      .toHaveValue(expect.stringContaining('/team/my-team/my-event/proposals/proposal-123'));
  });

  it('displays speaker link', async () => {
    const screen = renderComponent();

    const dialog = screen.getByRole('dialog');
    await expect.element(dialog.getByText('Speaker link')).toBeInTheDocument();

    const speakerInput = screen.getByRole('textbox', { name: 'Speaker link' });
    await expect.element(speakerInput).toHaveValue(expect.stringContaining('/my-event/proposals/proposal-123'));
  });
});
