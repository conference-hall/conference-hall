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

class GeneralSettings {
  visit(slug: string, eventSlug: string) {
    cy.visit(`/organizer/${slug}/${eventSlug}/settings`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'General' }).should('exist');
  }

  generalBlock() {
    return cy.findByRole('heading', { name: 'General' }).parent();
  }

  saveGeneralForm(data: GeneralFormType) {
    this.generalBlock().within(() => {
      if (data.name) cy.typeOn('Name', data.name);
      if (data.slug) cy.typeOn('Event URL', data.slug);
      if (data.visibility) cy.findByRole('radio', { name: data.visibility }).click();
      cy.findByRole('button', { name: 'Update event' }).click();
    });
  }

  detailsBlock() {
    return cy.findByRole('heading', { name: 'Event details' }).parent();
  }

  saveDetailsForm(data: DetailFormType) {
    this.detailsBlock().within(() => {
      if (data.startDate) cy.typeOn('Start date', data.startDate);
      if (data.endDate) cy.typeOn('End date', data.endDate);
      if (data.address) cy.typeOn('Venue address or city', data.address);
      if (data.description) cy.typeOn('Description', data.description);
      if (data.websiteUrl) cy.typeOn('Website URL', data.websiteUrl);
      if (data.contactEmail) cy.typeOn('Contact email', data.contactEmail);
      cy.findByRole('button', { name: 'Update event details' }).click();
    });
  }
}

export default GeneralSettings;
