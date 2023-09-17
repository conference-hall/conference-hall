import BasePage from '../../../page-objects/base.page.ts';

class TracksSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/tracks`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Formats' }).should('exist');
  }

  formatsRequired() {
    cy.findByLabelText('Format selection required').click();
  }

  newFormat() {
    return cy.findByRole('button', { name: 'New format' });
  }

  newFormatModal() {
    return cy.findByRole('dialog', { name: 'Format track' });
  }

  categoriesRequired() {
    cy.findByLabelText('Category selection required').click();
  }

  newCategory() {
    return cy.findByRole('button', { name: 'New category' });
  }

  newCategoryModal() {
    return cy.findByRole('dialog', { name: 'Category track' });
  }
}

export default TracksSettings;
