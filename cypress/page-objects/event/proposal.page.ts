import BasePage from 'page-objects/base.page';

class EventProposalPage extends BasePage {
  visit(slug: string, proposalId: string) {
    cy.visit(`/${slug}/proposals/${proposalId}`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Abstract' }).should('exist');
  }

  editProposal() {
    return cy.findByRole('link', { name: 'Edit proposal' });
  }

  submitProposal() {
    return cy.findByRole('link', { name: 'Continue submission' });
  }

  confirmProposal() {
    return cy.findByRole('button', { name: 'Confirm' });
  }

  declineProposal() {
    return cy.findByRole('button', { name: 'Decline' });
  }

  deleteProposal() {
    return cy.findByRole('button', { name: 'Delete proposal' });
  }

  deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: 'Are you sure you want to delete your proposal?' });
  }

  cancelDelete() {
    return this.deleteConfirmDialog().findByRole('button', { name: 'Cancel' });
  }

  confirmDelete() {
    return this.deleteConfirmDialog().findByRole('button', { name: 'Delete proposal' });
  }
}

export default EventProposalPage;
