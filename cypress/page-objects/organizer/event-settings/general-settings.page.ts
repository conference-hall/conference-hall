import BasePage from 'page-objects/base.page';

type GeneralFormType = {
  name?: string;
  slug?: string;
  visibility?: 'Private' | 'Public';
};

type DetailFormType = {
  startDate?: string;
  endDate?: string;
  address?: string;
  description?: string;
  websiteUrl?: string;
  contactEmail?: string;
};

class GeneralSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'General' }).should('exist');
  }

  saveGeneralForm(data: GeneralFormType) {
    if (data.name) cy.typeOn('Name', data.name);
    if (data.slug) cy.typeOn('Event URL', data.slug);
    if (data.visibility) cy.findByRole('radio', { name: data.visibility }).click();
    cy.findByRole('button', { name: 'Update event' }).click();
  }

  saveDetailsForm(data: DetailFormType) {
    if (data.startDate) cy.typeOn('Start date', data.startDate);
    if (data.endDate) cy.typeOn('End date', data.endDate);
    if (data.address) cy.typeOn('Venue address or city', data.address);
    if (data.description) cy.typeOn('Description', data.description);
    if (data.websiteUrl) cy.typeOn('Website URL', data.websiteUrl);
    if (data.contactEmail) cy.typeOn('Contact email', data.contactEmail);
    cy.findByRole('button', { name: 'Update event details' }).click();
  }

  archive() {
    cy.findByRole('button', { name: 'Archive event' }).click();
  }

  restore() {
    cy.findByRole('button', { name: 'Restore event' }).click();
  }
}

export default GeneralSettings;
