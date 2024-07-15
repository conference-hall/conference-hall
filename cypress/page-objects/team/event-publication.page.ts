import BasePage from '../base.page.ts';

class PublicationPage extends BasePage {
  visit(teamSlug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${teamSlug}/${eventSlug}/publication`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Publication', level: 1 }).should('exist');
  }

  dashboardCard(name: string) {
    return cy.findByLabelText(name);
  }

  cardActionLink(name: RegExp) {
    return cy.findByRole('link', { name });
  }

  publish(name: RegExp) {
    cy.findByRole('button', { name }).click();
    return new PublicationModal();
  }

  publishRejected() {
    const modal = new PublicationModal();
    return modal;
  }
}

class PublicationModal {
  confirm() {
    return cy.findByRole('button', { name: 'Confirm results publication' }).click();
  }
}

export default PublicationPage;
