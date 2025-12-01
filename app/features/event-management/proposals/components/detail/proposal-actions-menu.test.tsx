import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
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
    return page.render(<RouteStub initialEntries={['/team/my-team/my-event/proposals/proposal-123']} />);
  };

  it('opens menu and shows actions', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: 'Proposal action menu' });
    await element.click();
    await expect.element(page.getByRole('menuitem', { name: /Edit/ })).toBeInTheDocument();
    await expect.element(page.getByRole('menuitem', { name: /Share link/ })).toBeInTheDocument();
  });

  it('opens TalkEditDrawer when clicking Edit', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: 'Proposal action menu' });
    await element.click();
    const element1 = page.getByRole('menuitem', { name: /Edit/ });
    await element1.click();

    await expect.element(page.getByRole('dialog', { name: 'Test Proposal' })).toBeInTheDocument();
  });

  it('opens ShareProposalModal when clicking Share link', async () => {
    await renderComponent();

    const element = page.getByRole('button', { name: 'Proposal action menu' });
    await element.click();
    const element1 = page.getByRole('menuitem', { name: /Share link/ });
    await element1.click();

    await expect.element(page.getByRole('dialog', { name: 'Share proposal' })).toBeInTheDocument();
  });

  it('hides Edit action when canEditEventProposal is false', async () => {
    await renderComponent({ canEditEventProposal: false });

    const element = page.getByRole('button', { name: 'Proposal action menu' });
    await element.click();
    await expect.element(page.getByRole('menuitem', { name: /Edit/ })).not.toBeInTheDocument();
    await expect.element(page.getByRole('menuitem', { name: /Share link/ })).toBeInTheDocument();
  });
});
