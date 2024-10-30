import BasePage from '../../base.page.ts';

class TagsSettings extends BasePage {
  visit(slug: string, eventSlug: string) {
    cy.visitAndCheck(`/team/${slug}/${eventSlug}/settings/tags`);
    this.isPageVisible();
  }

  isPageVisible() {
    cy.findByRole('heading', { name: 'Proposal tags' }).should('exist');
  }

  newTag() {
    return cy.findByRole('button', { name: 'New tag' });
  }

  editTag() {
    return cy.findByRole('button', { name: 'Edit' });
  }

  deleteTag() {
    return cy.findByRole('button', { name: 'Delete' });
  }

  createTag(name: string) {
    cy.typeOn('Tag name', name);
    cy.findByRole('button', { name: 'Create tag' }).click();
  }

  saveTag(name: string) {
    cy.typeOn('Tag name', name);
    cy.findByRole('button', { name: 'Save tag' }).click();
  }

  searchTag(name: string) {
    cy.typeOn('Search tags', `${name}{enter}`);
  }

  tag(name: string) {
    return cy.findByRole('link', { name });
  }
}

export default TagsSettings;
