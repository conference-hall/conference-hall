import BasePage from 'page-objects/base.page';

type OrganizationNewType = {
  name?: string;
  slug?: string;
};

class OrganizationNewPage extends BasePage {
  visit() {
    cy.visit(`/organizer`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Create a new organization' }).should('exist');
  }

  fillForm(data: OrganizationNewType) {
    if (data.name) cy.typeOn('Organization name', data.name);
    if (data.slug) cy.typeOn('Organization URL', data.slug);
  }

  newOrganization() {
    return cy.findByRole('button', { name: 'New organization' });
  }

  error(label: string) {
    return cy
      .findByLabelText(label)
      .invoke('attr', 'id')
      .then((id) => {
        return cy.get(`#${id}-description`);
      });
  }
}

export default OrganizationNewPage;
