type SettingsFormType = {
  name?: string;
  slug?: string;
};

class OrganizationSettingsPage {
  visit(slug: string) {
    cy.visit(`/organizer/${slug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Organization settings' }).should('exist');
  }

  fillSettingsForm(data: SettingsFormType) {
    if (data.name) cy.typeOn('Organization name', data.name);
    if (data.slug) cy.typeOn('Organization URL', data.slug);
  }

  saveAbstract() {
    return cy.findByRole('button', { name: 'Save' });
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

export default OrganizationSettingsPage;
