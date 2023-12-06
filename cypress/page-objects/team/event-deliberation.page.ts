import BasePage from '../base.page.ts';

class DeliberationPage extends BasePage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}/deliberation`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Deliberation' }).should('exist');
  }

  announceAcceptedCard() {
    return cy.findByTestId('announce-accepted');
  }

  announceAccepted() {
    const modal = new AnnounceAcceptedModal();
    modal.visit(this);
    return modal;
  }

  announceRejectedCard() {
    return cy.findByTestId('announce-rejected');
  }

  announceRejected() {
    const modal = new AnnounceRejectedModal();
    modal.visit(this);
    return modal;
  }

  totalProposals() {
    return cy.findByRole('definition', { name: 'Total proposals' });
  }

  totalAccepted() {
    return cy.findByRole('definition', { name: 'Accepted proposals' });
  }

  totalRejected() {
    return cy.findByRole('definition', { name: 'Rejected proposals' });
  }

  totalNotDeliberated() {
    return cy.findByRole('definition', { name: 'Pending proposals' });
  }

  totalConfirmations() {
    return cy.findByRole('definition', { name: 'Total published' });
  }

  totalNoResponse() {
    return cy.findByRole('definition', { name: 'No response yet' });
  }

  totalConfirmed() {
    return cy.findByRole('definition', { name: 'Confirmed by speakers' });
  }

  totalDeclined() {
    return cy.findByRole('definition', { name: 'Declined by speakers' });
  }
}

class AnnounceAcceptedModal {
  visit(from: DeliberationPage) {
    from
      .announceAcceptedCard()
      .findByRole('link', { name: /^Publish results.*/i })
      .click();
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Accepted proposals announcement' }).should('exist');
  }

  confirm() {
    return cy.findByRole('button', { name: 'Confirm results announcement' }).click();
  }
}

class AnnounceRejectedModal {
  visit(from: DeliberationPage) {
    from
      .announceRejectedCard()
      .findByRole('link', { name: /^Publish results.*/i })
      .click();
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Rejected proposals announcement' }).should('exist');
  }

  confirm() {
    return cy.findByRole('button', { name: 'Confirm results announcement' }).click();
  }
}

export default DeliberationPage;
