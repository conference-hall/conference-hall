import BasePage from '../../../page-objects/base.page.ts';

class TracksSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/tracks`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Formats' }).should('exist');
  }

  formatsRequired(checked?: boolean) {
    return cy.findByRole('switch', { name: 'Format selection required', checked });
  }

  formatsAllowMultiple(checked?: boolean) {
    return cy.findByRole('switch', { name: 'Allow multiple formats', checked });
  }

  newFormat() {
    return cy.findByRole('button', { name: 'New format' });
  }

  newFormatModal() {
    return cy.findByRole('dialog', { name: 'Format track' });
  }

  categoriesRequired(checked?: true) {
    return cy.findByRole('switch', { name: 'Category selection required', checked });
  }

  categoriesAllowMultiple(checked?: true) {
    return cy.findByRole('switch', { name: 'Allow multiple categories', checked });
  }

  newCategory() {
    return cy.findByRole('button', { name: 'New category' });
  }

  newCategoryModal() {
    return cy.findByRole('dialog', { name: 'Category track' });
  }
}

export default TracksSettings;
