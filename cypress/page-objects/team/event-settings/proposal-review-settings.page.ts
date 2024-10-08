import BasePage from '../../../page-objects/base.page.ts';

class ProposalReviewSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/review`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Enable proposals reviews' }).should('exist');
  }

  toggleReview(checked: boolean) {
    return cy.findByRole('switch', { name: 'Proposals review activation', checked });
  }

  toggleDisplayReviews(checked: boolean) {
    return cy.findByRole('switch', { name: 'Display reviews of all team members', checked });
  }

  toggleDisplaySpeakers(checked: boolean) {
    return cy.findByRole('switch', { name: 'Display speakers in review pages', checked });
  }
}

export default ProposalReviewSettings;
