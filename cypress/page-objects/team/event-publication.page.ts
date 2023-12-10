import BasePage from '../base.page.ts';

class PublicationPage extends BasePage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}/publication`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Deliberation', level: 1 }).should('exist');
  }

  publishAcceptedCard() {
    return cy.findByTestId('publish-accepted');
  }

  publishAccepted() {
    const modal = new PublishAcceptedModal();
    modal.visit(this);
    return modal;
  }

  publishRejectedCard() {
    return cy.findByTestId('publish-rejected');
  }

  publishRejected() {
    const modal = new PublishRejectedModal();
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
    return cy.findByRole('definition', { name: 'Waiting for confirmation' });
  }

  totalConfirmed() {
    return cy.findByRole('definition', { name: 'Confirmed by speakers' });
  }

  totalDeclined() {
    return cy.findByRole('definition', { name: 'Declined by speakers' });
  }
}

class PublishAcceptedModal {
  visit(from: PublicationPage) {
    from
      .publishAcceptedCard()
      .findByRole('link', { name: /^Publish results.*/i })
      .click();
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Accepted proposals publication' }).should('exist');
  }

  confirm() {
    return cy.findByRole('button', { name: 'Confirm results publication' }).click();
  }
}

class PublishRejectedModal {
  visit(from: PublicationPage) {
    from
      .publishRejectedCard()
      .findByRole('link', { name: /^Publish results.*/i })
      .click();
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Rejected proposals publication' }).should('exist');
  }

  confirm() {
    return cy.findByRole('button', { name: 'Confirm results publication' }).click();
  }
}

export default PublicationPage;
