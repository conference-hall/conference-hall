import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { ProposalActionsMenu } from './proposal-actions-menu.tsx';

describe('ProposalActionsMenu component', () => {
  const defaultProps = {
    proposal: {
      title: 'Test Proposal',
      abstract: 'Test abstract',
      references: null,
      languages: ['en'],
      level: 'BEGINNER' as const,
    },
    errors: null,
    canEditEventProposal: true,
  };

  const renderComponent = (props = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/team/:team/:event/proposals/:proposal',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <ProposalActionsMenu {...defaultProps} {...props} />
          </I18nextProvider>
        ),
      },
    ]);
    return render(<RouteStub initialEntries={['/team/my-team/my-event/proposals/proposal-123']} />);
  };

  it('opens menu and shows actions', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Proposal action menu' }));
    await expect.element(screen.getByRole('menuitem', { name: /Edit/ })).toBeInTheDocument();
    await expect.element(screen.getByRole('menuitem', { name: /Share link/ })).toBeInTheDocument();
  });

  it('opens TalkEditDrawer when clicking Edit', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Proposal action menu' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /Edit/ }));

    await expect.element(screen.getByRole('dialog', { name: 'Test Proposal' })).toBeInTheDocument();
  });

  it('opens ShareProposalModal when clicking Share link', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Proposal action menu' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /Share link/ }));

    await expect.element(screen.getByRole('dialog', { name: 'Share proposal' })).toBeInTheDocument();
  });

  it('hides Edit action when canEditEventProposal is false', async () => {
    const screen = renderComponent({ canEditEventProposal: false });

    await userEvent.click(screen.getByRole('button', { name: 'Proposal action menu' }));
    await expect.element(screen.getByRole('menuitem', { name: /Edit/ })).not.toBeInTheDocument();
    await expect.element(screen.getByRole('menuitem', { name: /Share link/ })).toBeInTheDocument();
  });
});
