import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { ProposalActionsMenu } from './proposal-actions-menu.tsx';

describe('ProposalActionsMenu component', () => {
  const defaultProps = {
    team: 'my-team',
    event: 'my-event',
    proposal: {
      id: '123',
      routeId: '123',
      title: 'Test Proposal',
      abstract: 'Test abstract',
      references: null,
      languages: ['en'],
      level: 'BEGINNER' as const,
      archivedAt: null,
    },
    errors: null,
    canEditEventProposal: true,
    canArchiveProposal: true,
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

  it('shows Archive action when canArchiveProposal is true and proposal is not archived', async () => {
    await renderComponent();

    const button = page.getByRole('button', { name: 'Proposal action menu' });
    await button.click();
    await expect.element(page.getByRole('button', { name: /Archive/ })).toBeInTheDocument();
  });

  it('shows Restore action when canArchiveProposal is true and proposal is archived', async () => {
    await renderComponent({
      proposal: {
        ...defaultProps.proposal,
        archivedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    });

    const button = page.getByRole('button', { name: 'Proposal action menu' });
    await button.click();
    await expect.element(page.getByRole('button', { name: /Restore/ })).toBeInTheDocument();
  });

  it('hides Archive/Restore action when canArchiveProposal is false', async () => {
    await renderComponent({ canArchiveProposal: false });

    const button = page.getByRole('button', { name: 'Proposal action menu' });
    await button.click();
    await expect.element(page.getByRole('button', { name: /Archive/ })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: /Restore/ })).not.toBeInTheDocument();
  });
});
