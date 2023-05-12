import BasePage from 'page-objects/base.page';

class ProposalReviewSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/team/${slug}/${eventSlug}/settings/review`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposals review' }).should('exist');
  }

  toggleReview(checked: boolean) {
    return cy.findByRole('switch', { name: 'Proposals review activation', checked });
  }

  toggleDisplayReviews(checked: boolean) {
    return cy.findByRole('switch', { name: 'Display ratings of other reviewers', checked });
  }

  toggleDisplaySpeakers(checked: boolean) {
    return cy.findByRole('switch', { name: 'Display speakers in proposal page', checked });
  }
}

export default ProposalReviewSettings;
